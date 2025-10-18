from pydantic import BaseModel
from typing import Literal

class TicketSchema(BaseModel):
    ticket_id: str
    problem_summary: str
    problem_category: Literal["network_connectivity", "network_latency", "routing_issues"]
    configuration_item: str
    agent_to_be_routed: Literal["network_diagnostic_agent"]
    severity: Literal["low", "medium", "high", "critical"]
