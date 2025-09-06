"""
Memory Agent for storing and retrieving conversation context and task history.
"""

from typing import Any, Dict, List, Optional
from datetime import datetime
from .worker_agent import WorkerAgent


class MemoryAgent(WorkerAgent):
    """
    Agent responsible for managing memory, context, and conversation history.
    """
    
    def __init__(self, agent_id: str = "memory_agent"):
        super().__init__(agent_id, "Memory Agent")
        # Stub memory storage - in-memory dictionaries
        self.conversation_history: List[Dict[str, Any]] = []
        self.context_store: Dict[str, Any] = {}
        self.task_history: List[Dict[str, Any]] = []
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Process a memory-related task (store, retrieve, or search).
        
        Args:
            task: The memory operation to perform
            context: Additional context including operation type and data
            
        Returns:
            Dictionary containing the operation result
        """
        self.log_action("processing memory task", task)
        
        if not context:
            context = {}
        
        operation = context.get("operation", "store")
        
        if operation == "store":
            return self._store_memory(task, context)
        elif operation == "retrieve":
            return self._retrieve_memory(task, context)
        elif operation == "search":
            return self._search_memory(task, context)
        else:
            return {"error": f"Unknown memory operation: {operation}"}
    
    def _store_memory(self, content: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Store content in memory."""
        memory_type = context.get("type", "general")
        timestamp = datetime.now().isoformat()
        
        memory_entry = {
            "content": content,
            "type": memory_type,
            "timestamp": timestamp,
            "metadata": context.get("metadata", {})
        }
        
        if memory_type == "conversation":
            self.conversation_history.append(memory_entry)
        elif memory_type == "task":
            self.task_history.append(memory_entry)
        else:
            # Store in general context store
            key = context.get("key", f"memory_{len(self.context_store)}")
            self.context_store[key] = memory_entry
        
        self.log_action("memory stored", f"Type: {memory_type}")
        
        return {
            "status": "stored",
            "type": memory_type,
            "timestamp": timestamp,
            "message": "Memory successfully stored"
        }
    
    def _retrieve_memory(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Retrieve memory based on query."""
        memory_type = context.get("type", "all")
        limit = context.get("limit", 10)
        
        results = []
        
        if memory_type in ["conversation", "all"]:
            results.extend(self.conversation_history[-limit:])
        
        if memory_type in ["task", "all"]:
            results.extend(self.task_history[-limit:])
        
        if memory_type in ["context", "all"]:
            results.extend(list(self.context_store.values())[-limit:])
        
        self.log_action("memory retrieved", f"Found {len(results)} entries")
        
        return {
            "status": "retrieved",
            "results": results,
            "count": len(results),
            "query": query
        }
    
    def _search_memory(self, query: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Search memory for specific content."""
        query_lower = query.lower()
        results = []
        
        # Search conversation history
        for entry in self.conversation_history:
            if query_lower in entry["content"].lower():
                results.append(entry)
        
        # Search task history
        for entry in self.task_history:
            if query_lower in entry["content"].lower():
                results.append(entry)
        
        # Search context store
        for entry in self.context_store.values():
            if query_lower in entry["content"].lower():
                results.append(entry)
        
        self.log_action("memory searched", f"Query: '{query}', Found: {len(results)}")
        
        return {
            "status": "searched",
            "results": results,
            "count": len(results),
            "query": query
        }
    
    def get_conversation_context(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get recent conversation context."""
        return self.conversation_history[-limit:]
    
    def clear_memory(self, memory_type: str = "all") -> Dict[str, Any]:
        """Clear memory of specified type."""
        if memory_type in ["conversation", "all"]:
            self.conversation_history.clear()
        
        if memory_type in ["task", "all"]:
            self.task_history.clear()
        
        if memory_type in ["context", "all"]:
            self.context_store.clear()
        
        self.log_action("memory cleared", f"Type: {memory_type}")
        
        return {
            "status": "cleared",
            "type": memory_type,
            "message": f"Memory of type '{memory_type}' has been cleared"
        }
