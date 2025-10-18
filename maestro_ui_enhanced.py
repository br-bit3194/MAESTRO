import streamlit as st
import sys
import os
from datetime import datetime
import json
import time

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import run_maestro_workflow

def main():
    st.set_page_config(
        page_title="MAESTRO - AI IT Operations",
        page_icon="🤖",
        layout="wide"
    )
    
    st.title("🤖 MAESTRO - AI-Powered Multi-Agent IT Operations Platform")
    st.markdown("---")
    
    # Create three columns
    col1, col2, col3 = st.columns([1, 1, 1])
    
    with col1:
        st.header("📝 Submit IT Ticket")
        
        # Sidebar for configuration
        priority = st.selectbox("Priority", ["Low", "Medium", "High"], index=2)
        
        # Memory status
        st.subheader("📚 Memory Status")
        memory_file = "/memories/maestro_memories.json"
        if os.path.exists(memory_file):
            with open(memory_file, 'r') as f:
                memories = json.load(f)
            st.success(f"💾 {len(memories)} resolutions stored")
            
            if st.button("View Stored Memories"):
                with st.expander("Stored Resolutions", expanded=True):
                    for i, memory in enumerate(memories):
                        st.write(f"**{i+1}. {memory['query'][:60]}...**")
                        st.write(f"Resolution: {memory['resolution'][:100]}...")
                        st.write(f"Stored: {memory['timestamp']}")
                        st.write("---")
        else:
            st.info("💾 No memories stored yet")
        
        # Ticket input form
        with st.form("ticket_form"):
            ticket_description = st.text_area(
                "Describe your IT issue:",
                placeholder="Example: I'm facing an issue where I cannot access 'demo-superop-bucket' in AWS account 'XXXXXXXXXX'",
                height=200
            )
            
            submitted = st.form_submit_button("🚀 Process Ticket", use_container_width=True)
    
    with col2:
        st.header("🔄 Live Workflow Progress")
        
        if submitted and ticket_description:
            # Create ticket object
            ticket = f"""
            {ticket_description}
            Priority: {priority}
            
            Please check and resolve this issue
            """
            
            # Progress tracking
            progress_container = st.container()
            
            with progress_container:
                st.write("**Workflow Steps:**")
                
                # Step indicators
                step1 = st.empty()
                step2 = st.empty()
                step3 = st.empty()
                step4 = st.empty()
                step5 = st.empty()
                
                # Show workflow steps
                step1.write("🔍 1. Checking memory for similar issues...")
                time.sleep(0.5)
                
                step2.write("📋 2. Analyzing ticket structure...")
                time.sleep(0.5)
                
                step3.write("🛠️ 3. Routing to appropriate agent...")
                time.sleep(0.5)
                
                step4.write("⚡ 4. Executing diagnostic/resolution...")
                time.sleep(0.5)
                
                step5.write("💾 5. Storing resolution in memory...")
                
                # Run the actual workflow
                try:
                    with st.spinner("🤖 MAESTRO agents are working..."):
                        result = run_maestro_workflow(ticket)
                    
                    st.session_state['last_result'] = result
                    
                    # Update steps with completion
                    step1.write("✅ 1. Memory check completed")
                    step2.write("✅ 2. Ticket analysis completed")
                    step3.write("✅ 3. Agent routing completed")
                    step4.write("✅ 4. Resolution executed")
                    step5.write("✅ 5. Memory updated")
                    
                    st.success("🎉 Workflow completed successfully!")
                    
                except Exception as e:
                    st.error(f"❌ Error: {str(e)}")
                    step5.write("❌ 5. Workflow failed")
        else:
            st.info("👆 Submit a ticket to see live progress")
    
    with col3:
        st.header("📊 Results & Analysis")
        
        if 'last_result' in st.session_state:
            result = st.session_state['last_result']
            
            # Status card
            if hasattr(result, 'status'):
                if result.status.name == "COMPLETED":
                    st.success(f"🎯 **Status:** {result.status.name}")
                else:
                    st.warning(f"⚠️ **Status:** {result.status.name}")
            
            # Agents involved
            if hasattr(result, 'node_history') and result.node_history:
                agents = [node.node_id for node in result.node_history]
                st.info(f"🤖 **Agents Used:** {', '.join(set(agents))}")
                
                # Agent flow
                st.subheader("Agent Execution Flow")
                for i, node in enumerate(result.node_history):
                    st.write(f"{i+1}. **{node.node_id}**")
            
            # Execution time
            if hasattr(result, 'execution_time'):
                st.metric("⏱️ Execution Time", f"{result.execution_time}ms")
            
            # Final resolution
            st.subheader("🎯 Final Resolution")
            if hasattr(result, 'node_history') and result.node_history:
                # Get the last meaningful result
                for node in reversed(result.node_history):
                    if hasattr(node, 'result') and node.result and str(node.result).strip():
                        st.write(f"**Agent:** {node.node_id}")
                        st.markdown(str(node.result))
                        break
                else:
                    # Check memory for the resolution
                    memory_file = "/memories/maestro_memories.json"
                    if os.path.exists(memory_file):
                        with open(memory_file, 'r') as f:
                            memories = json.load(f)
                        if memories:
                            latest_resolution = memories[-1]['resolution']
                            st.success(f"✅ **Resolution:** {latest_resolution}")
                        else:
                            st.write("Resolution completed - check memory for details")
                    else:
                        st.write("Resolution completed - check memory for details")
            else:
                st.write("Workflow executed successfully")
                
        else:
            st.info("Results will appear here after processing a ticket")

if __name__ == "__main__":
    main()
