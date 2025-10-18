from strands import Agent
from strands.models import BedrockModel
from strands.tools import tool
import json
import os
from datetime import datetime

# Simple memory storage class
class MemoryStore:
    def __init__(self):
        # Create memories directory and file path
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.memory_dir = os.path.join(current_dir, "..", "memories")
        os.makedirs(self.memory_dir, exist_ok=True)
        self.memory_file = os.path.join(self.memory_dir, "maestro_memories.json")
        self.memories = self._load_memories()
    
    def _load_memories(self):
        if os.path.exists(self.memory_file):
            try:
                with open(self.memory_file, 'r') as f:
                    return json.load(f)
            except:
                return []
        return []
    
    def _save_memories(self):
        os.makedirs(os.path.dirname(self.memory_file), exist_ok=True)
        with open(self.memory_file, 'w') as f:
            json.dump(self.memories, f, indent=2)
    
    def store_memory(self, query: str, resolution: str) -> str:
        memory = {
            "id": len(self.memories) + 1,
            "query": query,
            "resolution": resolution,
            "timestamp": datetime.now().isoformat()
        }
        self.memories.append(memory)
        self._save_memories()
        return f"MEMORY_STORED: Saved resolution for '{query[:50]}...' at {os.path.relpath(self.memory_file)}"
    
    def retrieve_memory(self, query: str) -> str:
        file_path = os.path.abspath(self.memory_file)
        if not os.path.exists(self.memory_file):
            return f"NO_MEMORY_FOUND (no memory file found)"
            
        query_lower = query.lower()
        for memory in self.memories:
            # Simple keyword matching
            query_words = [w for w in query_lower.split() if len(w) > 3]
            
            if any(word in memory["query"].lower() for word in query_words):
                return f"MEMORY_FOUND: {memory['resolution']} (from {file_path})"
        
        return f"NO_MEMORY_FOUND (searched in {file_path})"
    
    def list_memories(self) -> str:
        if not self.memories:
            return "No memories stored yet."
        
        result = "Stored memories:\n"
        for memory in self.memories[-5:]:  # Show last 5
            result += f"- {memory['query'][:60]}...\n"
        return result

# Global memory store - initialize once
_memory_store = None

def get_memory_store():
    global _memory_store
    if _memory_store is None:
        _memory_store = MemoryStore()
    return _memory_store

@tool
def retrieve_memory(query: str) -> str:
    """Search for similar past resolutions."""
    store = get_memory_store()
    result = store.retrieve_memory(query)
    print(f"[DEBUG] Memory retrieve: {result}")
    return result

@tool
def store_memory(query: str, resolution: str) -> str:
    """Store a new resolution."""
    store = get_memory_store()
    result = store.store_memory(query, resolution)
    print(f"[DEBUG] Memory store: {result}")
    return result

@tool
def list_memories() -> str:
    """List all stored memories."""
    store = get_memory_store()
    return store.list_memories()

# For backward compatibility
memory_store = get_memory_store()

def create_memory_agent():
    system_prompt = """You are the Memory Agent for MAESTRO IT Operations Platform.

When you receive a ticket for the FIRST time:
1. Call retrieve_memory to search for similar past issues
2. If found: Return "MEMORY_FOUND: [resolution]" and hand off to orchestrator_agent
3. If not found: Return "NO_MEMORY_FOUND" and hand off to orchestrator_agent

When asked to STORE a resolution (keywords: "store", "save", "resolution"):
1. MUST call store_memory tool with the query and resolution
2. Return confirmation and hand off to orchestrator_agent

CRITICAL: 
- Always call the actual tools (retrieve_memory or store_memory)
- Never assume or simulate tool results
- Always hand back to orchestrator_agent after your operation"""

    bedrock_model = BedrockModel(
        model_id="us.anthropic.claude-3-5-sonnet-20241022-v2:0",
        temperature=0.1
    )

    agent = Agent(
        name="memory_agent",
        system_prompt=system_prompt,
        model=bedrock_model,
        tools=[retrieve_memory, store_memory, list_memories]
    )
    
    return agent
