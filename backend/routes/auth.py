from fastapi import APIRouter, HTTPException, Depends, status, Response, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, timezone
import jwt
import bcrypt
import uuid
from typing import Optional

from models.user import UserCreate, UserLogin, User, UserInDB, Token, UserUpdate, FollowRequest
from database import get_database

router = APIRouter()
security = HTTPBearer()

# JWT settings
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 30
REFRESH_COOKIE_NAME = "refresh_token"

# -----------------------------
# Helper functions
# -----------------------------

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(user_id: str, expires_delta: Optional[timedelta] = None):
    """Create a JWT refresh token and return (token, jti, exp)"""
    jti = str(uuid.uuid4())
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": user_id,
        "jti": jti,
        "type": "refresh",
        "exp": expire,
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token, jti, expire


async def store_refresh_token(jti: str, user_id: str, expires_at: datetime):
    db = await get_database()
    await db.refresh_tokens.insert_one({
        "jti": jti,
        "user_id": user_id,
        "expires_at": expires_at,
        "revoked": False,
        "created_at": datetime.now(timezone.utc)
    })


async def revoke_refresh_token(jti: str):
    db = await get_database()
    await db.refresh_tokens.update_one({"jti": jti}, {"$set": {"revoked": True}})


async def is_refresh_token_valid(jti: str, user_id: str) -> bool:
    db = await get_database()
    doc = await db.refresh_tokens.find_one({"jti": jti, "user_id": user_id})
    if not doc:
        return False
    if doc.get("revoked"):
        return False
    if doc.get("expires_at") and datetime.now(timezone.utc) >= doc["expires_at"]:
        return False
    return True


def set_refresh_cookie(response: Response, token: str):
    # HttpOnly Secure cookie; SameSite Lax to allow top-level navigation
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite="lax",
        path="/",
        max_age=int(timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS).total_seconds())
    )


def clear_refresh_cookie(response: Response):
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/")


# -----------------------------
# Dependencies
# -----------------------------
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get the current authenticated user (via access token)"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        token_type: str = payload.get("type")
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid access token type"
            )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    db = await get_database()
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return User(**user)


# -----------------------------
# Auth routes
# -----------------------------
@router.post("/register", response_model=Token)
async def register(user_data: UserCreate, response: Response):
    """Register a new user, and set refresh token cookie"""
    db = await get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = await db.users.find_one({"username": user_data.username})
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create user
    user_id = str(uuid.uuid4())
    hashed_password = hash_password(user_data.password)
    
    user_dict = {
        "id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "coach_level": user_data.coach_level,
        "favorite_position": user_data.favorite_position,
        "favorite_element": user_data.favorite_element,
        "favourite_team": user_data.favourite_team,
        "profile_picture": user_data.profile_picture,
        "bio": user_data.bio,
        "kizuna_stars": user_data.kizuna_stars,
        "total_teams": 0,
        "total_likes_received": 0,
        "followers": [],
        "following": [],
        "hashed_password": hashed_password,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.users.insert_one(user_dict)
    
    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_id}, expires_delta=access_token_expires
    )
    refresh_token, jti, exp = create_refresh_token(user_id)
    await store_refresh_token(jti, user_id, exp)
    set_refresh_cookie(response, refresh_token)
    
    user = User(**user_dict)
    return Token(access_token=access_token, token_type="bearer", user=user)


@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, response: Response):
    """Login user and set refresh token cookie"""
    db = await get_database()
    
    # Find user by email
    user_doc = await db.users.find_one({"email": user_credentials.email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(user_credentials.password, user_doc["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create tokens
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_doc["id"]}, expires_delta=access_token_expires
    )
    # Remember me controls refresh token lifetime
    refresh_lifetime = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS if (user_credentials.remember_me is None or user_credentials.remember_me) else 7)
    refresh_token, jti, exp = create_refresh_token(user_doc["id"], expires_delta=refresh_lifetime)
    await store_refresh_token(jti, user_doc["id"], exp)
    set_refresh_cookie(response, refresh_token)
    
    user = User(**user_doc)
    return Token(access_token=access_token, token_type="bearer", user=user)


@router.post("/refresh")
async def refresh_token_endpoint(request: Request, response: Response):
    """Rotate refresh token and return a new access token."""
    cookie = request.cookies.get(REFRESH_COOKIE_NAME)
    if not cookie:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    try:
        payload = jwt.decode(cookie, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        user_id = payload.get("sub")
        jti = payload.get("jti")
        exp = payload.get("exp")
        if not user_id or not jti:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    # Check DB validity
    valid = await is_refresh_token_valid(jti, user_id)
    if not valid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token revoked or expired")

    # Rotate: revoke old, issue new
    await revoke_refresh_token(jti)
    new_refresh_token, new_jti, new_exp = create_refresh_token(user_id)
    await store_refresh_token(new_jti, user_id, new_exp)
    set_refresh_cookie(response, new_refresh_token)

    # Issue new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(data={"sub": user_id}, expires_delta=access_token_expires)

    return {"access_token": new_access_token, "token_type": "bearer"}


@router.post("/logout")
async def logout(request: Request, response: Response):
    """Revoke current refresh token and clear cookie."""
    cookie = request.cookies.get(REFRESH_COOKIE_NAME)
    if cookie:
        try:
            payload = jwt.decode(cookie, SECRET_KEY, algorithms=[ALGORITHM])
            if payload.get("type") == "refresh":
                jti = payload.get("jti")
                if jti:
                    await revoke_refresh_token(jti)
        except jwt.PyJWTError:
            pass
    clear_refresh_cookie(response)
    return {"detail": "Logged out"}


@router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=User)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user information"""
    db = await get_database()
    
    update_data = user_update.dict(exclude_unset=True)
    if not update_data:
        return current_user
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"id": current_user.id})
    return User(**updated_user)