from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

class UserBase(BaseModel):
    username: str
    email: EmailStr
    coach_level: int = 1
    favorite_position: str = "MF"
    favorite_element: str = "Fire"
    favourite_team: str = "Default Team"
    profile_picture: Optional[str] = None  # Base64 encoded image
    bio: Optional[str] = None
    kizuna_stars: int = 50  # Starting Kizuna Stars for gacha pulls

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    coach_level: Optional[int] = None
    favorite_position: Optional[str] = None
    favorite_element: Optional[str] = None
    favourite_team: Optional[str] = None
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    kizuna_stars: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = True

class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    total_teams: int = 0
    total_likes_received: int = 0
    followers: List[str] = []
    following: List[str] = []
    
    class Config:
        from_attributes = True

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class UserPublic(BaseModel):
    id: str
    username: str
    coach_level: int
    favourite_team: str
    profile_picture: Optional[str] = None
    bio: Optional[str] = None
    total_teams: int = 0
    total_likes_received: int = 0
    created_at: datetime

class FollowRequest(BaseModel):
    user_id: str