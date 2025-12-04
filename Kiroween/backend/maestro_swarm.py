"""
Haunted Helpdesk Swarm Orchestration

Creates and configures the Haunted Helpdesk multi-agent swarm with all six specialized agents.
Manages swarm parameters including handoff limits, timeouts, and repetitive handoff detection.
"""

from strands_agents import Swarm
from agents.orchestrator_agent import create_orchestrator_agent
from agents.memory_agent import create_memory_agent
from agents.ticketing_agent import create_ticketing_agent
from agents.network_diagnostic_agent import create_network_diagnostic_agent
from agents.cloud_service_agent import create_cloud_service_agent
from agents.summarization_agent import create_summarization_agent


def create_Haunted Helpdesk_swarm() -> Swarm:
    """
    Create and configure the Haunted Helpdesk multi-agent swarm.
    
    The swarm consists of six specialized agents:
    1. Orchestrator Agent - Central routing and workflow coordination
    2. Memory Agent - Persistent memory storage and retrieval
    3. Ticketing Agent - Ticket processing and status management
    4. Network Diagnostic Agent - Network troubleshooting
    5. Cloud Service Agent - AWS/cloud diagnostics
    6. Summarization Agent - Resolution summary creation
    
    Returns:
        Configured Swarm instance ready for ticket processing
    """
    # Initialize all six agents
    orchestrator = create_orchestrator_agent()
    memory = create_memory_agent()
    ticketing = create_ticketing_agent()
    network_diagnostic = create_network_diagnostic_agent()
    cloud_service = create_cloud_service_agent()
    summarization = create_summarization_agent()
    
    # Create swarm with all agents and configuration parameters
    swarm = Swarm(
        agents=[
            orchestrator,
            memory,
            ticketing,
            network_diagnostic,
            cloud_service,
            summarization
        ],
        max_handoffs=20,  # Maximum number of agent handoffs before termination
        max_iterations=25,  # Maximum iterations per agent
        execution_timeout=600.0,  # Total workflow timeout in seconds (10 minutes)
        node_timeout=120.0,  # Individual agent timeout in seconds (2 minutes)
        repetitive_handoff_detection_window=4,  # Window size for detecting loops
        repetitive_handoff_min_unique_agents=2  # Minimum unique agents to avoid loop detection
    )
    
    return swarm
