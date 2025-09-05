from fastapi import APIRouter, HTTPException
from typing import List
from .models import Ticket, TicketCreate, TicketUpdate
from .database import get_tickets, get_ticket, create_ticket, update_ticket, delete_ticket

router = APIRouter()

@router.get("/", response_model=List[Ticket])
async def list_tickets():
    """Get all tickets"""
    return get_tickets()

@router.post("/", response_model=Ticket)
async def create_ticket_endpoint(ticket: TicketCreate):
    """Create a new ticket"""
    ticket_data = ticket.dict()
    return create_ticket(ticket_data)

@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket_endpoint(ticket_id: int):
    """Get a specific ticket"""
    ticket = get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.put("/{ticket_id}", response_model=Ticket)
async def update_ticket_endpoint(ticket_id: int, ticket_update: TicketUpdate):
    """Update a ticket"""
    update_data = ticket_update.dict(exclude_unset=True)
    ticket = update_ticket(ticket_id, update_data)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

@router.delete("/{ticket_id}")
async def delete_ticket_endpoint(ticket_id: int):
    """Delete a ticket"""
    if not delete_ticket(ticket_id):
        raise HTTPException(status_code=404, detail="Ticket not found")
    return {"message": "Ticket deleted successfully"}
