from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.equipment import EquipmentItem, EquipmentCreate
from database import get_database

router = APIRouter(prefix="/equipment", tags=["equipment"])

@router.get("/", response_model=List[EquipmentItem])
async def get_equipment(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    rarity: Optional[str] = None
):
    """Get all equipment with optional filtering"""
    db = await get_database()
    
    # Build query
    query = {}
    if category and category != "all":
        query["category"] = category
    if rarity and rarity != "all":
        query["rarity"] = rarity
    
    cursor = db.equipment.find(query).skip(skip).limit(limit)
    equipment = await cursor.to_list(length=limit)
    
    return [EquipmentItem(**item) for item in equipment]

@router.get("/{equipment_id}", response_model=EquipmentItem)
async def get_equipment_item(equipment_id: str):
    """Get a specific equipment item by ID"""
    db = await get_database()
    
    equipment = await db.equipment.find_one({"id": equipment_id})
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    
    return EquipmentItem(**equipment)

@router.get("/category/{category}", response_model=List[EquipmentItem])
async def get_equipment_by_category(category: str):
    """Get all equipment items in a specific category"""
    db = await get_database()
    
    cursor = db.equipment.find({"category": category})
    equipment = await cursor.to_list(length=None)
    
    return [EquipmentItem(**item) for item in equipment]

@router.post("/", response_model=EquipmentItem)
async def create_equipment(equipment: EquipmentCreate):
    """Create a new equipment item"""
    db = await get_database()
    
    # Create equipment with generated ID
    new_equipment = EquipmentItem(**equipment.dict())
    
    # Insert into database
    await db.equipment.insert_one(new_equipment.dict())
    
    return new_equipment