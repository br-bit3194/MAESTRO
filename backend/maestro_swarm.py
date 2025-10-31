import os
import sys
import logging
from pathlib import Path

# Add project root to Python path
project_root = str(Path(__file__).parent.parent.absolute())
if project_root not in sys.path:
    sys.path.append(project_root)

from strands.multiagent import Swarm

# Import agents from the agents package
from agents.orchestrator_agent import create_orchestrator_agent
from agents.memory_agent import create_memory_agent
from agents.ticketing_agent import create_ticketing_agent
from agents.network_diagnostic_agent import create_network_diagnostic_agent
from agents.cloud_service_agent import create_cloud_service_agent

# Enable debug logging
logging.getLogger("strands.multiagent").setLevel(logging.INFO)
logging.basicConfig(
    format="%(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler()]
)

def create_maestro_swarm():
    """Create MAESTRO multi-agent swarm for IT operations."""
    
    # Create specialized agents
    orchestrator = create_orchestrator_agent()
    memory = create_memory_agent()
    ticketing = create_ticketing_agent()
    network_diagnostic = create_network_diagnostic_agent()
    cloud_service = create_cloud_service_agent()
    
    # Create swarm with orchestrator as entry point
    swarm = Swarm(
        [orchestrator, memory, ticketing, network_diagnostic, cloud_service],
        # entry_point=orchestrator,
        max_handoffs=15,
        max_iterations=20,
        execution_timeout=540.0,  # 9 minutes
        node_timeout=120.0,        # 2 minute per agent
        repetitive_handoff_detection_window=4,
        repetitive_handoff_min_unique_agents=2
    )
    
    return swarm

def serialize_swarm_result(result):
    """Convert a Swarm result object to a serializable dictionary."""
    if result is None:
        return None
        
    serialized = {
        'status': str(getattr(result, 'status', 'UNKNOWN')),
        'execution_time': getattr(result, 'execution_time', None),
        'node_history': []
    }
    
    # Safely get node history if it exists
    if hasattr(result, 'node_history') and result.node_history:
        for node in result.node_history:
            node_data = {
                'node_id': str(getattr(node, 'node_id', 'unknown')),
                'status': str(getattr(node, 'status', 'UNKNOWN'))
            }
            
            # Safely get node result
            node_result = getattr(node, 'result', None)
            if node_result is not None:
                if hasattr(node_result, 'to_dict'):
                    node_data['result'] = node_result.to_dict()
                elif hasattr(node_result, 'dict'):
                    node_data['result'] = node_result.dict()
                elif hasattr(node_result, '__dict__'):
                    node_data['result'] = {k: v for k, v in node_result.__dict__.items() 
                                        if not k.startswith('_') and not callable(v)}
                else:
                    node_data['result'] = str(node_result)
            
            serialized['node_history'].append(node_data)
    
    # Add any additional attributes that are serializable
    for attr in ['output', 'error', 'metadata', 'message']:
        if hasattr(result, attr):
            value = getattr(result, attr)
            if value is not None:
                if isinstance(value, (str, int, float, bool, list, dict)):
                    serialized[attr] = value
                else:
                    serialized[attr] = str(value)
    
    return serialized

def run_maestro_workflow(ticket):
    """Run MAESTRO workflow for a given ticket and return serializable result."""
    try:
        # Create and execute the swarm
        maestro = create_maestro_swarm()
        result = maestro(ticket)
        
        # Convert the result to a serializable format
        return serialize_swarm_result(result)
        
    except Exception as e:
        # Return error information in a structured format
        return {
            'status': 'ERROR',
            'error': str(e),
            'node_history': [{
                'node_id': 'error_handler',
                'result': f'Error processing workflow: {str(e)}',
                'status': 'FAILED'
            }]
        }