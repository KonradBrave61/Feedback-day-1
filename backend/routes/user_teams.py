from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from datetime import datetime
import uuid

from models.user import User
from models.team import Team, TeamCreate, TeamUpdate, TeamComment, LikeRequest, CommentRequest, TeamRating, TeamSaveSlot, TeamRatingSubmission
from routes.auth import get_current_user
from database import get_database

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
        "username": current_user.username,
        "user_avatar": current_user.profile_picture,
        "name": team_data.name,
        "formation": team_data.formation,
        "players": team_data.players,
        "bench_players": team_data.bench_players or [],
        "tactics": team_data.tactics or [],
        "coach": team_data.coach,
        "description": team_data.description,
        "is_public": team_data.is_public,
        "tags": team_data.tags or [],
        "likes": 0,
        "liked_by": [],
        "comments": [],
        "views": 0,
        "rating": 0.0,
        "detailed_rating": {
            "tension_usage": 0.0,
            "difficulty": 0.0,
            "fun": 0.0,
            "creativity": 0.0,
            "effectiveness": 0.0,
            "balance": 0.0,
            "total_ratings": 0,
            "average_rating": 0.0
        },
        "save_slot": team_data.save_slot,
        "save_slot_name": team_data.save_slot_name,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.teams.insert_one(team_dict)
    
    # Update user's total_teams count
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"total_teams": 1}}
    )
    
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
    
    # Update user's total_teams count
    await db.users.update_one(
        {"id": current_user.id},
        {"$inc": {"total_teams": -1}}
    )
    
    return {"message": "Team deleted successfully"}

@router.get("/community/teams", response_model=List[Team])
async def get_community_teams(
    search: Optional[str] = Query(None, description="Search by team name, username, or formation"),
    formation: Optional[str] = Query(None, description="Filter by formation"),
    sort_by: Optional[str] = Query("created_at", description="Sort by: created_at, likes, views, rating"),
    limit: int = Query(20, description="Number of teams to return"),
    offset: int = Query(0, description="Offset for pagination"),
    current_user: User = Depends(get_current_user)
):
    """Get public teams from the community with filtering and search"""
    db = await get_database()
    
    # Build filter query
    filter_query = {"is_public": True}
    
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        filter_query["$or"] = [
            {"name": search_regex},
            {"username": search_regex},
            {"formation": search_regex}
        ]
    
    if formation:
        filter_query["formation"] = formation
    
    # Build sort query
    sort_query = []
    if sort_by == "likes":
        sort_query = [("likes", -1)]
    elif sort_by == "views":
        sort_query = [("views", -1)]
    elif sort_by == "rating":
        sort_query = [("rating", -1)]
    else:
        sort_query = [("created_at", -1)]
    
    teams_cursor = db.teams.find(filter_query).sort(sort_query).skip(offset).limit(limit)
    teams = []
    async for team in teams_cursor:
        teams.append(Team(**team))
    
    return teams

@router.post("/teams/{team_id}/like")
async def like_team(
    team_id: str,
    current_user: User = Depends(get_current_user)
):
    """Like or unlike a team"""
    db = await get_database()
    
    team = await db.teams.find_one({"id": team_id, "is_public": True})
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    liked_by = team.get("liked_by", [])
    
    if current_user.id in liked_by:
        # Unlike the team
        await db.teams.update_one(
            {"id": team_id},
            {
                "$pull": {"liked_by": current_user.id},
                "$inc": {"likes": -1}
            }
        )
        # Update team owner's total_likes_received
        await db.users.update_one(
            {"id": team["user_id"]},
            {"$inc": {"total_likes_received": -1}}
        )
        return {"message": "Team unliked", "liked": False}
    else:
        # Like the team
        await db.teams.update_one(
            {"id": team_id},
            {
                "$addToSet": {"liked_by": current_user.id},
                "$inc": {"likes": 1}
            }
        )
        # Update team owner's total_likes_received
        await db.users.update_one(
            {"id": team["user_id"]},
            {"$inc": {"total_likes_received": 1}}
        )
        return {"message": "Team liked", "liked": True}

@router.post("/teams/{team_id}/comment")
async def comment_on_team(
    team_id: str,
    comment_data: CommentRequest,
    current_user: User = Depends(get_current_user)
):
    """Add a comment to a team"""
    db = await get_database()
    
    team = await db.teams.find_one({"id": team_id, "is_public": True})
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    comment = TeamComment(
        user_id=current_user.id,
        username=current_user.username,
        user_avatar=current_user.profile_picture,
        content=comment_data.content
    )
    
    await db.teams.update_one(
        {"id": team_id},
        {"$push": {"comments": comment.dict()}}
    )
    
    return {"message": "Comment added successfully", "comment": comment}

@router.get("/teams/{team_id}/view")
async def view_team(
    team_id: str,
    current_user: User = Depends(get_current_user)
):
    """Increment team view count and return team details"""
    db = await get_database()
    
    team = await db.teams.find_one({"id": team_id, "is_public": True})
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Increment view count
    await db.teams.update_one(
        {"id": team_id},
        {"$inc": {"views": 1}}
    )
    
    # Get updated team
    updated_team = await db.teams.find_one({"id": team_id})
    return Team(**updated_team)

