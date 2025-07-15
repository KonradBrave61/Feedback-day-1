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

class TeamComment(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Team(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    user_id: Optional[str] = None
    username: Optional[str] = None  # For display purposes
    user_avatar: Optional[str] = None  # For display purposes
    formation: str
    players: List[Dict[str, Any]] = []
    bench_players: List[Dict[str, Any]] = []
    tactics: List[Dict[str, Any]] = []
    coach: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    is_public: bool = True
    tags: List[str] = []
    likes: int = 0
    liked_by: List[str] = []  # User IDs who liked this team
    comments: List[TeamComment] = []
    views: int = 0
    rating: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TeamCreate(BaseModel):
    name: str
    formation: str
    players: List[Dict[str, Any]] = []
    bench_players: Optional[List[Dict[str, Any]]] = []
    tactics: Optional[List[Dict[str, Any]]] = []
    coach: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    is_public: bool = True
    tags: Optional[List[str]] = []

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    formation: Optional[str] = None
    players: Optional[List[Dict[str, Any]]] = None
    bench_players: Optional[List[Dict[str, Any]]] = None
    tactics: Optional[List[Dict[str, Any]]] = None
    coach: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TeamPublic(BaseModel):
    id: str
    name: str
    username: str
    user_avatar: Optional[str] = None
    formation: str
    description: Optional[str] = None
    tags: List[str] = []
    likes: int = 0
    views: int = 0
    rating: float = 0.0
    created_at: datetime

class LikeRequest(BaseModel):
    team_id: str

class CommentRequest(BaseModel):
    team_id: str
    content: str