from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class FormationPosition(BaseModel):
    id: str
    x: float  # Position percentage on field
    y: float  # Position percentage on field
    position: str  # FW, MF, DF, GK

class Formation(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    positions: List[FormationPosition]

class Tactic(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    effect: str
    icon: Optional[str] = None

class Coach(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    title: str
    portrait: Optional[str] = None
    bonuses: Dict[str, Any] = {}
    specialties: List[str] = []

class TeamPlayer(BaseModel):
    character_id: str
    position_id: str
    user_level: int = 99
    user_rarity: str = "Legendary"
    equipment: Dict[str, Any] = {}  # category -> equipment

class Team(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    user_id: Optional[str] = None
    formation_id: str
    players: List[TeamPlayer] = []
    tactics: List[str] = []  # List of tactic IDs
    coach_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TeamCreate(BaseModel):
    name: str
    formation_id: str
    players: List[TeamPlayer] = []
    tactics: List[str] = []
    coach_id: Optional[str] = None

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    formation_id: Optional[str] = None
    players: Optional[List[TeamPlayer]] = None
    tactics: Optional[List[str]] = None
    coach_id: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)