from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def get_database():
    """Get database instance"""
    return db

async def init_database():
    """Initialize database with default data"""
    # Check if we need to populate default data
    formations_count = await db.formations.count_documents({})
    if formations_count == 0:
        await populate_default_formations()
    
    tactics_count = await db.tactics.count_documents({})
    if tactics_count == 0:
        await populate_default_tactics()
    
    coaches_count = await db.coaches.count_documents({})
    if coaches_count == 0:
        await populate_default_coaches()
    
    equipment_count = await db.equipment.count_documents({})
    if equipment_count == 0:
        await populate_default_equipment()

async def populate_default_formations():
    """Populate default formations"""
    formations = [
        {
            "id": "1",
            "name": "4-4-2 Diamond",
            "positions": [
                {"id": "gk", "x": 50, "y": 85, "position": "GK"},
                {"id": "lb", "x": 15, "y": 65, "position": "DF"},
                {"id": "cb1", "x": 35, "y": 70, "position": "DF"},
                {"id": "cb2", "x": 65, "y": 70, "position": "DF"},
                {"id": "rb", "x": 85, "y": 65, "position": "DF"},
                {"id": "dm", "x": 50, "y": 50, "position": "MF"},
                {"id": "lm", "x": 25, "y": 40, "position": "MF"},
                {"id": "rm", "x": 75, "y": 40, "position": "MF"},
                {"id": "am", "x": 50, "y": 30, "position": "MF"},
                {"id": "lf", "x": 40, "y": 15, "position": "FW"},
                {"id": "rf", "x": 60, "y": 15, "position": "FW"}
            ]
        },
        {
            "id": "2",
            "name": "4-3-3",
            "positions": [
                {"id": "gk", "x": 50, "y": 85, "position": "GK"},
                {"id": "lb", "x": 15, "y": 65, "position": "DF"},
                {"id": "cb1", "x": 35, "y": 70, "position": "DF"},
                {"id": "cb2", "x": 65, "y": 70, "position": "DF"},
                {"id": "rb", "x": 85, "y": 65, "position": "DF"},
                {"id": "cm1", "x": 30, "y": 45, "position": "MF"},
                {"id": "cm2", "x": 50, "y": 45, "position": "MF"},
                {"id": "cm3", "x": 70, "y": 45, "position": "MF"},
                {"id": "lw", "x": 25, "y": 15, "position": "FW"},
                {"id": "st", "x": 50, "y": 10, "position": "FW"},
                {"id": "rw", "x": 75, "y": 15, "position": "FW"}
            ]
        }
    ]
    await db.formations.insert_many(formations)

async def populate_default_tactics():
    """Populate default tactics"""
    tactics = [
        {"id": "1", "name": "Flame Fortress", "description": "Conjure a wall of blazing flame in front of the goal", "effect": "DF +100%", "icon": "/api/placeholder/40/40"},
        {"id": "2", "name": "Sideline Spears", "description": "Lightning-fast spear attacks from the sidelines", "effect": "KP +10%", "icon": "/api/placeholder/40/40"},
        {"id": "3", "name": "Mount Fuji", "description": "Immovable mountain defense", "effect": "Physical +15%", "icon": "/api/placeholder/40/40"},
        {"id": "4", "name": "Waxing Moon", "description": "Crescent moon slicing technique", "effect": "Technique +20%", "icon": "/api/placeholder/40/40"},
        {"id": "5", "name": "Diamond Defense", "description": "Unbreakable formation", "effect": "Team DF +50%", "icon": "/api/placeholder/40/40"},
        {"id": "6", "name": "Bond Protocol", "description": "Team synchronization boost", "effect": "Control +25%", "icon": "/api/placeholder/40/40"},
        {"id": "7", "name": "Bull Horns", "description": "Charging attack formation", "effect": "Shot +40%", "icon": "/api/placeholder/40/40"},
        {"id": "8", "name": "Claymore", "description": "Devastating single strike", "effect": "Kick +60%", "icon": "/api/placeholder/40/40"},
        {"id": "9", "name": "Three-Pronged Attack", "description": "Triple threat offensive", "effect": "Team AT +35%", "icon": "/api/placeholder/40/40"}
    ]
    await db.tactics.insert_many(tactics)

