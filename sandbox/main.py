from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import time
from .routes import router

app = FastAPI(
    title="Sandbox Service",
    description="Service for executing code in a sandboxed environment",
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
app.include_router(router, tags=["sandbox"])

@app.get("/")
async def root():
    return {"message": "Sandbox Service is running"}

@app.get("/health")
async def health_check():
    from .executor import sandbox_environments
    return {
        "status": "healthy",
        "service": "sandbox",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "supported_languages": list(sandbox_environments.keys())
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)
