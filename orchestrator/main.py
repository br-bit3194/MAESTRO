from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import time
from .routes import router

app = FastAPI(
    title="Orchestrator Service",
    description="Service for orchestrating workflows and managing service coordination",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(router, tags=["orchestrator"])

@app.get("/")
async def root():
    return {"message": "Orchestrator Service is running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "orchestrator",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)
