import logging
from strands.multiagent import Swarm
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

def run_maestro_workflow(ticket):
    """Run MAESTRO workflow for a given ticket and return result."""
    maestro = create_maestro_swarm()
    result = maestro(ticket)
    return result

def main():
    """Main function to run MAESTRO."""
    print("🤖 MAESTRO - AI-Powered Multi-Agent IT Operations Platform")
    print("=" * 60)
    
    # Create the swarm
    maestro = create_maestro_swarm()
    
    # Test cases
    network_ticket = """
    Network Connectivity Issue Report:
    
    Problem: Users reporting slow response times when accessing google.com
    Symptoms: Page loads taking 5-10 seconds, intermittent timeouts
    Affected Service: Web browsing to external sites
    Impact: Multiple users in office network
    Reporter: Network Admin
    Priority: Medium
    
    Please diagnose connectivity and routing to google.com
    """
    
    s3_ticket = """
    I'm facing an issue where I cannot access 'demo-superop-bucket' in AWS account 'XXXXXXXXXX'
    Error: Bucket not found or does not exist
    Priority: High
    
    Please check if bucket exists and resolve access issue
    """
    
    # Choose which ticket to process
    sample_ticket = s3_ticket  # Change to network_ticket for network issues
    
    print("Processing the ticket with Memory Integration...")
    print(f"Ticket: {sample_ticket}")
    print("\n" + "=" * 60)
    
    try:
        # Execute the swarm
        result = maestro(sample_ticket)
        
        print(f"\n🎯 Resolution Status: {result.status}")
        print(f"📊 Agents Involved: {[node.node_id for node in result.node_history]}")
        print(f"⏱️  Total Execution Time: {result.execution_time}ms")
        
        # Print final result
        if result.status.name == "COMPLETED":
            print("\n✅ RESOLUTION COMPLETE")
            print("=" * 60)
            print("The ticket has been successfully processed and resolved by the MAESTRO agents.")
        else:
            print(f"\n❌ Resolution failed with status: {result.status.name}")
            
    except Exception as e:
        print(f"❌ Error running MAESTRO: {str(e)}")

if __name__ == "__main__":
    main()
