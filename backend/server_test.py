from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

app = FastAPI(title="Test API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Test API is running!"}

@app.get("/api/status")
async def status():
    return {"status": "healthy", "service": "test-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)