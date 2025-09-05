from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .routes import router

app = FastAPI(
    title="Memory Service",
    description="Service for managing memory storage and retrieval",
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
app.include_router(router, prefix="/memory", tags=["memory"])

@app.get("/")
async def root():
    return {"message": "Memory Service is running"}

@app.get("/health")
async def health_check():
    from .storage import cleanup_expired, memory_store
    import time
    
    cleanup_expired()
    return {
        "status": "healthy",
        "service": "memory",
        "total_items": len(memory_store),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ")
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)
