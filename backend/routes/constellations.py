from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Dict, Any
import random
from datetime import datetime
from models.constellation import (
    Constellation, ConstellationCreate, ConstellationOrb, CharacterPool, DropRates,
    GachaPull, GachaPullRequest, GachaPullResult, PlatformBonus
)
from models.character import Character
from models.user import User
from database import get_database
from routes.auth import get_current_user

router = APIRouter(prefix="/constellations", tags=["constellations"])

# Sample constellation data with orb positions
SAMPLE_CONSTELLATIONS = [
    {
        "name": "Lightning Constellation",
        "element": "Lightning",
        "description": "Home to electric-powered characters with lightning-fast abilities",
        "background_color": "#1a1a2e",
        "orb_color": "#ffd700",
        "orbs": [
            {"id": "orb1", "x": 20, "y": 30, "z": 0, "is_active": True, "glow_intensity": 1.0},
            {"id": "orb2", "x": 40, "y": 20, "z": 0, "is_active": True, "glow_intensity": 1.2},
            {"id": "orb3", "x": 60, "y": 35, "z": 0, "is_active": True, "glow_intensity": 0.8},
            {"id": "orb4", "x": 25, "y": 60, "z": 0, "is_active": True, "glow_intensity": 1.1},
            {"id": "orb5", "x": 45, "y": 50, "z": 0, "is_active": True, "glow_intensity": 0.9},
            {"id": "orb6", "x": 65, "y": 65, "z": 0, "is_active": True, "glow_intensity": 1.3},
            {"id": "orb7", "x": 50, "y": 80, "z": 0, "is_active": True, "glow_intensity": 1.0}
        ],
        "connections": [
            ["orb1", "orb2"], ["orb2", "orb3"], ["orb1", "orb4"], 
            ["orb4", "orb5"], ["orb5", "orb6"], ["orb3", "orb6"], 
            ["orb5", "orb7"]
        ]
    },
    {
        "name": "Flame Constellation", 
        "element": "Fire",
        "description": "Burning bright with fire-element characters and blazing techniques",
        "background_color": "#2a1810",
        "orb_color": "#ff6b35",
        "orbs": [
            {"id": "orb1", "x": 30, "y": 25, "z": 0, "is_active": True, "glow_intensity": 1.2},
            {"id": "orb2", "x": 50, "y": 15, "z": 0, "is_active": True, "glow_intensity": 1.5},
            {"id": "orb3", "x": 70, "y": 30, "z": 0, "is_active": True, "glow_intensity": 1.0},
            {"id": "orb4", "x": 20, "y": 55, "z": 0, "is_active": True, "glow_intensity": 0.9},
            {"id": "orb5", "x": 50, "y": 45, "z": 0, "is_active": True, "glow_intensity": 1.3},
            {"id": "orb6", "x": 80, "y": 60, "z": 0, "is_active": True, "glow_intensity": 1.1},
            {"id": "orb7", "x": 40, "y": 75, "z": 0, "is_active": True, "glow_intensity": 1.0},
            {"id": "orb8", "x": 60, "y": 70, "z": 0, "is_active": True, "glow_intensity": 0.8}
        ],
        "connections": [
            ["orb1", "orb2"], ["orb2", "orb3"], ["orb1", "orb4"], 
            ["orb4", "orb7"], ["orb2", "orb5"], ["orb5", "orb8"],
            ["orb3", "orb6"], ["orb6", "orb8"], ["orb7", "orb8"]
        ]
    },
    {
        "name": "Wind Constellation",
        "element": "Wind", 
        "description": "Swift and agile characters with wind-based powers soar here",
        "background_color": "#1a2e1a",
        "orb_color": "#4dd0e1",
        "orbs": [
            {"id": "orb1", "x": 35, "y": 20, "z": 0, "is_active": True, "glow_intensity": 1.1},
            {"id": "orb2", "x": 55, "y": 25, "z": 0, "is_active": True, "glow_intensity": 1.0},
            {"id": "orb3", "x": 25, "y": 45, "z": 0, "is_active": True, "glow_intensity": 1.4},
            {"id": "orb4", "x": 65, "y": 40, "z": 0, "is_active": True, "glow_intensity": 0.9},
            {"id": "orb5", "x": 45, "y": 55, "z": 0, "is_active": True, "glow_intensity": 1.2},
            {"id": "orb6", "x": 30, "y": 75, "z": 0, "is_active": True, "glow_intensity": 1.0},
            {"id": "orb7", "x": 60, "y": 70, "z": 0, "is_active": True, "glow_intensity": 0.8}
        ],
        "connections": [
            ["orb1", "orb2"], ["orb1", "orb3"], ["orb2", "orb4"],
            ["orb3", "orb5"], ["orb4", "orb5"], ["orb3", "orb6"],
            ["orb5", "orb7"], ["orb6", "orb7"]
        ]
    }
]