@router.get("/community/featured")
async def get_featured_teams(current_user: User = Depends(get_current_user)):
    """Get featured teams and popular formations"""
    db = await get_database()
    
    # Get teams of the week (highest rated this week)
    teams_of_week_cursor = db.teams.find({"is_public": True}).sort([("rating", -1), ("likes", -1)]).limit(5)
    teams_of_week = []
    async for team in teams_of_week_cursor:
        teams_of_week.append(Team(**team))
    
    # Get most popular formations
    pipeline = [
        {"$match": {"is_public": True}},
        {"$group": {"_id": "$formation", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    
    formations_cursor = db.teams.aggregate(pipeline)
    popular_formations = []
    async for formation in formations_cursor:
        popular_formations.append({
            "formation": formation["_id"],
            "count": formation["count"]
        })
    
    return {
        "teams_of_week": teams_of_week,
        "popular_formations": popular_formations
    }

@router.post("/teams/{team_id}/rate")
async def rate_team(
    team_id: str,
    rating_data: TeamRatingSubmission,
    current_user: User = Depends(get_current_user)
):
    """Rate a team with detailed categories"""
    db = await get_database()
    
    team = await db.teams.find_one({"id": team_id, "is_public": True})
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if user is rating their own team
    if team["user_id"] == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot rate your own team"
        )
    
    # Calculate new averages
    current_rating = team.get("detailed_rating", {})
    current_total = current_rating.get("total_ratings", 0)
    
    new_total = current_total + 1
    new_averages = {
        "tension_usage": (current_rating.get("tension_usage", 0) * current_total + rating_data.tension_usage) / new_total,
        "difficulty": (current_rating.get("difficulty", 0) * current_total + rating_data.difficulty) / new_total,
        "fun": (current_rating.get("fun", 0) * current_total + rating_data.fun) / new_total,
        "creativity": (current_rating.get("creativity", 0) * current_total + rating_data.creativity) / new_total,
        "effectiveness": (current_rating.get("effectiveness", 0) * current_total + rating_data.effectiveness) / new_total,
        "balance": (current_rating.get("balance", 0) * current_total + rating_data.balance) / new_total,
        "total_ratings": new_total
    }
    
    new_averages["average_rating"] = sum([
        new_averages["tension_usage"],
        new_averages["difficulty"],
        new_averages["fun"],
        new_averages["creativity"],
        new_averages["effectiveness"],
        new_averages["balance"]
    ]) / 6
    
    # Update team with new rating
    await db.teams.update_one(
        {"id": team_id},
        {
            "$set": {
                "detailed_rating": new_averages,
                "rating": new_averages["average_rating"]
            }
        }
    )
    
    return {"message": "Team rated successfully", "rating": new_averages}

@router.get("/save-slots")
async def get_save_slots(current_user: User = Depends(get_current_user)):
    """Get user's team save slots"""
    db = await get_database()
    
    # Get all teams for the user to check occupied slots
    teams_cursor = db.teams.find({"user_id": current_user.id})
    teams = []
    async for team in teams_cursor:
        teams.append(team)
    
    # Create save slots (assuming 5 slots for now)
    save_slots = []
    for i in range(1, 6):
        occupied_team = next((team for team in teams if team.get("save_slot") == i), None)
        save_slots.append({
            "slot_number": i,
            "slot_name": f"Slot {i}",
            "is_occupied": occupied_team is not None,
            "team_id": occupied_team["id"] if occupied_team else None,
            "team_name": occupied_team["name"] if occupied_team else None
        })
    
    return {"save_slots": save_slots}

@router.get("/teams/{team_id}/details")
async def get_team_details(
    team_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed team information including comments and ratings"""
    db = await get_database()
    
    team = await db.teams.find_one({"id": team_id, "is_public": True})
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Increment view count if not owner
    if team["user_id"] != current_user.id:
        await db.teams.update_one(
            {"id": team_id},
            {"$inc": {"views": 1}}
        )
    
    # Get updated team with incremented views
    updated_team = await db.teams.find_one({"id": team_id})
    
    # Check if current user has liked this team
    is_liked = current_user.id in updated_team.get("liked_by", [])
    
    # Check if current user is following team owner
    is_following = updated_team["user_id"] in current_user.following
    
    return {
        "team": Team(**updated_team),
        "is_liked": is_liked,
        "is_following": is_following,
        "can_rate": updated_team["user_id"] != current_user.id
    }

@router.post("/teams/{team_id}/save-to-slot")
async def save_team_to_slot(
    team_id: str,
    slot_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Save a team to a specific slot"""
    db = await get_database()
    
    # Verify team belongs to user
    team = await db.teams.find_one({"id": team_id, "user_id": current_user.id})
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    slot_number = slot_data.get("slot_number")
    slot_name = slot_data.get("slot_name", f"Slot {slot_number}")
    
    # Check if slot is occupied and handle overwrite
    existing_team = await db.teams.find_one({
        "user_id": current_user.id,
        "save_slot": slot_number
    })
    
    if existing_team and not slot_data.get("overwrite", False):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Slot is occupied. Set overwrite to true to replace."
        )
    
    # Clear the slot from any existing team
    await db.teams.update_many(
        {"user_id": current_user.id, "save_slot": slot_number},
        {"$unset": {"save_slot": "", "save_slot_name": ""}}
    )
    
    # Assign the team to the slot
    await db.teams.update_one(
        {"id": team_id},
        {
            "$set": {
                "save_slot": slot_number,
                "save_slot_name": slot_name,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Team saved to slot successfully"}