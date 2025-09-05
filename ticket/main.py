from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .routes import router

app = FastAPI(
    title="Ticket Service",
    description="Service for managing tickets and support requests",
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
app.include_router(router, prefix="/tickets", tags=["tickets"])

@app.get("/")
async def root():
    return {"message": "Ticket Service is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ticket"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