@router.get("/", response_model=List[Constellation])
async def get_constellations():
    """Get all available constellations"""
    db = await get_database()
    
    # Try to get from database first
    cursor = db.constellations.find({})
    constellations = await cursor.to_list(length=None)
    
    if not constellations:
        # Initialize sample constellations if none exist
        await initialize_sample_constellations()
        cursor = db.constellations.find({})
        constellations = await cursor.to_list(length=None)
    
    return [Constellation(**constellation) for constellation in constellations]

@router.get("/{constellation_id}", response_model=Constellation)
async def get_constellation(constellation_id: str):
    """Get a specific constellation by ID"""
    db = await get_database()
    
    constellation = await db.constellations.find_one({"id": constellation_id})
    if not constellation:
        raise HTTPException(status_code=404, detail="Constellation not found")
    
    return Constellation(**constellation)

@router.get("/{constellation_id}/characters")
async def get_constellation_characters(constellation_id: str):
    """Get all characters available in a constellation's pool"""
    db = await get_database()
    
    constellation = await db.constellations.find_one({"id": constellation_id})
    if not constellation:
        raise HTTPException(status_code=404, detail="Constellation not found")
    
    constellation_obj = Constellation(**constellation)
    character_pool = constellation_obj.character_pool
    
    # Get all character IDs from the pool
    all_character_ids = (
        character_pool.legendary + character_pool.epic + 
        character_pool.rare + character_pool.normal
    )
    
    if not all_character_ids:
        return {"legendary": [], "epic": [], "rare": [], "normal": []}
    
    # Fetch characters from database
    cursor = db.characters.find({"id": {"$in": all_character_ids}})
    characters = await cursor.to_list(length=None)
    
    # Organize by rarity
    character_dict = {char["id"]: Character(**char) for char in characters}
    
    result = {
        "legendary": [character_dict[char_id] for char_id in character_pool.legendary if char_id in character_dict],
        "epic": [character_dict[char_id] for char_id in character_pool.epic if char_id in character_dict],
        "rare": [character_dict[char_id] for char_id in character_pool.rare if char_id in character_dict],
        "normal": [character_dict[char_id] for char_id in character_pool.normal if char_id in character_dict]
    }
    
    return result

@router.post("/pull", response_model=GachaPullResult)
async def pull_gacha(
    pull_request: GachaPullRequest,
    current_user: User = Depends(get_current_user)
):
    """Perform gacha pulls from a constellation"""
    db = await get_database()
    
    # Get constellation
    constellation = await db.constellations.find_one({"id": pull_request.constellation_id})
    if not constellation:
        raise HTTPException(status_code=404, detail="Constellation not found")
    
    constellation_obj = Constellation(**constellation)
    
    # Calculate cost
    cost_per_pull = 5  # Kizuna Stars per pull
    total_cost = cost_per_pull * pull_request.pull_count
    
    # Check if user has enough Kizuna Stars
    if current_user.kizuna_stars < total_cost:
        raise HTTPException(
            status_code=400, 
            detail=f"Insufficient Kizuna Stars. Need {total_cost}, have {current_user.kizuna_stars}"
        )
    
    # Calculate drop rates with platform bonuses
    drop_rates = calculate_drop_rates(constellation_obj.base_drop_rates, pull_request.platform_bonuses)
    
    # Perform pulls
    pull_results = []
    characters_obtained = []
    
    for _ in range(pull_request.pull_count):
        rarity = determine_rarity(drop_rates)
        character_id = select_character_from_pool(constellation_obj.character_pool, rarity)
        
        if character_id:
            # Get character details
            character = await db.characters.find_one({"id": character_id})
            if character:
                characters_obtained.append(Character(**character))
                
                # Record pull
                pull_record = GachaPull(
                    user_id=current_user.id,
                    constellation_id=pull_request.constellation_id,
                    character_id=character_id,
                    character_rarity=rarity,
                    platform_bonuses=pull_request.platform_bonuses,
                    kizuna_stars_spent=cost_per_pull
                )
                pull_results.append(pull_record)
    
    # Deduct Kizuna Stars from user
    new_kizuna_stars = current_user.kizuna_stars - total_cost
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"kizuna_stars": new_kizuna_stars}}
    )
    
    # Save pull records
    if pull_results:
        await db.gacha_pulls.insert_many([pull.dict() for pull in pull_results])
    
    return GachaPullResult(
        success=True,
        characters_obtained=[char.dict() for char in characters_obtained],
        kizuna_stars_spent=total_cost,
        kizuna_stars_remaining=new_kizuna_stars,
        platform_bonuses_applied=pull_request.platform_bonuses,
        pull_details=pull_results
    )

