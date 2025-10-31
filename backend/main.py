from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import json
from datetime import datetime, timezone
import os
from pathlib import Path
import uuid

from maestro_swarm import run_maestro_workflow, create_maestro_swarm
from dynamodb_utils import db_manager

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

# Path for memory file
MEMORY_FILE = "memories/maestro_memories.json"
os.makedirs(os.path.dirname(MEMORY_FILE), exist_ok=True)

class TicketBase(BaseModel):
    description: str
    priority: str = "Medium"
    timestamp: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class Ticket(TicketBase):
    ticket_id: str = Field(..., alias="id")  # Maps id to ticket_id for API responses
    status: str = "Open"
    created_at: str
    resolved_at: Optional[str] = None
    
    class Config:
        from_attributes = True
        populate_by_name = True  # Allow both id and ticket_id in input data

@app.post("/api/tickets", response_model=Ticket)
async def create_ticket(ticket: TicketCreate):
    """Create a new ticket in DynamoDB"""
    ticket_id = f"TKT-{str(uuid.uuid4())}"
    now = datetime.now(timezone.utc).isoformat()
    
    new_ticket = {
        'ticket_id': ticket_id,
        'description': ticket.description,
        'priority': ticket.priority,
        'status': 'Open',
        'created_at': now,
        'timestamp': ticket.timestamp or now
    }
    
    # Save to DynamoDB
    try:
        db_manager.create_ticket(new_ticket)
        return Ticket(**new_ticket)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create ticket: {str(e)}"
        )

@app.get("/api/tickets", response_model=List[Ticket])
async def list_tickets():
    """List all tickets from DynamoDB"""
    try:
        tickets = db_manager.list_tickets()
        # Convert DynamoDB items to Ticket models
        return [Ticket(**ticket) for ticket in tickets]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve tickets: {str(e)}"
        )

@app.get("/api/tickets/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: str):
    """Get a specific ticket by ID from DynamoDB"""
    ticket = db_manager.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return Ticket(**ticket)

@app.post("/api/process-ticket/{ticket_id}")
async def process_ticket(ticket_id: str):
    """Process a ticket using the MAESTRO workflow"""
    # Get the ticket from DynamoDB
    ticket = db_manager.get_ticket(ticket_id)
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
            
        # Update ticket status in DynamoDB
        update_data = {
            'status': 'Processed',
            'processed_at': datetime.now(timezone.utc).isoformat(),
            'result': result
        }
        updated_ticket = db_manager.update_ticket(ticket_id, update_data)
        
        if not updated_ticket:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update ticket status"
            )
            
        return {
            "status": "success",
            "ticket_id": ticket_id,
            "result": result
        }

    except Exception as e:
        # Update ticket status to Error in DynamoDB
        if ticket:
            db_manager.update_ticket(ticket_id, {
                'status': 'Error',
                'error': str(e),
                'processed_at': datetime.now(timezone.utc).isoformat()
            })
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing ticket: {str(e)}"
        )

def save_to_memory(ticket: dict):
    """Save resolution to memory file"""
    try:
        memory_entry = {
            "query": ticket["description"],
            "resolution": f"Ticket {ticket['ticket_id']} resolved",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "ticket_id": ticket["ticket_id"],
            "priority": ticket.get("priority", "Medium")
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
