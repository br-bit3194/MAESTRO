"""
Main demonstration of the multi-agent system.
Shows how the Orchestrator receives a "Low Disk Space" task and delegates it through the agent hierarchy.
"""

import os
from dotenv import load_dotenv
from agents import OrchestratorAgent

def main():
    """Demonstrate the multi-agent system with a 'Low Disk Space' scenario."""
    
    # Load environment variables
    load_dotenv()
    
    print("=" * 60)
    print("MAESTRO Multi-Agent System Demonstration")
    print("=" * 60)
    print()
    
    # Initialize the orchestrator
    print("Initializing Orchestrator Agent...")
    orchestrator = OrchestratorAgent(name="Orchestrator")
    print()
    
    # Simulate receiving a "Low Disk Space" task
    task = "Low Disk Space"
    context = {
        "priority": "high",
        "source": "system_monitor",
        "details": "Server disk usage at 95% capacity"
    }
    
    print(f"🚨 INCOMING TASK: '{task}'")
    print(f"📋 Context: {context}")
    print()
    print("Agent Interaction Flow:")
    print("-" * 40)
    
    # Process the task through the orchestrator
    result = orchestrator.receive_task(task, context)
    
    print()
    print("-" * 40)
    print("📊 FINAL RESULTS:")
    print("-" * 40)
    
    # Display the results
    print(f"✅ Task: {result['task']}")
    print(f"🎯 Routing Decision: {result['routing_decision']['reasoning']}")
    print(f"📝 Memory Storage: {result['memory_storage']['status']}")
    print()
    
    print("🤖 Agent Results:")
    for i, agent_result in enumerate(result['agent_results'], 1):
        agent_name = agent_result['agent']
        agent_data = agent_result['result']
        
        print(f"  {i}. {agent_name}:")
        if agent_name == "TicketAgent":
            print(f"     - Ticket ID: {agent_data.get('ticket_id', 'N/A')}")
            print(f"     - Status: {agent_data.get('status', 'N/A')}")
            print(f"     - Message: {agent_data.get('message', 'N/A')}")
        elif agent_name == "GenericWorkerAgent":
            print(f"     - Status: {agent_data.get('status', 'N/A')}")
            print(f"     - Action: {agent_data.get('action_taken', 'N/A')}")
            if 'recommendations' in agent_data:
                print(f"     - Recommendations:")
                for rec in agent_data['recommendations']:
                    print(f"       • {rec}")
        print()
    
    # Demonstrate memory retrieval
    print("🧠 MEMORY SYSTEM DEMONSTRATION:")
    print("-" * 40)
    
    # Retrieve recent tasks from memory
    memory_result = orchestrator.memory_agent.process_task(
        "recent tasks", 
        {"operation": "retrieve", "type": "task", "limit": 3}
    )
    
    print("Recent tasks in memory:")
    for i, memory_entry in enumerate(memory_result['results'], 1):
        print(f"  {i}. {memory_entry['content']} (Type: {memory_entry['type']})")
    
    print()
    
    # Retrieve conversation history
    conversation_result = orchestrator.memory_agent.process_task(
        "conversation history",
        {"operation": "retrieve", "type": "conversation", "limit": 3}
    )
    
    print("Recent conversation history:")
    for i, conv_entry in enumerate(conversation_result['results'], 1):
        print(f"  {i}. {conv_entry['content']} (Timestamp: {conv_entry['timestamp'][:19]})")
    
    print()
    print("=" * 60)
    print("✅ Multi-Agent System Demonstration Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
