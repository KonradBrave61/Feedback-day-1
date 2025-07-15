from fastapi import APIRouter, HTTPException
from typing import List, Optional
from models.team import Team, TeamCreate, TeamUpdate, Formation, Tactic, Coach
from database import get_database

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/", response_model=List[Team])
async def get_teams(skip: int = 0, limit: int = 100, user_id: Optional[str] = None):
    """Get all teams with optional user filtering"""
    db = await get_database()
    
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    cursor = db.teams.find(query).skip(skip).limit(limit)
    teams = await cursor.to_list(length=limit)
    
    return [Team(**team) for team in teams]

@router.get("/{team_id}", response_model=Team)
async def get_team(team_id: str):
    """Get a specific team by ID"""
    db = await get_database()
    
    team = await db.teams.find_one({"id": team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return Team(**team)

@router.post("/", response_model=Team)
async def create_team(team: TeamCreate):
    """Create a new team"""
    db = await get_database()
    
    # Create team with generated ID
    new_team = Team(**team.dict())
    
    # Insert into database
    await db.teams.insert_one(new_team.dict())
    
    return new_team

@router.put("/{team_id}", response_model=Team)
async def update_team(team_id: str, team_update: TeamUpdate):
    """Update a team"""
    db = await get_database()
    
    # Check if team exists
    existing_team = await db.teams.find_one({"id": team_id})
    if not existing_team:
        raise HTTPException(status_code=404, detail="Team not found")
    
    # Update only provided fields
    update_data = team_update.dict(exclude_unset=True)
    
    await db.teams.update_one(
        {"id": team_id},
        {"$set": update_data}
    )
    
    # Return updated team
    updated_team = await db.teams.find_one({"id": team_id})
    return Team(**updated_team)

@router.delete("/{team_id}")
async def delete_team(team_id: str):
    """Delete a team"""
    db = await get_database()
    
    result = await db.teams.delete_one({"id": team_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team not found")
    
    return {"message": "Team deleted successfully"}

# Formations endpoints
@router.get("/formations/", response_model=List[Formation])
async def get_formations():
    """Get all available formations"""
    db = await get_database()
    
    cursor = db.formations.find({})
    formations = await cursor.to_list(length=None)
    
    return [Formation(**formation) for formation in formations]

@router.get("/formations/{formation_id}", response_model=Formation)
async def get_formation(formation_id: str):
    """Get a specific formation by ID"""
    db = await get_database()
    
    formation = await db.formations.find_one({"id": formation_id})
    if not formation:
        raise HTTPException(status_code=404, detail="Formation not found")
    
    return Formation(**formation)

# Tactics endpoints
@router.get("/tactics/", response_model=List[Tactic])
async def get_tactics():
    """Get all available tactics"""
    db = await get_database()
    
    cursor = db.tactics.find({})
    tactics = await cursor.to_list(length=None)
    
    return [Tactic(**tactic) for tactic in tactics]

@router.get("/tactics/{tactic_id}", response_model=Tactic)
async def get_tactic(tactic_id: str):
    """Get a specific tactic by ID"""
    db = await get_database()
    
    tactic = await db.tactics.find_one({"id": tactic_id})
    if not tactic:
        raise HTTPException(status_code=404, detail="Tactic not found")
    
    return Tactic(**tactic)

# Coaches endpoints
@router.get("/coaches/", response_model=List[Coach])
async def get_coaches():
    """Get all available coaches"""
    db = await get_database()
    
    cursor = db.coaches.find({})
    coaches = await cursor.to_list(length=None)
    
    return [Coach(**coach) for coach in coaches]

@router.get("/coaches/{coach_id}", response_model=Coach)
async def get_coach(coach_id: str):
    """Get a specific coach by ID"""
    db = await get_database()
    
    coach = await db.coaches.find_one({"id": coach_id})
    if not coach:
        raise HTTPException(status_code=404, detail="Coach not found")
    
    return Coach(**coach)