def calculate_drop_rates(base_rates: DropRates, platform_bonuses: PlatformBonus) -> DropRates:
    """Calculate final drop rates with platform bonuses applied"""
    # Count active platform bonuses
    active_bonuses = sum([platform_bonuses.nintendo, platform_bonuses.playstation, platform_bonuses.pc])
    
    # Each platform bonus adds 0.2% to legendary rate
    legendary_bonus = active_bonuses * 0.2
    
    # Adjust rates (subtract bonus from normal to maintain 100% total)
    final_rates = DropRates(
        legendary=min(base_rates.legendary + legendary_bonus, 10.0),  # Max 10%
        epic=base_rates.epic,
        rare=base_rates.rare,
        normal=max(base_rates.normal - legendary_bonus, 60.0)  # Min 60%
    )
    
    return final_rates

def determine_rarity(drop_rates: DropRates) -> str:
    """Determine the rarity of the pulled character based on drop rates"""
    rand = random.uniform(0, 100)
    
    if rand < drop_rates.legendary:
        return "legendary"
    elif rand < drop_rates.legendary + drop_rates.epic:
        return "epic"
    elif rand < drop_rates.legendary + drop_rates.epic + drop_rates.rare:
        return "rare"
    else:
        return "normal"

def select_character_from_pool(character_pool: CharacterPool, rarity: str) -> Optional[str]:
    """Select a random character from the appropriate rarity pool"""
    pool_map = {
        "legendary": character_pool.legendary,
        "epic": character_pool.epic,
        "rare": character_pool.rare,
        "normal": character_pool.normal
    }
    
    pool = pool_map.get(rarity, [])
    if not pool:
        return None
    
    return random.choice(pool)

async def initialize_sample_constellations():
    """Initialize the database with sample constellations"""
    db = await get_database()
    
    # Get some sample characters to populate pools
    cursor = db.characters.find({}).limit(30)
    characters = await cursor.to_list(length=30)
    
    if not characters:
        # No characters available, skip initialization
        return
    
    # Organize characters by element and rarity
    characters_by_element = {}
    for char in characters:
        element = char.get("element", "Fire")
        if element not in characters_by_element:
            characters_by_element[element] = {"legendary": [], "epic": [], "rare": [], "normal": []}
        
        rarity = char.get("base_rarity", "Common").lower()
        if rarity == "legendary":
            characters_by_element[element]["legendary"].append(char["id"])
        elif rarity == "epic":
            characters_by_element[element]["epic"].append(char["id"])
        elif rarity == "rare":
            characters_by_element[element]["rare"].append(char["id"])
        else:
            characters_by_element[element]["normal"].append(char["id"])
    
    # Create constellations
    for sample_data in SAMPLE_CONSTELLATIONS:
        element = sample_data["element"]
        
        # Get characters for this element, fallback to Fire if not available
        element_chars = characters_by_element.get(element, characters_by_element.get("Fire", {"legendary": [], "epic": [], "rare": [], "normal": []}))
        
        # Ensure at least one legendary per constellation
        legendary_pool = element_chars["legendary"][:1]  # Max 1 legendary
        if not legendary_pool and element_chars["epic"]:
            legendary_pool = element_chars["epic"][:1]  # Use epic as legendary if needed
        
        character_pool = CharacterPool(
            legendary=legendary_pool,
            epic=element_chars["epic"][:3],
            rare=element_chars["rare"][:8],
            normal=element_chars["normal"][:15]
        )
        
        constellation = Constellation(
            name=sample_data["name"],
            element=sample_data["element"],
            description=sample_data["description"],
            orbs=[ConstellationOrb(**orb) for orb in sample_data["orbs"]],
            character_pool=character_pool,
            base_drop_rates=DropRates(),
            background_color=sample_data["background_color"],
            orb_color=sample_data["orb_color"],
            connections=sample_data["connections"]
        )
        
        # Insert into database
        await db.constellations.insert_one(constellation.dict())

@router.get("/{constellation_id}/drop-rates")
async def get_drop_rates(constellation_id: str, platform_bonuses: str = "000"):
    """Get drop rates for a constellation with platform bonuses applied"""
    db = await get_database()
    
    constellation = await db.constellations.find_one({"id": constellation_id})
    if not constellation:
        raise HTTPException(status_code=404, detail="Constellation not found")
    
    constellation_obj = Constellation(**constellation)
    
    # Parse platform bonuses (e.g., "110" = Nintendo + PS, no PC)
    platform_bonus = PlatformBonus(
        nintendo=len(platform_bonuses) > 0 and platform_bonuses[0] == "1",
        playstation=len(platform_bonuses) > 1 and platform_bonuses[1] == "1", 
        pc=len(platform_bonuses) > 2 and platform_bonuses[2] == "1"
    )
    
    final_rates = calculate_drop_rates(constellation_obj.base_drop_rates, platform_bonus)
    
    return {
        "base_rates": constellation_obj.base_drop_rates.dict(),
        "final_rates": final_rates.dict(),
        "platform_bonuses": platform_bonus.dict()
    }