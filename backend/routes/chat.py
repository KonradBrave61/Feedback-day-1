from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from datetime import datetime
import uuid

from routes.auth import get_current_user
from models.user import User
from database import get_database

router = APIRouter()

# Utilities
async def _get_user(db, user_id: str):
    return await db.users.find_one({"id": user_id})

async def _is_blocked(db, sender_id: str, receiver_id: str) -> bool:
    # Either side blocking should prevent messages
    sender = await _get_user(db, sender_id)
    receiver = await _get_user(db, receiver_id)
    if not sender or not receiver:
        return True
    sender_blocked = sender.get("blocked_users", [])
    receiver_blocked = receiver.get("blocked_users", [])
    return (receiver_id in sender_blocked) or (sender_id in receiver_blocked)

@router.post("/chat/start")
async def start_conversation(
    partner_id: str,
    current_user: User = Depends(get_current_user)
):
    """Create or return an existing conversation between current_user and partner_id"""
    if partner_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot start a chat with yourself")

    db = await get_database()

    # Validate partner exists
    partner = await _get_user(db, partner_id)
    if not partner:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Basic access rule: user can chat with anyone they follow (as requested)
    # If not following, deny
    following = (await _get_user(db, current_user.id)).get("following", [])
    if partner_id not in following:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only chat with users you follow")

    # Check blocks
    if await _is_blocked(db, current_user.id, partner_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chat is blocked between users")

    # Check existing conversation
    convo = await db.chats.find_one({
        "participants": {"$all": [current_user.id, partner_id]},
        "$where": "this.participants.length === 2"
    })

    if convo:
        # Return simplified
        return {
            "success": True,
            "conversation": {
                "id": convo["id"],
                "participants": convo.get("participants", []),
                "updated_at": convo.get("updated_at"),
                "last_message": convo.get("last_message"),
                "unread_counts": convo.get("unread_counts", {})
            }
        }

    # Create conversation
    convo_id = str(uuid.uuid4())
    now = datetime.utcnow()
    convo_doc = {
        "id": convo_id,
        "participants": [current_user.id, partner_id],
        "created_at": now,
        "updated_at": now,
        "last_message": None,
        "unread_counts": {current_user.id: 0, partner_id: 0},
    }
    await db.chats.insert_one(convo_doc)
    
    # Remove MongoDB _id field for JSON serialization
    convo_doc.pop('_id', None)
    
    return {"success": True, "conversation": convo_doc}

@router.get("/chat/conversations")
async def list_conversations(current_user: User = Depends(get_current_user)):
    db = await get_database()
    cursor = db.chats.find({"participants": current_user.id}).sort([("updated_at", -1)])

    conversations = []
    async for c in cursor:
        # Determine partner id
        participants = c.get("participants", [])
        partner_id = next((p for p in participants if p != current_user.id), None)
        partner = await _get_user(db, partner_id) if partner_id else None
        conversations.append({
            "id": c["id"],
            "participants": participants,
            "updated_at": c.get("updated_at"),
            "last_message": c.get("last_message"),
            "unread": c.get("unread_counts", {}).get(current_user.id, 0),
            "partner": {
                "id": partner.get("id") if partner else None,
                "username": partner.get("username") if partner else None,
                "profile_picture": partner.get("profile_picture") if partner else None,
                "coach_level": partner.get("coach_level") if partner else None,
            }
        })
    return {"success": True, "conversations": conversations}

@router.get("/chat/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    after: Optional[str] = Query(None, description="ISO timestamp to fetch messages after"),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user)
):
    db = await get_database()

    convo = await db.chats.find_one({"id": conversation_id, "participants": current_user.id})
    if not convo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    query = {"conversation_id": conversation_id}
    if after:
        try:
            after_dt = datetime.fromisoformat(after)
            query["created_at"] = {"$gt": after_dt}
        except Exception:
            pass

    cursor = db.messages.find(query).sort([("created_at", 1)]).limit(limit)
    messages = []
    async for m in cursor:
        messages.append({
            "id": m["id"],
            "sender_id": m["sender_id"],
            "receiver_id": m["receiver_id"],
            "content": m["content"],
            "created_at": m["created_at"],
        })

    # Mark as read: set unread_counts[current_user.id] = 0
    await db.chats.update_one({"id": conversation_id}, {"$set": {f"unread_counts.{current_user.id}": 0}})

    return {"success": True, "messages": messages}

@router.post("/chat/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: str,
    payload: dict,
    current_user: User = Depends(get_current_user)
):
    content = (payload or {}).get("content", "").strip()
    if not content:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message content is required")

    db = await get_database()

    convo = await db.chats.find_one({"id": conversation_id, "participants": current_user.id})
    if not convo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")

    # Determine receiver
    participants = convo.get("participants", [])
    partner_id = next((p for p in participants if p != current_user.id), None)
    if not partner_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid conversation participants")

    # Check blocks
    if await _is_blocked(db, current_user.id, partner_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chat is blocked between users")

    msg_id = str(uuid.uuid4())
    now = datetime.utcnow()
    msg_doc = {
        "id": msg_id,
        "conversation_id": conversation_id,
        "sender_id": current_user.id,
        "receiver_id": partner_id,
        "content": content,
        "created_at": now,
    }

    await db.messages.insert_one(msg_doc)
    
    # Remove MongoDB _id field for JSON serialization
    msg_doc.pop('_id', None)

    # Update conversation last message and unread for partner
    await db.chats.update_one(
        {"id": conversation_id},
        {
            "$set": {
                "last_message": {
                    "content": content,
                    "sender_id": current_user.id,
                    "created_at": now,
                },
                "updated_at": now,
            },
            "$inc": {f"unread_counts.{partner_id}": 1}
        }
    )

    return {"success": True, "message": msg_doc}

@router.post("/chat/block")
async def block_user(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    db = await get_database()
    # ensure target exists
    target = await _get_user(db, user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.users.update_one(
        {"id": current_user.id},
        {"$addToSet": {"blocked_users": user_id}}
    )
    return {"success": True, "blocked": True}

@router.post("/chat/unblock")
async def unblock_user(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    db = await get_database()
    await db.users.update_one(
        {"id": current_user.id},
        {"$pull": {"blocked_users": user_id}}
    )
    return {"success": True, "blocked": False}

@router.get("/chat/settings")
async def get_chat_settings(current_user: User = Depends(get_current_user)):
    db = await get_database()
    user_doc = await db.users.find_one({"id": current_user.id})
    settings = user_doc.get("chat_settings", {
        "accept_messages_from": "following",
        "read_receipts": True,
        "notifications": True,
    })
    return {"success": True, "settings": settings, "blocked_users": user_doc.get("blocked_users", [])}

@router.put("/chat/settings")
async def update_chat_settings(
    settings: dict,
    current_user: User = Depends(get_current_user)
):
    db = await get_database()

    # Validate some known keys with defaults
    valid_settings = {}
    accept_values = {"everyone", "following", "mutual"}
    if isinstance(settings, dict):
        if "accept_messages_from" in settings and settings["accept_messages_from"] in accept_values:
            valid_settings["chat_settings.accept_messages_from"] = settings["accept_messages_from"]
        if "read_receipts" in settings:
            valid_settings["chat_settings.read_receipts"] = bool(settings["read_receipts"])
        if "notifications" in settings:
            valid_settings["chat_settings.notifications"] = bool(settings["notifications"])

    if not valid_settings:
        return {"success": True}

    await db.users.update_one({"id": current_user.id}, {"$set": valid_settings})

    return {"success": True}