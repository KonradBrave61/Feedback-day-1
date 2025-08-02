from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from models.technique import (
    Technique, TechniqueCreate, TechniqueUpdate, 
    CharacterTechnique, LearnTechniqueRequest, EquipTechniqueRequest
)
from models.user import User
from routes.auth import get_current_user
from database import get_database
from data.sample_techniques import sample_techniques
import uuid

router = APIRouter()

@router.get("/techniques/", response_model=List[Technique])
async def get_all_techniques(
    technique_type: Optional[str] = None,
    category: Optional[str] = None,
    element: Optional[str] = None,
    rarity: Optional[str] = None,
    min_power: Optional[int] = None,
    max_power: Optional[int] = None,
    position: Optional[str] = None,  # Filter by allowed position
    search: Optional[str] = None
):
    """
    Get all techniques with optional filtering
    """
    db = await get_database()
    collection = db.techniques
    
    # Initialize database with sample data if empty
    count = await collection.count_documents({})
    if count == 0:
        techniques_to_insert = []
        for tech_data in sample_techniques:
            technique = Technique(**tech_data)
            techniques_to_insert.append(technique.dict())
        
        if techniques_to_insert:
            await collection.insert_many(techniques_to_insert)
    
    # Build filter query
    query = {}
    
    if technique_type:
        query["technique_type"] = technique_type
    
    if category:
        query["category"] = category
        
    if element:
        query["element"] = element
        
    if rarity:
        query["rarity"] = rarity
        
    if min_power:
        query["power"] = {"$gte": min_power}
        
    if max_power:
        if "power" in query:
            query["power"]["$lte"] = max_power
        else:
            query["power"] = {"$lte": max_power}
    
    if position:
        # Find techniques that either allow all positions (empty array) or include this position
        query["$or"] = [
            {"allowed_positions": []},
            {"allowed_positions": position}
        ]
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    techniques = await collection.find(query).to_list(1000)
    return [Technique(**tech) for tech in techniques]

@router.get("/techniques/{technique_id}", response_model=Technique)
async def get_technique_by_id(technique_id: str):
    """
    Get a specific technique by ID
    """
    db = await get_database()
    collection = db.techniques
    
    technique = await collection.find_one({"id": technique_id})
    if not technique:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technique not found"
        )
    
    return Technique(**technique)

@router.post("/techniques/", response_model=Technique)
async def create_technique(technique_data: TechniqueCreate):
    """
    Create a new technique
    """
    db = await get_database()
    collection = db.techniques
    
    technique = Technique(**technique_data.dict())
    
    await collection.insert_one(technique.dict())
    return technique

@router.get("/techniques/categories/stats")
async def get_technique_stats():
    """
    Get statistics about techniques (counts by category, element, etc.)
    """
    db = await get_database()
    collection = db.techniques
    
    # Aggregate statistics
    pipeline = [
        {
            "$group": {
                "_id": None,
                "total_techniques": {"$sum": 1},
                "by_type": {"$addToSet": "$technique_type"},
                "by_category": {"$addToSet": "$category"},
                "by_element": {"$addToSet": "$element"},
                "by_rarity": {"$addToSet": "$rarity"},
                "avg_power": {"$avg": "$power"},
                "max_power": {"$max": "$power"},
                "min_power": {"$min": "$power"}
            }
        }
    ]
    
    result = await collection.aggregate(pipeline).to_list(1)
    if not result:
        return {
            "total_techniques": 0,
            "by_type": [],
            "by_category": [],
            "by_element": [],
            "by_rarity": [],
            "avg_power": 0,
            "max_power": 0,
            "min_power": 0
        }
    
    return result[0]

@router.post("/characters/{character_id}/learn-technique")
async def learn_technique(
    character_id: str,
    request: LearnTechniqueRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Character learns a new technique
    """
    db = await get_database()
    
    # Check if technique exists
    technique = await db.techniques.find_one({"id": request.technique_id})
    if not technique:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Technique not found"
        )
    
    # Check if character exists (you might want to add character ownership validation)
    character = await db.characters.find_one({"id": character_id})
    if not character:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character not found"
        )
    
    # Check if technique is already learned
    existing = await db.character_techniques.find_one({
        "character_id": character_id,
        "technique_id": request.technique_id
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Character already knows this technique"
        )
    
    # Check position restrictions
    technique_obj = Technique(**technique)
    if (technique_obj.allowed_positions and 
        character["position"] not in technique_obj.allowed_positions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"This technique can only be learned by {', '.join(technique_obj.allowed_positions)} players"
        )
    
    # Create character-technique relationship
    char_technique = CharacterTechnique(
        character_id=character_id,
        technique_id=request.technique_id
    )
    
    await db.character_techniques.insert_one(char_technique.dict())
    
    return {"message": "Technique learned successfully", "technique_name": technique["name"]}

@router.get("/characters/{character_id}/techniques", response_model=List[dict])
async def get_character_techniques(
    character_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get all techniques learned by a character
    """
    db = await get_database()
    
    # Get character-technique relationships
    char_techniques = await db.character_techniques.find({
        "character_id": character_id
    }).to_list(1000)
    
    if not char_techniques:
        return []
    
    # Get technique details
    technique_ids = [ct["technique_id"] for ct in char_techniques]
    techniques = await db.techniques.find({
        "id": {"$in": technique_ids}
    }).to_list(1000)
    
    # Combine data
    result = []
    for char_tech in char_techniques:
        technique = next((t for t in techniques if t["id"] == char_tech["technique_id"]), None)
        if technique:
            result.append({
                "character_technique": char_tech,
                "technique": technique
            })
    
    return result

@router.delete("/characters/{character_id}/techniques/{technique_id}")
async def forget_technique(
    character_id: str,
    technique_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Character forgets a learned technique
    """
    db = await get_database()
    
    result = await db.character_techniques.delete_one({
        "character_id": character_id,
        "technique_id": technique_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Character doesn't know this technique"
        )
    
    return {"message": "Technique forgotten successfully"}