from typing import Any, Dict, List, Optional
from datetime import datetime
from .worker_agent import WorkerAgent


class TicketAgent(WorkerAgent):
    """
    Agent responsible for logging ticket requests into a stub database.
    """
    
    def __init__(self, agent_id: str = "ticket_agent"):
        super().__init__(agent_id, "Ticket Agent")
        # Stub database - just a Python dict
        self.ticket_db: Dict[str, Dict[str, Any]] = {}
        self.ticket_counter = 0
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Process a ticket-related task by logging it to the stub database.
        
        Args:
            task: The task description
            context: Additional context for the task
            
        Returns:
            Dictionary containing the ticket information
        """
        self.log_action("processing ticket request", task)
        
        # Generate ticket ID
        self.ticket_counter += 1
        ticket_id = f"TICKET-{self.ticket_counter:04d}"
        
        # Create ticket entry with proper timestamp
        current_time = datetime.now().isoformat()
        ticket_entry = {
            "id": ticket_id,
            "description": task,
            "context": context or {},
            "status": "open",
            "priority": context.get("priority", "medium") if context else "medium",
            "assigned_to": context.get("assigned_to") if context else None,
            "created_at": current_time,
            "updated_at": current_time
        }
        
        # Store in stub database
        self.ticket_db[ticket_id] = ticket_entry
        
        self.log_action("ticket logged successfully", f"ID: {ticket_id}")
        
        return {
            "ticket_id": ticket_id,
            "status": "logged",
            "message": f"Ticket {ticket_id} has been created and logged",
            "ticket_data": ticket_entry
        }
    
    def get_ticket(self, ticket_id: str) -> Dict[str, Any]:
        """Retrieve a ticket by ID from the stub database."""
        return self.ticket_db.get(ticket_id, {})
    
    def list_tickets(self) -> Dict[str, Dict[str, Any]]:
        """Return all tickets from the stub database."""
        return self.ticket_db.copy()
    
    def update_ticket_status(self, ticket_id: str, status: str) -> bool:
        """Update the status of a ticket."""
        if ticket_id in self.ticket_db:
            self.ticket_db[ticket_id]["status"] = status
            self.log_action(f"updated ticket {ticket_id} status to {status}")
            return True
        return False
