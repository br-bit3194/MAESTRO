from typing import List, Dict
from .models import Ticket

# In-memory storage (replace with database in production)
tickets_db: List[Ticket] = []
ticket_counter = 1

def get_tickets() -> List[Ticket]:
    """Get all tickets"""
    return tickets_db

def get_ticket(ticket_id: int) -> Ticket:
    """Get a specific ticket by ID"""
    for ticket in tickets_db:
        if ticket.id == ticket_id:
            return ticket
    return None

def create_ticket(ticket_data: dict) -> Ticket:
    """Create a new ticket"""
    global ticket_counter
    ticket_data['id'] = ticket_counter
    ticket_data['status'] = 'open'
    ticket_data['created_at'] = '2024-01-01T00:00:00Z'
    ticket_data['updated_at'] = '2024-01-01T00:00:00Z'
    
    ticket = Ticket(**ticket_data)
    tickets_db.append(ticket)
    ticket_counter += 1
    return ticket

def update_ticket(ticket_id: int, update_data: dict) -> Ticket:
    """Update a ticket"""
    for i, ticket in enumerate(tickets_db):
        if ticket.id == ticket_id:
            for field, value in update_data.items():
                if value is not None:
                    setattr(tickets_db[i], field, value)
            tickets_db[i].updated_at = '2024-01-01T00:00:00Z'
            return tickets_db[i]
    return None

def delete_ticket(ticket_id: int) -> bool:
    """Delete a ticket"""
    global tickets_db
    original_length = len(tickets_db)
    tickets_db = [ticket for ticket in tickets_db if ticket.id != ticket_id]
    return len(tickets_db) < original_length
