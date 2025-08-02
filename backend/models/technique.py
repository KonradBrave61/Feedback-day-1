from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class Technique(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    
    # Core categorization
    technique_type: str  # avatar, totem, mix-max
    category: str  # Shot, Dribble, Save, Block
    element: str  # earth, fire, wind, wood, void
    
    # Power and attributes
    power: int  # e.g., 235
    
    # Shot-specific attributes
    shot_type: Optional[str] = None  # normal, long (only for Shot category)
    
    # Visual and metadata
    icon: Optional[str] = None
    animation_description: Optional[str] = None
    rarity: str = "Common"  # Common, Rare, Epic, Legendary
    
    # Learning requirements
    min_level: int = 1
    learning_cost: int = 0  # Cost in some currency/points
    prerequisites: List[str] = []  # List of technique IDs that must be learned first
    
    # Position restrictions (empty list means all positions can learn)
    allowed_positions: List[str] = []  # e.g., ["GK"] for Save techniques
    
    # Stats requirements or bonuses
    stat_requirements: Dict[str, int] = {}  # e.g., {"kick": 100} for learning
    stat_bonuses: Dict[str, int] = {}  # Passive bonuses when technique is learned
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TechniqueCreate(BaseModel):
    name: str
    description: str
    technique_type: str
    category: str
    element: str
    power: int
    shot_type: Optional[str] = None
    icon: Optional[str] = None
    animation_description: Optional[str] = None
    rarity: str = "Common"
    min_level: int = 1
    learning_cost: int = 0
    prerequisites: List[str] = []
    allowed_positions: List[str] = []
    stat_requirements: Dict[str, int] = {}
    stat_bonuses: Dict[str, int] = {}

class TechniqueUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    technique_type: Optional[str] = None
    category: Optional[str] = None
    element: Optional[str] = None
    power: Optional[int] = None
    shot_type: Optional[str] = None
    icon: Optional[str] = None
    animation_description: Optional[str] = None
    rarity: Optional[str] = None
    min_level: Optional[int] = None
    learning_cost: Optional[int] = None
    prerequisites: Optional[List[str]] = None
    allowed_positions: Optional[List[str]] = None
    stat_requirements: Optional[Dict[str, int]] = None
    stat_bonuses: Optional[Dict[str, int]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Character-Technique relationship for learned techniques
class CharacterTechnique(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    character_id: str
    technique_id: str
    learned_at: datetime = Field(default_factory=datetime.utcnow)
    proficiency_level: int = 1  # 1-10 scale for technique mastery
    is_equipped: bool = False  # Whether this technique is currently equipped/active
    
class LearnTechniqueRequest(BaseModel):
    character_id: str
    technique_id: str

class EquipTechniqueRequest(BaseModel):
    character_id: str
    technique_id: str
    slot: int  # Technique slot (1-4, characters can equip multiple techniques)