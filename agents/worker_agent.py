"""
Base Worker Agent class for specialized workers in the multi-agent system.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any
import logging

class WorkerAgent(ABC):
    """Base class for all specialized worker agents."""
    
    def __init__(self, agent_id: str, agent_type: str):
        self.agent_id = agent_id
        self.agent_type = agent_type
        self.logger = logging.getLogger(f"[{agent_type}]")
        
    def log_action(self, action: str, details: str = ""):
        """Log agent actions with consistent formatting."""
        message = f"{action}"
        if details:
            message += f": {details}"
        self.logger.info(message)
        print(f"[{self.agent_type}] {message}")
    
    @abstractmethod
    def process_task(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a task and return results."""
        pass
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status."""
        return {
            "agent_id": self.agent_id,
            "agent_type": self.agent_type,
            "status": "active"
        }