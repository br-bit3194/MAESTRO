from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import json
from datetime import datetime
import os
from pathlib import Path

from maestro_swarm import run_maestro_workflow, create_maestro_swarm

app = FastAPI(title="MAESTRO API", version="1.0.0")

maestro_agent = create_maestro_swarm()

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
    ticket = next((t for t in tickets_db if t["id"] == ticket_id), None)
    
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    try:
        # Get the raw result from the maestro agent
        raw_result = maestro_agent(ticket["description"])
        
        # Convert the result to a serializable format
        if hasattr(raw_result, 'to_dict'):
            result = raw_result.to_dict()
        elif hasattr(raw_result, 'dict'):
            result = raw_result.dict()
        elif hasattr(raw_result, '__dict__'):
            result = {k: v for k, v in raw_result.__dict__.items() 
                     if not k.startswith('_') and not callable(v)}
        else:
            result = str(raw_result)
            
        # Update ticket status
        ticket["status"] = "Processed"
        ticket["processed_at"] = datetime.utcnow().isoformat()
        
        return {
            "status": "success",
            "ticket_id": ticket_id,
            "result": result
        }

    except Exception as e:
        if ticket:
            ticket["status"] = "Error"
            ticket["error"] = str(e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing ticket: {str(e)}"
        )

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
