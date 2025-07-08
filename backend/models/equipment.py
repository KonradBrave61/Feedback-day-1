from pydantic import BaseModel, Field
from typing import Dict, Optional
from datetime import datetime
import uuid

class EquipmentItem(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    rarity: str  # Common, Rare, Epic, Legendary
    category: str  # Boots, Bracelet, Pendant, Special
    icon: Optional[str] = None
    stats: Dict[str, int] = {}  # stat_name -> bonus_value
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EquipmentCreate(BaseModel):
    name: str
    rarity: str
    category: str
    icon: Optional[str] = None
    stats: Dict[str, int] = {}
    description: Optional[str] = None