from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_database()
    yield
    # Shutdown
    pass

app = FastAPI(title="Inazuma Eleven API", version="1.0.0", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Inazuma Eleven API is running!"}

@app.get("/api/status")
async def status():
    return {"status": "healthy", "service": "inazuma-eleven-api"}

# Include routers
try:
    from routes import auth, user_teams, community, teams, characters, equipment
    app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
    app.include_router(user_teams.router, prefix="/api", tags=["user_teams"])
    app.include_router(community.router, prefix="/api/community", tags=["community"])
    app.include_router(teams.router, prefix="/api", tags=["teams"])
    app.include_router(characters.router, prefix="/api", tags=["characters"])
    app.include_router(equipment.router, prefix="/api", tags=["equipment"])
except Exception as e:
    print(f"Error importing routes: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)