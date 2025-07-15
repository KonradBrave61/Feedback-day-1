from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from datetime import datetime
import uuid

from models.user import User, UserPublic, FollowRequest
from models.team import Team
from routes.auth import get_current_user
from database import get_database

router = APIRouter()

@router.post("/follow")
async def follow_user(
    follow_data: FollowRequest,
    current_user: User = Depends(get_current_user)
):
    """Follow or unfollow a user"""
    db = await get_database()
    
    if follow_data.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )
    
    # Check if target user exists
    target_user = await db.users.find_one({"id": follow_data.user_id})
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    current_user_doc = await db.users.find_one({"id": current_user.id})
    following = current_user_doc.get("following", [])
    
    if follow_data.user_id in following:
        # Unfollow
        await db.users.update_one(
            {"id": current_user.id},
            {"$pull": {"following": follow_data.user_id}}
        )
        await db.users.update_one(
            {"id": follow_data.user_id},
            {"$pull": {"followers": current_user.id}}
        )
        return {"message": "User unfollowed", "following": False}
    else:
        # Follow
        await db.users.update_one(
            {"id": current_user.id},
            {"$addToSet": {"following": follow_data.user_id}}
        )
        await db.users.update_one(
            {"id": follow_data.user_id},
            {"$addToSet": {"followers": current_user.id}}
        )
        return {"message": "User followed", "following": True}

@router.get("/users/{user_id}", response_model=UserPublic)
async def get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get public user profile"""
    db = await get_database()
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserPublic(**user)

@router.get("/users/{user_id}/teams", response_model=List[Team])
async def get_user_public_teams(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get public teams from a specific user"""
    db = await get_database()
    
    teams_cursor = db.teams.find({"user_id": user_id, "is_public": True})
    teams = []
    async for team in teams_cursor:
        teams.append(Team(**team))
    
    return teams

@router.get("/leaderboard")
async def get_leaderboard(current_user: User = Depends(get_current_user)):
    """Get community leaderboard"""
    db = await get_database()
    
    # Top users by likes received
    top_by_likes_cursor = db.users.find().sort([("total_likes_received", -1)]).limit(10)
    top_by_likes = []
    async for user in top_by_likes_cursor:
        top_by_likes.append(UserPublic(**user))
    
    # Top users by total teams
    top_by_teams_cursor = db.users.find().sort([("total_teams", -1)]).limit(10)
    top_by_teams = []
    async for user in top_by_teams_cursor:
        top_by_teams.append(UserPublic(**user))
    
    # Most followed users
    pipeline = [
        {"$project": {"username": 1, "profile_picture": 1, "coach_level": 1, "follower_count": {"$size": "$followers"}}},
        {"$sort": {"follower_count": -1}},
        {"$limit": 10}
    ]
    
    most_followed_cursor = db.users.aggregate(pipeline)
    most_followed = []
    async for user in most_followed_cursor:
        most_followed.append(user)
    
    return {
        "top_by_likes": top_by_likes,
        "top_by_teams": top_by_teams,
        "most_followed": most_followed
    }

@router.get("/followers")
async def get_followers(current_user: User = Depends(get_current_user)):
    """Get current user's followers"""
    db = await get_database()
    
    user_doc = await db.users.find_one({"id": current_user.id})
    follower_ids = user_doc.get("followers", [])
    
    if not follower_ids:
        return {"followers": []}
    
    followers_cursor = db.users.find({"id": {"$in": follower_ids}})
    followers = []
    async for follower in followers_cursor:
        followers.append(UserPublic(**follower))
    
    return {"followers": followers}

@router.get("/following")
async def get_following(current_user: User = Depends(get_current_user)):
    """Get current user's following"""
    db = await get_database()
    
    user_doc = await db.users.find_one({"id": current_user.id})
    following_ids = user_doc.get("following", [])
    
    if not following_ids:
        return {"following": []}
    
    following_cursor = db.users.find({"id": {"$in": following_ids}})
    following = []
    async for followed_user in following_cursor:
        following.append(UserPublic(**followed_user))
    
    return {"following": following}

@router.get("/users/{user_id}/followers")
async def get_user_followers(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get followers of a specific user"""
    db = await get_database()
    
    user_doc = await db.users.find_one({"id": user_id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    follower_ids = user_doc.get("followers", [])
    
    if not follower_ids:
        return {"followers": []}
    
    followers_cursor = db.users.find({"id": {"$in": follower_ids}})
    followers = []
    async for follower in followers_cursor:
        followers.append(UserPublic(**follower))
    
    return {"followers": followers}

@router.get("/users/{user_id}/following")
async def get_user_following(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get following of a specific user"""
    db = await get_database()
    
    user_doc = await db.users.find_one({"id": user_id})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    following_ids = user_doc.get("following", [])
    
    if not following_ids:
        return {"following": []}
    
    following_cursor = db.users.find({"id": {"$in": following_ids}})
    following = []
    async for followed_user in following_cursor:
        following.append(UserPublic(**followed_user))
    
    return {"following": following}

@router.get("/stats")
async def get_community_stats(current_user: User = Depends(get_current_user)):
    """Get community statistics"""
    db = await get_database()
    
    # Total users
    total_users = await db.users.count_documents({})
    
    # Total teams
    total_teams = await db.teams.count_documents({})
    
    # Total public teams
    total_public_teams = await db.teams.count_documents({"is_public": True})
    
    # Total likes
    pipeline = [
        {"$group": {"_id": None, "total_likes": {"$sum": "$likes"}}}
    ]
    likes_result = await db.teams.aggregate(pipeline).to_list(1)
    total_likes = likes_result[0]["total_likes"] if likes_result else 0
    
    # Total views
    views_pipeline = [
        {"$group": {"_id": None, "total_views": {"$sum": "$views"}}}
    ]
    views_result = await db.teams.aggregate(views_pipeline).to_list(1)
    total_views = views_result[0]["total_views"] if views_result else 0
    
    return {
        "total_users": total_users,
        "total_teams": total_teams,
        "total_public_teams": total_public_teams,
        "total_likes": total_likes,
        "total_views": total_views
    }