async def populate_default_coaches():
    """Populate default coaches"""
    coaches = [
        {
            "id": "1",
            "name": "Mark Evans Sr.",
            "title": "Veteran Coach",
            "portrait": "/api/placeholder/150/150",
            "bonuses": {
                "teamStats": {"kick": 10, "control": 8, "technique": 12},
                "description": "Increases team's offensive capabilities"
            },
            "specialties": ["Offensive Training", "Team Spirit", "Shot Power"]
        },
        {
            "id": "2",
            "name": "Ray Dark",
            "title": "Tactical Genius",
            "portrait": "/api/placeholder/150/150",
            "bonuses": {
                "teamStats": {"intelligence": 15, "pressure": 10, "control": 5},
                "description": "Enhances team's tactical awareness"
            },
            "specialties": ["Tactical Analysis", "Defense Formation", "Mental Training"]
        },
        {
            "id": "3",
            "name": "Hibiki Seigou",
            "title": "Legendary Coach",
            "portrait": "/api/placeholder/150/150",
            "bonuses": {
                "teamStats": {"physical": 12, "agility": 8, "technique": 10},
                "description": "Balanced training for all aspects"
            },
            "specialties": ["Physical Training", "Endurance", "Technique Mastery"]
        }
    ]
    await db.coaches.insert_many(coaches)

async def populate_default_equipment():
    """Populate default equipment"""
    equipment = [
        # Boots
        {"id": "1", "name": "Omega Boots", "rarity": "Legendary", "category": "Boots", "icon": "/api/placeholder/40/40", "stats": {"kick": 15, "agility": 10}},
        {"id": "2", "name": "Genesis Boots", "rarity": "Epic", "category": "Boots", "icon": "/api/placeholder/40/40", "stats": {"kick": 12, "agility": 8}},
        {"id": "3", "name": "Flame Boots", "rarity": "Rare", "category": "Boots", "icon": "/api/placeholder/40/40", "stats": {"kick": 8, "agility": 6}},
        {"id": "4", "name": "Basic Boots", "rarity": "Common", "category": "Boots", "icon": "/api/placeholder/40/40", "stats": {"kick": 5, "agility": 3}},
        
        # Bracelets
        {"id": "5", "name": "Genesis Bangle", "rarity": "Legendary", "category": "Bracelet", "icon": "/api/placeholder/40/40", "stats": {"control": 15, "technique": 10}},
        {"id": "6", "name": "Striker's Band", "rarity": "Epic", "category": "Bracelet", "icon": "/api/placeholder/40/40", "stats": {"control": 12, "technique": 8}},
        {"id": "7", "name": "Guardian Bangle", "rarity": "Rare", "category": "Bracelet", "icon": "/api/placeholder/40/40", "stats": {"control": 8, "technique": 6}},
        {"id": "8", "name": "Simple Band", "rarity": "Common", "category": "Bracelet", "icon": "/api/placeholder/40/40", "stats": {"control": 5, "technique": 3}},
        
        # Pendants
        {"id": "9", "name": "Shiny Mascot", "rarity": "Legendary", "category": "Pendant", "icon": "/api/placeholder/40/40", "stats": {"intelligence": 15, "pressure": 10}},
        {"id": "10", "name": "Fire Pendant", "rarity": "Epic", "category": "Pendant", "icon": "/api/placeholder/40/40", "stats": {"intelligence": 12, "pressure": 8}},
        {"id": "11", "name": "Shield Pendant", "rarity": "Rare", "category": "Pendant", "icon": "/api/placeholder/40/40", "stats": {"intelligence": 8, "pressure": 6}},
        {"id": "12", "name": "Lucky Charm", "rarity": "Common", "category": "Pendant", "icon": "/api/placeholder/40/40", "stats": {"intelligence": 5, "pressure": 3}},
        
        # Special
        {"id": "13", "name": "Professor Layton Accessory", "rarity": "Legendary", "category": "Special", "icon": "/api/placeholder/40/40", "stats": {"physical": 15, "agility": 10}},
        {"id": "14", "name": "Captain's Armband", "rarity": "Epic", "category": "Special", "icon": "/api/placeholder/40/40", "stats": {"physical": 12, "agility": 8}},
        {"id": "15", "name": "Ace Number", "rarity": "Rare", "category": "Special", "icon": "/api/placeholder/40/40", "stats": {"physical": 8, "agility": 6}},
        {"id": "16", "name": "Team Badge", "rarity": "Common", "category": "Special", "icon": "/api/placeholder/40/40", "stats": {"physical": 5, "agility": 3}}
    ]
    await db.equipment.insert_many(equipment)