from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import json
from datetime import datetime
import os
from pathlib import Path

app = FastAPI(title="MAESTRO API", version="1.0.0")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure memories directory exists
os.makedirs("memories", exist_ok=True)

# In-memory storage for tickets (replace with a database in production)
tickets_db = []
MEMORY_FILE = "memories/maestro_memories.json"

os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)

class TicketBase(BaseModel):
    description: str
    priority: str = "Medium"
    timestamp: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class Ticket(TicketBase):
    id: str
    status: str = "Open"
    created_at: str
    resolved_at: Optional[str] = None
    
    class Config:
        from_attributes = True

@app.post("/api/tickets", response_model=Ticket)
async def create_ticket(ticket: TicketCreate):
    """Create a new ticket"""
    ticket_id = f"TKT-{len(tickets_db) + 1:04d}"
    now = datetime.utcnow().isoformat()
    
    new_ticket = Ticket(
        id=ticket_id,
        description=ticket.description,
        priority=ticket.priority,
        created_at=now,
        timestamp=ticket.timestamp or now
    )
    
    tickets_db.append(new_ticket.dict())
    
    # Here you would typically call your MAESTRO workflow
    # For now, we'll just return the created ticket
    return new_ticket

@app.get("/api/tickets", response_model=List[Ticket])
async def list_tickets():
    """List all tickets"""
    return tickets_db

@app.get("/api/tickets/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: str):
    """Get a specific ticket by ID"""
    for ticket in tickets_db:
        if ticket["id"] == ticket_id:
            return ticket
    raise HTTPException(status_code=404, detail="Ticket not found")

@app.post("/api/process-ticket/{ticket_id}")
async def process_ticket(ticket_id: str):
    """Process a ticket using the MAESTRO workflow"""
    # Find the ticket
    ticket = None
    for t in tickets_db:
        if t["id"] == ticket_id:
            ticket = t
            break
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    try:
        # Here you would call your MAESTRO workflow
        # result = run_maestro_workflow(ticket["description"])
        
        # For now, we'll simulate processing
        import time
        time.sleep(2)
        
        # Update ticket status
        ticket["status"] = "In Progress"
        
        # Simulate some processing steps
        steps = [
            "🔍 Checking memory for similar issues...",
            "📋 Analyzing ticket structure...",
            "🛠️ Routing to appropriate agent...",
            "⚡ Executing diagnostic/resolution...",
            "💾 Storing resolution in memory..."
        ]
        
        for step in steps:
            time.sleep(0.5)
            print(step)
        
        # Mark as resolved
        ticket["status"] = "Resolved"
        ticket["resolved_at"] = datetime.utcnow().isoformat()
        
        # Save to memory
        save_to_memory(ticket)
        
        return {
            "status": "success",
            "message": "Ticket processed successfully",
            "ticket_id": ticket_id
        }
    except Exception as e:
        ticket["status"] = "Error"
        raise HTTPException(status_code=500, detail=str(e))

def save_to_memory(ticket: dict):
    """Save resolution to memory file"""
    try:
        memory_entry = {
            "query": ticket["description"],
            "resolution": f"Ticket {ticket['id']} resolved",
            "timestamp": datetime.utcnow().isoformat(),
            "ticket_id": ticket["id"],
            "priority": ticket["priority"]
        }
        
        # Load existing memories
        if os.path.exists(MEMORY_FILE):
            with open(MEMORY_FILE, 'r') as f:
                memories = json.load(f)
        else:
            memories = []
        
        # Add new memory
        memories.append(memory_entry)
        
        # Save back to file
        with open(MEMORY_FILE, 'w') as f:
            json.dump(memories, f, indent=2)
            
    except Exception as e:
        print(f"Error saving to memory: {e}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
