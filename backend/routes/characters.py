from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
import pandas as pd
import io
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.character import Character, CharacterCreate, CharacterUpdate, Stats, Stat, Hissatsu, TeamPassive
from database import get_database

router = APIRouter(prefix="/characters", tags=["characters"])

@router.get("/", response_model=List[Character])
async def get_characters(
    skip: int = 0,
    limit: int = 100,
    position: Optional[str] = None,
    element: Optional[str] = None,
    search: Optional[str] = None
):
    """Get all characters with optional filtering"""
    db = await get_database()
    
    # Build query
    query = {}
    if position and position != "all":
        query["position"] = position
    if element and element != "all":
        query["element"] = element
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"nickname": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.characters.find(query).skip(skip).limit(limit)
    characters = await cursor.to_list(length=limit)
    
    return [Character(**char) for char in characters]

@router.get("/{character_id}", response_model=Character)
async def get_character(character_id: str):
    """Get a specific character by ID"""
    db = await get_database()
    
    character = await db.characters.find_one({"id": character_id})
    if not character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    return Character(**character)

@router.post("/", response_model=Character)
async def create_character(character: CharacterCreate):
    """Create a new character"""
    db = await get_database()
    
    # Create character with generated ID
    new_character = Character(**character.dict())
    
    # Insert into database
    await db.characters.insert_one(new_character.dict())
    
    return new_character

@router.put("/{character_id}", response_model=Character)
async def update_character(character_id: str, character_update: CharacterUpdate):
    """Update a character"""
    db = await get_database()
    
    # Check if character exists
    existing_character = await db.characters.find_one({"id": character_id})
    if not existing_character:
        raise HTTPException(status_code=404, detail="Character not found")
    
    # Update only provided fields
    update_data = character_update.dict(exclude_unset=True)
    
    await db.characters.update_one(
        {"id": character_id},
        {"$set": update_data}
    )
    
    # Return updated character
    updated_character = await db.characters.find_one({"id": character_id})
    return Character(**updated_character)

