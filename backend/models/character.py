from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class Stat(BaseModel):
    main: int
    secondary: int

class Stats(BaseModel):
    kick: Stat
    control: Stat
    technique: Stat
    intelligence: Stat
    pressure: Stat
    agility: Stat
    physical: Stat

class Hissatsu(BaseModel):
    name: str
    description: str
    type: str  # Shot, Dribble, Pass, Block, etc.
    icon: Optional[str] = None

class TeamPassive(BaseModel):
    name: str
    description: str
    icon: Optional[str] = None

class Equipment(BaseModel):
    name: str
    rarity: str
    category: str  # Boots, Bracelet, Pendant, Special
    icon: Optional[str] = None
    stats: Dict[str, int] = {}

class Character(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    nickname: str
    title: str
    base_level: int
    base_rarity: str
    position: str  # FW, MF, DF, GK
    element: str  # Fire, Earth, Air, Wood, Void
    jersey_number: int
    portrait: Optional[str] = None
    team_logo: Optional[str] = None
    base_stats: Stats
    description: str
    hissatsu: List[Hissatsu] = []
    team_passives: List[TeamPassive] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CharacterCreate(BaseModel):
    name: str
    nickname: str
    title: str
    base_level: int
    base_rarity: str
    position: str
    element: str
    jersey_number: int
    portrait: Optional[str] = None
    team_logo: Optional[str] = None
    base_stats: Stats
    description: str
    hissatsu: List[Hissatsu] = []
    team_passives: List[TeamPassive] = []

class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    nickname: Optional[str] = None
    title: Optional[str] = None
    base_level: Optional[int] = None
    base_rarity: Optional[str] = None
    position: Optional[str] = None
    element: Optional[str] = None
    jersey_number: Optional[int] = None
    portrait: Optional[str] = None
    team_logo: Optional[str] = None
    base_stats: Optional[Stats] = None
    description: Optional[str] = None
    hissatsu: Optional[List[Hissatsu]] = None
    team_passives: Optional[List[TeamPassive]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)