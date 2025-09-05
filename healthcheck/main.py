from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .routes import router

app = FastAPI(
    title="Healthcheck Service",
    description="Service for monitoring system health and service status",
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
app.include_router(router, prefix="/health", tags=["health"])

@app.get("/")
async def root():
    return {"message": "Healthcheck Service is running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