@router.delete("/{character_id}")
async def delete_character(character_id: str):
    """Delete a character"""
    db = await get_database()
    
    result = await db.characters.delete_one({"id": character_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Character not found")
    
    return {"message": "Character deleted successfully"}

@router.post("/import-excel")
async def import_characters_from_excel(file: UploadFile = File(...)):
    """Import characters from Excel file"""
    if not file.filename.endswith(('.xlsx', '.xls', '.csv')):
        raise HTTPException(status_code=400, detail="File must be Excel (.xlsx, .xls) or CSV (.csv)")
    
    try:
        # Read file content
        content = await file.read()
        
        # Parse Excel/CSV
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(content.decode('utf-8')))
        else:
            df = pd.read_excel(io.BytesIO(content))
        
        db = await get_database()
        imported_count = 0
        errors = []
        
        for index, row in df.iterrows():
            try:
                # Map Excel columns to character model
                character_data = {
                    "name": str(row.get('name', row.get('Name', f'Character {index}'))),
                    "nickname": str(row.get('nickname', row.get('Nickname', row.get('name', 'Unknown')))),
                    "title": str(row.get('title', row.get('Title', 'Player'))),
                    "base_level": int(row.get('level', row.get('Level', 1))),
                    "base_rarity": str(row.get('rarity', row.get('Rarity', 'Common'))),
                    "position": str(row.get('position', row.get('Position', 'MF'))),
                    "element": str(row.get('element', row.get('Element', 'Fire'))),
                    "jersey_number": int(row.get('jersey_number', row.get('Jersey', index + 1))),
                    "description": str(row.get('description', row.get('Description', 'A talented player'))),
                    "base_stats": {
                        "kick": {"main": int(row.get('kick', 50)), "secondary": int(row.get('kick_secondary', 100))},
                        "control": {"main": int(row.get('control', 50)), "secondary": int(row.get('control_secondary', 100))},
                        "technique": {"main": int(row.get('technique', 50)), "secondary": int(row.get('technique_secondary', 100))},
                        "intelligence": {"main": int(row.get('intelligence', 50)), "secondary": int(row.get('intelligence_secondary', 100))},
                        "pressure": {"main": int(row.get('pressure', 50)), "secondary": int(row.get('pressure_secondary', 100))},
                        "agility": {"main": int(row.get('agility', 50)), "secondary": int(row.get('agility_secondary', 100))},
                        "physical": {"main": int(row.get('physical', 50)), "secondary": int(row.get('physical_secondary', 100))}
                    },
                    "hissatsu": [
                        {
                            "name": str(row.get('hissatsu_1', 'Basic Shot')),
                            "description": str(row.get('hissatsu_1_desc', 'A basic shooting technique')),
                            "type": "Shot"
                        },
                        {
                            "name": str(row.get('hissatsu_2', 'Basic Dribble')),
                            "description": str(row.get('hissatsu_2_desc', 'A basic dribbling technique')),
                            "type": "Dribble"
                        },
                        {
                            "name": str(row.get('hissatsu_3', 'Basic Pass')),
                            "description": str(row.get('hissatsu_3_desc', 'A basic passing technique')),
                            "type": "Pass"
                        }
                    ],
                    "team_passives": [
                        {
                            "name": str(row.get('passive_1', 'Team Spirit')),
                            "description": str(row.get('passive_1_desc', 'Boosts team morale'))
                        },
                        {
                            "name": str(row.get('passive_2', 'Leadership')),
                            "description": str(row.get('passive_2_desc', 'Enhances team coordination'))
                        },
                        {
                            "name": str(row.get('passive_3', 'Focus')),
                            "description": str(row.get('passive_3_desc', 'Improves concentration'))
                        },
                        {
                            "name": str(row.get('passive_4', 'Determination')),
                            "description": str(row.get('passive_4_desc', 'Never gives up'))
                        },
                        {
                            "name": str(row.get('passive_5', 'Synergy')),
                            "description": str(row.get('passive_5_desc', 'Works well with teammates'))
                        }
                    ]
                }
                
                # Create character
                character = Character(**character_data)
                
                # Check if character already exists
                existing = await db.characters.find_one({"name": character.name})
                if existing:
                    # Update existing character
                    await db.characters.update_one(
                        {"name": character.name},
                        {"$set": character.dict()}
                    )
                else:
                    # Insert new character
                    await db.characters.insert_one(character.dict())
                
                imported_count += 1
                
            except Exception as e:
                errors.append(f"Row {index + 1}: {str(e)}")
        
        return {
            "message": f"Successfully imported {imported_count} characters",
            "imported_count": imported_count,
            "errors": errors[:10]  # Limit error messages
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@router.get("/stats/summary")
async def get_character_stats():
    """Get character statistics summary"""
    db = await get_database()
    
    total_characters = await db.characters.count_documents({})
    
    # Group by position
    position_pipeline = [
        {"$group": {"_id": "$position", "count": {"$sum": 1}}}
    ]
    position_stats = await db.characters.aggregate(position_pipeline).to_list(None)
    
    # Group by element
    element_pipeline = [
        {"$group": {"_id": "$element", "count": {"$sum": 1}}}
    ]
    element_stats = await db.characters.aggregate(element_pipeline).to_list(None)
    
    # Group by rarity
    rarity_pipeline = [
        {"$group": {"_id": "$base_rarity", "count": {"$sum": 1}}}
    ]
    rarity_stats = await db.characters.aggregate(rarity_pipeline).to_list(None)
    
    return {
        "total_characters": total_characters,
        "by_position": {stat["_id"]: stat["count"] for stat in position_stats},
        "by_element": {stat["_id"]: stat["count"] for stat in element_stats},
        "by_rarity": {stat["_id"]: stat["count"] for stat in rarity_stats}
    }