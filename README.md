# MAESTRO - AI-Powered Multi-Agent IT Operations Platform

MAESTRO is a swarm-based multi-agent system built on the Strands framework that automates IT operations through intelligent agent collaboration with persistent memory capabilities.

## Architecture

- **Orchestrator Agent**: Routes incoming tickets through memory system first, then to specialized agents
- **Memory Agent**: Stores, retrieves, and lists past resolutions using mem0.ai for persistent memory
- **Ticketing Agent**: Processes raw trouble tickets into structured format
- **Network Diagnostic Agent**: Performs network troubleshooting with ping, traceroute, and DNS tools
- **Cloud Service Agent**: Handles AWS/cloud service operations and troubleshooting

## Memory Integration Workflow

1. **Query Reception**: Orchestrator receives trouble ticket
2. **Memory Check**: Hands off to Memory Agent to search for similar past resolutions
3. **Memory Response**: 
   - If found: Returns cached resolution
   - If not found: Proceeds to appropriate specialized agent
4. **Resolution Storage**: After successful resolution, stores solution in memory for future use

## Setup

1. **Install Dependencies**
```bash
pip install -r requirements.txt
```

2. **Configure AWS Credentials**
```bash
# Option 1: AWS CLI
aws configure

# Option 2: Environment Variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-west-2"
```

3. **Request Bedrock Model Access**
- Go to AWS Console → Amazon Bedrock → Model access
- Request access to Claude 3.5 Sonnet model
- Wait for approval (usually immediate)

## Usage

Run the main application:
```bash
python main.py
```

Test memory functionality:
```bash
python test_memory.py
```

The system will process tickets with memory integration:
1. Orchestrator receives the raw ticket
2. Routes to Memory Agent to check for similar past resolutions
3. If no memory found, routes to appropriate specialized agent
4. After resolution, stores the solution in memory for future use

## Project Structure

```
MAESTRO/
├── agents/                 # Agent implementations
│   ├── orchestrator_agent.py
│   ├── memory_agent.py     # Memory management with mem0
│   ├── ticketing_agent.py
│   ├── network_diagnostic_agent.py
│   └── cloud_service_agent.py
├── tools/                  # Diagnostic tools
│   ├── network_tools.py
│   └── cloud_tools.py
├── schemas/                # Data schemas
│   └── ticket_schema.py
├── main.py                 # Main application
├── test_memory.py          # Memory functionality test
├── requirements.txt        # Dependencies
└── README.md              # This file
```

## Key Features

- **Amazon Bedrock Integration**: Uses Claude 3.5 Sonnet for intelligent agent reasoning
- **Memory Integration**: Persistent memory using mem0.ai for storing and retrieving past resolutions
- **Autonomous Agent Handoffs**: Uses Strands Swarm pattern for intelligent coordination
- **Network Diagnostics**: Real ping, traceroute, and DNS resolution tools
- **Cloud Service Operations**: AWS service troubleshooting and management
- **Structured Ticket Processing**: Converts raw tickets to standardized format
- **Auto-Resolution**: Attempts to resolve issues using cached solutions first
- **Escalation Path**: Provides detailed analysis for complex issues

## Memory Features

- **Store**: Save successful resolutions with semantic indexing
- **Retrieve**: Find similar past issues using semantic search  
- **List**: View all stored memories for audit and management
- **Persistent**: Memories persist across sessions using mem0.ai

## Requirements

- Python 3.8+
- AWS Account with Bedrock access
- AWS credentials configured
- Network access for diagnostic commands (ping, traceroute, nslookup)
