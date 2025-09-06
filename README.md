# MAESTRO - Multi-Agent System with CrewAI

A Python-based multi-agent architecture using CrewAI and Google Gemini LLM for intelligent task orchestration and delegation.

## Overview

MAESTRO demonstrates a hierarchical multi-agent system where an Orchestrator Agent receives tasks and intelligently routes them to specialized worker agents:

- **Orchestrator Agent**: Receives tasks and routes them to appropriate worker agents
- **Ticket Agent**: Logs ticket requests into a stub database (Python dict)
- **Memory Agent**: Stores and retrieves knowledge and conversation history
- **Worker Agent**: Base class for specialized workers with a generic implementation

## Features

- 🤖 **Multi-Agent Architecture**: Hierarchical agent system with clear delegation patterns
- 🧠 **Gemini LLM Integration**: Optional Google Gemini integration for intelligent routing
- 📝 **Consistent Logging**: All agents use standardized logging format `[AgentName] message`
- 🎯 **Task Routing**: Intelligent task classification and agent delegation
- 💾 **Memory System**: Persistent storage of tasks, conversations, and context
- 🎫 **Ticket Management**: Automated ticket creation and tracking

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MAESTRO
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (optional):
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY if you want LLM-powered routing
```

## Usage

### Basic Demo

Run the main demonstration to see the "Low Disk Space" scenario:

```bash
python main.py
```

This will show the complete agent interaction flow:
1. Orchestrator receives "Low Disk Space" task
2. Delegates to Memory Agent for task storage
3. Routes to Ticket Agent for logging
4. Delegates to Worker Agent for resolution
5. Stores results back in Memory Agent

### Expected Output

```
[Orchestrator] received task: Low Disk Space
[Orchestrator] delegating to Memory Agent for task storage
[Memory Agent] processing memory task: Low Disk Space
[Memory Agent] memory stored: Type: task
[Orchestrator] routing decision: System/infrastructure issue detected - routing to Ticket Agent for logging and Worker Agent for resolution
[Orchestrator] delegating to Ticket Agent
[Ticket Agent] processing ticket request: Low Disk Space
[Ticket Agent] ticket logged successfully: ID: TICKET-0001
[Orchestrator] delegating to Memory Agent for ticket logging
[Memory Agent] processing memory task: Ticket created: TICKET-0001
[Memory Agent] memory stored: Type: conversation
[Orchestrator] delegating to Worker Agent stub
[Generic Worker] processing task: Low Disk Space
[Generic Worker] analyzing disk usage
[Generic Worker] identifying cleanup opportunities
[Generic Worker] task completed: Disk cleanup analysis performed
[Orchestrator] task processing completed: Routed to 2 agents
```

## Architecture

### Agent Hierarchy

```
Orchestrator Agent (Main Controller)
├── Memory Agent (Knowledge Storage)
├── Ticket Agent (Issue Logging)
└── Worker Agents (Task Execution)
    └── Generic Worker (Default Implementation)
```

### Agent Communication Flow

1. **Task Reception**: Orchestrator receives external tasks
2. **Memory Storage**: Task stored in Memory Agent for context
3. **Routing Decision**: Orchestrator determines appropriate agents
4. **Delegation**: Tasks routed to specialized agents
5. **Result Aggregation**: Orchestrator collects and returns results

## Configuration

### Environment Variables

- `GEMINI_API_KEY`: Google Gemini API key for LLM-powered routing (optional)
- `DEBUG`: Enable debug logging (default: True)
- `LOG_LEVEL`: Logging level (default: INFO)

### Agent Configuration

Each agent can be customized through their constructors:

```python
from agents import OrchestratorAgent

# Initialize with custom configuration
orchestrator = OrchestratorAgent(
    name="CustomOrchestrator",
    llm_api_key="your-gemini-key"
)
```

## Extending the System

### Adding New Worker Agents

1. Create a new agent class inheriting from `WorkerAgent`:

```python
from agents.worker_agent import WorkerAgent

class CustomWorkerAgent(WorkerAgent):
    def __init__(self, agent_id: str):
        super().__init__(agent_id, "Custom Worker")
    
    def process_task(self, task: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        self.log_action("processing custom task", task)
        # Your custom logic here
        return {"status": "completed", "result": "Custom processing done"}
```

2. Register the agent in the Orchestrator's routing logic
3. Update the `__init__.py` imports

### Customizing Routing Logic

Modify the `_determine_routing` method in `OrchestratorAgent` to add new routing rules:

```python
def _determine_routing(self, task: str) -> Dict[str, Any]:
    # Add your custom routing logic
    if "custom_keyword" in task.lower():
        return {"agents": ["custom"], "reasoning": "Custom task detected"}
    # ... existing logic
```

## Dependencies

- `crewai==0.28.8`: Multi-agent framework
- `google-generativeai==0.3.2`: Google Gemini LLM integration
- `python-dotenv==1.0.0`: Environment variable management

## License

This project is part of the SuperHacks 2025 hackathon submission.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
MAESTRO - Multi-Agent Enterprise Service Transformation & Resolution Orchestrator