import os
from typing import Dict, Any, List
import google.generativeai as genai
from .ticket_agent import TicketAgent
from .memory_agent import MemoryAgent
from .worker_agent import WorkerAgent


class OrchestratorAgent:
    """
    Orchestrator Agent receives tasks and routes them to worker agents.
    """
    def __init__(self, name="Orchestrator", llm_api_key=None):
        self.name = name
        self.llm_api_key = llm_api_key or os.getenv("GEMINI_API_KEY")
        
        # Initialize worker agents
        self.ticket_agent = TicketAgent()
        self.memory_agent = MemoryAgent()
        
        # Initialize Gemini LLM if API key is available
        if self.llm_api_key:
            genai.configure(api_key=self.llm_api_key)
            self.model = genai.GenerativeModel('gemini-pro')
        else:
            self.model = None
            print(f"[{self.name}] Warning: No Gemini API key provided, using rule-based routing")

    def log_action(self, action: str, details: str = ""):
        """Log orchestrator actions with consistent formatting."""
        message = f"{action}"
        if details:
            message += f": {details}"
        print(f"[{self.name}] {message}")

    def receive_task(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Receives a task and routes to appropriate worker agents."""
        self.log_action("received task", task)
        
        # Store task in memory first
        self.log_action("delegating to Memory Agent for task storage")
        memory_result = self.memory_agent.process_task(
            task, 
            {"operation": "store", "type": "task", "metadata": {"source": "orchestrator"}}
        )
        
        # Determine routing based on task type
        routing_decision = self._determine_routing(task)
        
        results = {
            "task": task,
            "routing_decision": routing_decision,
            "memory_storage": memory_result,
            "agent_results": []
        }
        
        # Route to appropriate agents
        for agent_type in routing_decision["agents"]:
            if agent_type == "ticket":
                self.log_action("delegating to Ticket Agent")
                ticket_result = self.ticket_agent.process_task(task, context)
                results["agent_results"].append({
                    "agent": "TicketAgent",
                    "result": ticket_result
                })
                
                # Store ticket creation in memory
                self.log_action("delegating to Memory Agent for ticket logging")
                self.memory_agent.process_task(
                    f"Ticket created: {ticket_result.get('ticket_id', 'N/A')}",
                    {"operation": "store", "type": "conversation", "metadata": {"ticket_id": ticket_result.get('ticket_id')}}
                )
            
            elif agent_type == "worker":
                self.log_action("delegating to Worker Agent stub")
                # Create a generic worker for demonstration
                worker = GenericWorkerAgent("generic_worker")
                worker_result = worker.process_task(task, context)
                results["agent_results"].append({
                    "agent": "GenericWorkerAgent", 
                    "result": worker_result
                })
        
        self.log_action("task processing completed", f"Routed to {len(routing_decision['agents'])} agents")
        return results

    def _determine_routing(self, task: str) -> Dict[str, Any]:
        """Determine which agents should handle the task."""
        task_lower = task.lower()
        
        # Simple rule-based routing (can be enhanced with LLM later)
        agents = []
        reasoning = ""
        
        # Check for system/infrastructure issues
        if any(keyword in task_lower for keyword in ["disk space", "memory", "cpu", "storage", "system", "server"]):
            agents.extend(["ticket", "worker"])
            reasoning = "System/infrastructure issue detected - routing to Ticket Agent for logging and Worker Agent for resolution"
        
        # Check for general requests
        elif any(keyword in task_lower for keyword in ["request", "help", "support", "issue", "problem"]):
            agents.append("ticket")
            reasoning = "General support request - routing to Ticket Agent for logging"
        
        # Default routing
        else:
            agents.append("ticket")
            reasoning = "Default routing - sending to Ticket Agent for logging"
        
        self.log_action("routing decision", reasoning)
        
        return {
            "agents": agents,
            "reasoning": reasoning
        }


class GenericWorkerAgent(WorkerAgent):
    """Generic worker agent for demonstration purposes."""
    
    def __init__(self, agent_id: str):
        super().__init__(agent_id, "Generic Worker")
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process a generic task."""
        self.log_action("processing task", task)
        
        # Simulate some work
        if "disk space" in task.lower():
            self.log_action("analyzing disk usage")
            self.log_action("identifying cleanup opportunities")
            result = {
                "status": "completed",
                "action_taken": "Disk cleanup analysis performed",
                "recommendations": [
                    "Clear temporary files",
                    "Archive old logs", 
                    "Remove unused applications"
                ]
            }
        else:
            result = {
                "status": "processed",
                "action_taken": "Generic task processing completed",
                "message": f"Task '{task}' has been processed by generic worker"
            }
        
        self.log_action("task completed", result["action_taken"])
        return result
