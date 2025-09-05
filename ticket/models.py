from pydantic import BaseModel
from typing import Optional

class TicketCreate(BaseModel):
    title: str
    description: str
    priority: str = "medium"
    category: str
    assigned_to: Optional[str] = None

class TicketUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None

class Ticket(BaseModel):
    id: int
    title: str
    description: str
    priority: str
    status: str
    category: str
    assigned_to: Optional[str] = None
    created_at: str
    updated_at: str
