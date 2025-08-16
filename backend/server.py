from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_database

app = FastAPI(title="Inazuma Eleven API", version="1.0.0")

# Add CORS middleware
# Tight CORS: allow only the frontend origin from env if provided, else fallback to preview host
import os
FRONTEND_URL = os.environ.get('FRONTEND_URL') or os.environ.get('REACT_APP_FRONTEND_URL')
ALLOWED_ORIGINS = []
# If a specific frontend URL is not set, we can derive from the backend's known preview domain by allowing the preview host itself
# For safety, also allow the public preview frontend domain used in this environment if any is known via env.
if FRONTEND_URL:
    ALLOWED_ORIGINS = [FRONTEND_URL]
else:
    # As a safe default in this environment, allow the origin of the configured frontend if accessible via window.location at runtime.
    # We cannot access it here server-side; keep empty to force strict mode and rely on same-origin.
    ALLOWED_ORIGINS = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?://([a-zA-Z0-9-]+\.)*preview\.emergentagent\.com$|^http://localhost:3000$|^http://127\.0\.0\.1:3000$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await init_database()

@app.get("/")
async def root():
    return {"message": "Inazuma Eleven API is running!"}

@app.get("/api/status")
async def status():
    return {"status": "healthy", "service": "inazuma-eleven-api"}

# Include routers
try:
    from routes import auth, user_teams, community, teams, characters, equipment, constellations, techniques, utils, chat
    app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
    app.include_router(user_teams.router, prefix="/api", tags=["user_teams"])
    app.include_router(community.router, prefix="/api/community", tags=["community"])
    app.include_router(teams.router, prefix="/api", tags=["teams"])
    app.include_router(characters.router, prefix="/api", tags=["characters"])
    app.include_router(equipment.router, prefix="/api", tags=["equipment"])
    app.include_router(constellations.router, prefix="/api", tags=["constellations"])
    app.include_router(techniques.router, prefix="/api", tags=["techniques"])
    app.include_router(utils.router, prefix="/api", tags=["utils"])
except Exception as e:
    print(f"Error importing routes: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)