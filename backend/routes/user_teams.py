from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime
import uuid

from ..models.user import User
from ..models.team import Team, TeamCreate, TeamUpdate
from ..routes.auth import get_current_user
from ..database import get_database

router = APIRouter()

@router.post("/teams", response_model=Team)
async def create_team(
    team_data: TeamCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new team for the current user"""
    db = await get_database()
    
    team_id = str(uuid.uuid4())
    team_dict = {
        "id": team_id,
        "user_id": current_user.id,
        "name": team_data.name,
        "formation": team_data.formation,
        "players": team_data.players,
        "bench_players": team_data.bench_players or [],
        "tactics": team_data.tactics or [],
        "coach": team_data.coach,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.teams.insert_one(team_dict)
    return Team(**team_dict)

@router.get("/teams", response_model=List[Team])
async def get_user_teams(current_user: User = Depends(get_current_user)):
    """Get all teams for the current user"""
    db = await get_database()
    
    teams_cursor = db.teams.find({"user_id": current_user.id})
    teams = []
    async for team in teams_cursor:
        teams.append(Team(**team))
    
    return teams

@router.get("/teams/{team_id}", response_model=Team)
async def get_team(
    team_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific team"""
    db = await get_database()
    
    team = await db.teams.find_one({"id": team_id, "user_id": current_user.id})
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    return Team(**team)

@router.put("/teams/{team_id}", response_model=Team)
async def update_team(
    team_id: str,
    team_update: TeamUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a team"""
    db = await get_database()
    
    # Check if team exists and belongs to user
    existing_team = await db.teams.find_one({"id": team_id, "user_id": current_user.id})
    if not existing_team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    update_data = team_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await db.teams.update_one(
        {"id": team_id, "user_id": current_user.id},
        {"$set": update_data}
    )
    
    updated_team = await db.teams.find_one({"id": team_id})
    return Team(**updated_team)

@router.delete("/teams/{team_id}")
async def delete_team(
    team_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a team"""
    db = await get_database()
    
    result = await db.teams.delete_one({"id": team_id, "user_id": current_user.id})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    return {"message": "Team deleted successfully"}