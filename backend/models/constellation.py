from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class ConstellationOrb(BaseModel):
    id: str
    x: float  # Position coordinates (0-100)
    y: float
    z: float = 0  # For 3D effect
    is_active: bool = True
    glow_intensity: float = 1.0

class CharacterPool(BaseModel):
    legendary: List[str] = []  # Character IDs - only 1 per constellation
    epic: List[str] = []       # Character IDs
    rare: List[str] = []       # Character IDs  
    normal: List[str] = []     # Character IDs

class DropRates(BaseModel):
    legendary: float = 0.5     # 0.5% base rate
    epic: float = 4.5          # 4.5% base rate
    rare: float = 25.0         # 25% base rate
    normal: float = 70.0       # 70% base rate

class PlatformBonus(BaseModel):
    nintendo: bool = False
    playstation: bool = False
    pc: bool = False
    legendary_bonus: float = 0.0  # Additional % for legendary drop rate

class Constellation(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    element: str  # Fire, Earth, Wind, etc.
    description: str
    orbs: List[ConstellationOrb] = []
    character_pool: CharacterPool
    base_drop_rates: DropRates
    background_color: str = "#1a1a2e"  # Dark blue default
    orb_color: str = "#ffd700"         # Gold default
    connections: List[List[str]] = []   # List of orb IDs that are connected
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ConstellationCreate(BaseModel):
    name: str
    element: str
    description: str
    character_pool: CharacterPool
    base_drop_rates: Optional[DropRates] = DropRates()
    background_color: Optional[str] = "#1a1a2e"
    orb_color: Optional[str] = "#ffd700"

class GachaPull(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    constellation_id: str
    character_id: str
    character_rarity: str
    platform_bonuses: PlatformBonus
    kizuna_stars_spent: int = 5  # Default cost per pull
    pull_timestamp: datetime = Field(default_factory=datetime.utcnow)

class GachaPullRequest(BaseModel):
    constellation_id: str
    pull_count: int = 1  # Single pull or 10-pull
    platform_bonuses: PlatformBonus

class GachaPullResult(BaseModel):
    success: bool
    characters_obtained: List[Dict[str, Any]] = []
    kizuna_stars_spent: int
    kizuna_stars_remaining: int
    platform_bonuses_applied: PlatformBonus
    pull_details: List[GachaPull] = []