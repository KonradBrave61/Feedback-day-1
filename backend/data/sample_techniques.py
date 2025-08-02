"""
Sample technique data showcasing the different types, categories, and elements
"""

sample_techniques = [
    # AVATAR TECHNIQUES
    {
        "name": "Fire Tornado Avatar",
        "description": "Summon the spirit of a flame tornado to unleash devastating shots",
        "technique_type": "avatar",
        "category": "Shot",
        "element": "fire",
        "power": 235,
        "shot_type": "normal",
        "rarity": "Legendary",
        "min_level": 25,
        "learning_cost": 1000,
        "stat_requirements": {"kick": 120, "technique": 100},
        "stat_bonuses": {"kick": 10},
        "animation_description": "Character summons a massive flame tornado avatar that engulfs the ball"
    },
    {
        "name": "Earth Guardian Avatar",
        "description": "Channel the ancient earth guardian to create an impenetrable defense",
        "technique_type": "avatar",
        "category": "Block",
        "element": "earth",
        "power": 210,
        "rarity": "Epic",
        "min_level": 20,
        "learning_cost": 800,
        "allowed_positions": ["DF"],
        "stat_requirements": {"physical": 100, "pressure": 80},
        "stat_bonuses": {"physical": 8, "pressure": 5},
        "animation_description": "Massive stone guardian emerges to block incoming attacks"
    },
    {
        "name": "Wind Spirit Avatar",
        "description": "Become one with the wind spirits for lightning-fast dribbling",
        "technique_type": "avatar",
        "category": "Dribble",
        "element": "wind",
        "power": 190,
        "rarity": "Epic",
        "min_level": 18,
        "learning_cost": 750,
        "stat_requirements": {"agility": 90, "control": 85},
        "stat_bonuses": {"agility": 12, "control": 8},
        "animation_description": "Wind spirits surround the player, creating afterimages while dribbling"
    },
    {
        "name": "Void Keeper Avatar",
        "description": "Summon the avatar of the void to absorb any shot into nothingness",
        "technique_type": "avatar",
        "category": "Save",
        "element": "void",
        "power": 250,
        "rarity": "Legendary",
        "min_level": 30,
        "learning_cost": 1200,
        "allowed_positions": ["GK"],
        "stat_requirements": {"technique": 130, "intelligence": 110},
        "stat_bonuses": {"technique": 15, "intelligence": 10},
        "animation_description": "Dark void portal opens, absorbing the ball into nothingness"
    },

    # TOTEM TECHNIQUES
    {
        "name": "Lightning Wolf Totem",
        "description": "Call upon the lightning wolf totem for electrifying long shots",
        "technique_type": "totem",
        "category": "Shot",
        "element": "wind",  # Lightning is part of wind element
        "power": 198,
        "shot_type": "long",
        "rarity": "Rare",
        "min_level": 15,
        "learning_cost": 600,
        "stat_requirements": {"kick": 85, "intelligence": 70},
        "stat_bonuses": {"kick": 6, "intelligence": 4},
        "animation_description": "Lightning wolf totem appears, charging the ball with electrical energy"
    },
    {
        "name": "Stone Bear Totem",
        "description": "Channel the stone bear's strength for powerful defensive blocks",
        "technique_type": "totem",
        "category": "Block",
        "element": "earth",
        "power": 175,
        "rarity": "Rare",
        "min_level": 12,
        "learning_cost": 500,
        "stat_requirements": {"physical": 80, "pressure": 70},
        "stat_bonuses": {"physical": 7, "pressure": 5},
        "animation_description": "Stone bear totem materializes, using its massive paws to block attacks"
    },
    {
        "name": "Forest Stag Totem",
        "description": "Invoke the forest stag's grace for elegant dribbling maneuvers",
        "technique_type": "totem",
        "category": "Dribble",
        "element": "wood",
        "power": 165,
        "rarity": "Common",
        "min_level": 10,
        "learning_cost": 400,
        "stat_requirements": {"agility": 75, "control": 65},
        "stat_bonuses": {"agility": 5, "control": 3},
        "animation_description": "Forest stag totem guides the player through graceful movements"
    },
    {
        "name": "Phoenix Guardian Totem",
        "description": "Summon the phoenix totem to incinerate incoming shots with divine flames",
        "technique_type": "totem",
        "category": "Save",
        "element": "fire",
        "power": 185,
        "rarity": "Epic",
        "min_level": 22,
        "learning_cost": 700,
        "allowed_positions": ["GK"],
        "stat_requirements": {"technique": 95, "intelligence": 85},
        "stat_bonuses": {"technique": 8, "intelligence": 6},
        "animation_description": "Phoenix totem spreads its flaming wings, incinerating the incoming ball"
    },

    # MIX-MAX TECHNIQUES  
    {
        "name": "Tornado Fire Blast",
        "description": "Hybrid technique combining wind speed with fire power for devastating shots",
        "technique_type": "mix-max",
        "category": "Shot",
        "element": "fire",  # Primary element
        "power": 220,
        "shot_type": "normal",
        "rarity": "Epic",
        "min_level": 25,
        "learning_cost": 900,
        "prerequisites": [],  # Could require learning wind and fire techniques first
        "stat_requirements": {"kick": 110, "technique": 95, "control": 80},
        "stat_bonuses": {"kick": 8, "technique": 6},
        "animation_description": "Combines tornado winds with blazing fire for a spiraling inferno shot"
    },
    {
        "name": "Earth-Void Barrier",
        "description": "Mix earth's solidity with void's absorption for ultimate defense",
        "technique_type": "mix-max",
        "category": "Block",
        "element": "earth",  # Primary element
        "power": 205,
        "rarity": "Legendary",
        "min_level": 28,
        "learning_cost": 1100,
        "stat_requirements": {"physical": 115, "technique": 100, "intelligence": 90},
        "stat_bonuses": {"physical": 10, "technique": 8, "intelligence": 5},
        "animation_description": "Creates a stone wall that absorbs attacks into void portals"
    },
    {
        "name": "Wood-Wind Dance",
        "description": "Blend nature's flexibility with wind's speed for mesmerizing dribbles",
        "technique_type": "mix-max",
        "category": "Dribble",
        "element": "wood",  # Primary element
        "power": 180,
        "rarity": "Rare",
        "min_level": 20,
        "learning_cost": 650,
        "stat_requirements": {"agility": 100, "control": 85, "technique": 75},
        "stat_bonuses": {"agility": 9, "control": 7, "technique": 4},
        "animation_description": "Player moves like a tree swaying in the wind, creating beautiful dribbling patterns"
    },
    {
        "name": "Void-Fire Convergence",
        "description": "Ultimate goalkeeper technique merging void absorption with fire destruction",
        "technique_type": "mix-max",
        "category": "Save",
        "element": "void",  # Primary element
        "power": 275,
        "rarity": "Legendary",
        "min_level": 35,
        "learning_cost": 1500,
        "allowed_positions": ["GK"],
        "stat_requirements": {"technique": 140, "intelligence": 120, "control": 100},
        "stat_bonuses": {"technique": 18, "intelligence": 12, "control": 8},
        "animation_description": "Creates a void portal that incinerates the ball before it can enter the goal"
    },

    # BASIC TECHNIQUES (Lower power, easier to learn)
    {
        "name": "Simple Fire Shot",
        "description": "Basic fire-infused shot technique for beginners",
        "technique_type": "totem",
        "category": "Shot",
        "element": "fire",
        "power": 85,
        "shot_type": "normal",
        "rarity": "Common",
        "min_level": 1,
        "learning_cost": 100,
        "stat_requirements": {"kick": 30},
        "stat_bonuses": {"kick": 2},
        "animation_description": "Ball is surrounded by small flames during the shot"
    },
    {
        "name": "Basic Earth Block",
        "description": "Fundamental earth-based defensive technique",
        "technique_type": "totem",
        "category": "Block",
        "element": "earth",
        "power": 75,
        "rarity": "Common",
        "min_level": 1,
        "learning_cost": 80,
        "stat_requirements": {"physical": 25},
        "stat_bonuses": {"physical": 2},
        "animation_description": "Small stone barriers rise from the ground to assist in blocking"
    },
    {
        "name": "Wind Step",
        "description": "Basic wind-enhanced dribbling technique",
        "technique_type": "totem",
        "category": "Dribble",
        "element": "wind",
        "power": 70,
        "rarity": "Common",
        "min_level": 1,
        "learning_cost": 90,
        "stat_requirements": {"agility": 25, "control": 20},
        "stat_bonuses": {"agility": 2, "control": 1},
        "animation_description": "Light breeze surrounds the player during dribbling"
    },
    {
        "name": "Basic Keeper Catch",
        "description": "Fundamental goalkeeping technique enhanced with wood element",
        "technique_type": "totem",
        "category": "Save",
        "element": "wood",
        "power": 65,
        "rarity": "Common",
        "min_level": 1,
        "learning_cost": 70,
        "allowed_positions": ["GK"],
        "stat_requirements": {"technique": 20},
        "stat_bonuses": {"technique": 2},
        "animation_description": "Wooden vines briefly extend from gloves to help catch the ball"
    }
]