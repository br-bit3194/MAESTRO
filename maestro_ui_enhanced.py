import streamlit as st
import sys
import os
from datetime import datetime, timedelta
import json
import time
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from io import BytesIO
import base64

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(_file_)))

from main import run_maestro_workflow

# Initialize session state
if 'ticket_history' not in st.session_state:
    st.session_state['ticket_history'] = []
if 'chat_messages' not in st.session_state:
    st.session_state['chat_messages'] = []
if 'dark_mode' not in st.session_state:
    st.session_state['dark_mode'] = False

def load_memories():
    """Load memories from JSON file"""
    memories_dir = os.path.join(os.path.dirname(os.path.abspath(_file_)), "memories")
    memory_file = os.path.join(memories_dir, "maestro_memories.json")
    
    if os.path.exists(memory_file):
        try:
            with open(memory_file, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

def create_analytics_dashboard():
    """Create analytics dashboard with metrics and charts"""
    st.header("📊 MAESTRO Analytics Dashboard")
    
    memories = load_memories()
    ticket_history = st.session_state.get('ticket_history', [])
    
    # Metrics row
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric(
            label="📋 Total Tickets Processed",
            value=len(ticket_history),
            delta=len([t for t in ticket_history if t.get('timestamp', '') > (datetime.now() - timedelta(days=1)).isoformat()])
        )
    
    with col2:
        success_rate = len([t for t in ticket_history if t.get('status') == 'completed']) / max(len(ticket_history), 1) * 100
        st.metric(
            label="✅ Success Rate",
            value=f"{success_rate:.1f}%"
        )
    
    with col3:
        st.metric(
            label="🧠 Memories Stored",
            value=len(memories)
        )
    
    with col4:
        avg_time = sum([t.get('execution_time', 0) for t in ticket_history]) / max(len(ticket_history), 1)
        st.metric(
            label="⏱️ Avg Resolution Time",
            value=f"{avg_time:.1f}s"
        )
    
    # Charts section
    if ticket_history:
        col1, col2 = st.columns(2)
        
        with col1:
            # Ticket status distribution
            status_data = {}
            for ticket in ticket_history:
                status = ticket.get('status', 'unknown')
                status_data[status] = status_data.get(status, 0) + 1
            
            fig_pie = px.pie(
                values=list(status_data.values()),
                names=list(status_data.keys()),
                title="Ticket Status Distribution"
            )
            st.plotly_chart(fig_pie, use_container_width=True)
        
        with col2:
            # Tickets over time
            df_tickets = pd.DataFrame(ticket_history)
            if not df_tickets.empty and 'timestamp' in df_tickets.columns:
                df_tickets['date'] = pd.to_datetime(df_tickets['timestamp']).dt.date
                daily_counts = df_tickets.groupby('date').size().reset_index(name='count')
                
                fig_line = px.line(
                    daily_counts,
                    x='date',
                    y='count',
                    title="Tickets Processed Over Time"
                )
                st.plotly_chart(fig_line, use_container_width=True)
    
    # Agent performance
    if ticket_history:
        st.subheader("🤖 Agent Performance")
        agent_stats = {}
        for ticket in ticket_history:
            agents = ticket.get('agents_used', [])
            for agent in agents:
                if agent not in agent_stats:
                    agent_stats[agent] = {'count': 0, 'success': 0}
                agent_stats[agent]['count'] += 1
                if ticket.get('status') == 'completed':
                    agent_stats[agent]['success'] += 1
        
        if agent_stats:
            agent_df = pd.DataFrame([
                {
                    'Agent': agent,
                    'Total Uses': stats['count'],
                    'Success Rate': f"{(stats['success'] / stats['count'] * 100):.1f}%"
                }
                for agent, stats in agent_stats.items()
            ])
            st.dataframe(agent_df, use_container_width=True)

def create_chat_interface():
    """Create chat-like interface for interacting with MAESTRO"""
    st.header("💬 Chat with MAESTRO")
    
    # Chat management controls
    col1, col2, col3 = st.columns([2, 1, 1])
    with col1:
        st.write(f"💬 *Chat History:* {len(st.session_state['chat_messages'])} messages")
    with col2:
        if st.button("📋 Export Chat", help="Export chat history as JSON"):
            if st.session_state['chat_messages']:
                chat_json = json.dumps(st.session_state['chat_messages'], indent=2)
                st.download_button(
                    label="💾 Download Chat",
                    data=chat_json,
                    file_name=f"maestro_chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                    mime="application/json"
                )
            else:
                st.warning("No chat history to export")
    with col3:
        if st.button("🗑️ Clear Chat", help="Clear all chat messages"):
            st.session_state['chat_messages'] = []
            st.rerun()
    
    st.markdown("---")
    
    # Quick action buttons
    st.subheader("🚀 Quick Actions")
    col1, col2, col3, col4 = st.columns(4)
    
    quick_prompts = {
        "AWS S3 Issue": "I cannot access my S3 bucket. Please help diagnose the issue.",
        "Network Problem": "Users are experiencing network connectivity issues. Please investigate.",
        "System Health": "Can you check the overall system health and performance?",
        "Memory Status": "Show me the current memory usage and stored resolutions."
    }
    
    for i, (label, prompt) in enumerate(quick_prompts.items()):
        col = [col1, col2, col3, col4][i]
        with col:
            if st.button(f"📱 {label}", use_container_width=True):
                st.session_state['quick_prompt'] = prompt
    
    # Use quick prompt if selected
    if 'quick_prompt' in st.session_state:
        st.info(f"💡 Quick prompt selected: {st.session_state['quick_prompt']}")
        if st.button("✅ Send This Prompt"):
            # Process the quick prompt
            prompt = st.session_state['quick_prompt']
            del st.session_state['quick_prompt']
            
            # Add user message
            st.session_state['chat_messages'].append({
                'role': 'user',
                'content': prompt,
                'timestamp': datetime.now().isoformat()
            })
            st.rerun()
    
    st.markdown("---")
    
    # Chat history display
    chat_container = st.container()
    with chat_container:
        if not st.session_state['chat_messages']:
            st.info("👋 Welcome! Start a conversation with MAESTRO by typing a message below.")
            st.markdown("""
            *What you can ask MAESTRO:*
            - AWS and cloud service issues
            - Network connectivity problems
            - System diagnostics and health checks
            - Database performance issues
            - General IT troubleshooting
            """)
        else:
            for i, message in enumerate(st.session_state['chat_messages']):
                if message['role'] == 'user':
                    st.chat_message("user").write(message['content'])
                else:
                    st.chat_message("assistant").markdown(message['content'])
    
    # Chat input
    if prompt := st.chat_input("Ask MAESTRO about your IT issues..."):
        # Add user message
        st.session_state['chat_messages'].append({
            'role': 'user',
            'content': prompt,
            'timestamp': datetime.now().isoformat()
        })
        
        # Display user message
        st.chat_message("user").write(prompt)
        
        # Process with MAESTRO
        with st.chat_message("assistant"):
            with st.spinner("MAESTRO is thinking..."):
                try:
                    result = run_maestro_workflow(prompt)
                    
                    # Build comprehensive response
                    response = "🤖 *MAESTRO Analysis Complete*\n\n"
                    
                    # Add status information
                    if hasattr(result, 'status'):
                        status_emoji = "✅" if result.status.name == "COMPLETED" else "⚠️"
                        response += f"{status_emoji} *Status:* {result.status.name}\n\n"
                    
                    # Add execution details
                    if hasattr(result, 'execution_time'):
                        response += f"⏱️ *Processing Time:* {result.execution_time}ms\n\n"
                    
                    # Add agents involved
                    if hasattr(result, 'node_history') and result.node_history:
                        agents = [node.node_id for node in result.node_history]
                        response += f"🤖 *Agents Used:* {', '.join(set(agents))}\n\n"
                        
                        # Extract the final resolution (same logic as maestro_ui_enhanced.py)
                        final_resolution = None
                        for node in reversed(result.node_history):
                            if hasattr(node, 'result') and node.result and str(node.result).strip():
                                final_resolution = str(node.result)
                                break
                        
                        if final_resolution:
                            response += f"🎯 *Resolution:*\n{final_resolution}\n\n"
                        else:
                            # Check memory for the resolution (same as maestro_ui_enhanced.py)
                            memories = load_memories()
                            if memories:
                                latest_resolution = memories[-1]['resolution']
                                response += f"🎯 *Resolution:*\n{latest_resolution}\n\n"
                        
                        # Add workflow details
                        response += "📋 *Workflow Details:*\n"
                        for i, node in enumerate(result.node_history):
                            agent_name = node.node_id.replace('_', ' ').title()
                            response += f"{i+1}. {agent_name}\n"
                    else:
                        response += "✅ *Resolution:* Request processed successfully!\n\n"
                    
                    # Add memory check note
                    response += "\n💡 This resolution has been stored in memory for future reference."
                    
                    st.markdown(response)
                    
                    # Add assistant message to history
                    st.session_state['chat_messages'].append({
                        'role': 'assistant',
                        'content': response,
                        'timestamp': datetime.now().isoformat()
                    })
                    
                except Exception as e:
                    error_msg = f"❌ *Error:* Sorry, I encountered an issue while processing your request.\n\n*Details:* {str(e)}\n\n💡 *Tip:* Try rephrasing your question or check if the MAESTRO agents are properly configured."
                    st.error(error_msg)
                    st.session_state['chat_messages'].append({
                        'role': 'assistant',
                        'content': error_msg,
                        'timestamp': datetime.now().isoformat()
                    })

def create_memory_explorer():
    """Advanced memory search and management"""
    st.header("🧠 Memory Explorer")
    
    memories = load_memories()
    
    if not memories:
        st.info("No memories stored yet. Process some tickets to build the memory bank!")
        return
    
    # Search functionality
    col1, col2 = st.columns([2, 1])
    with col1:
        search_query = st.text_input("🔍 Search memories:", placeholder="Search for keywords in queries or resolutions...")
    with col2:
        sort_by = st.selectbox("Sort by:", ["Newest First", "Oldest First", "Query Length"])
    
    # Filter memories based on search
    filtered_memories = memories
    if search_query:
        filtered_memories = [
            memory for memory in memories
            if search_query.lower() in memory.get('query', '').lower() or
               search_query.lower() in memory.get('resolution', '').lower()
        ]
    
    # Sort memories
    if sort_by == "Newest First":
        filtered_memories.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    elif sort_by == "Oldest First":
        filtered_memories.sort(key=lambda x: x.get('timestamp', ''))
    elif sort_by == "Query Length":
        filtered_memories.sort(key=lambda x: len(x.get('query', '')), reverse=True)
    
    st.write(f"Found {len(filtered_memories)} memories")
    
    # Display memories in expandable cards
    for i, memory in enumerate(filtered_memories):
        with st.expander(f"Memory #{memory.get('id', i+1)}: {memory.get('query', '')[:60]}..."):
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("*Query:*")
                st.write(memory.get('query', 'No query'))
                
            with col2:
                st.write("*Timestamp:*")
                st.write(memory.get('timestamp', 'No timestamp'))
            
            st.write("*Resolution:*")
            st.write(memory.get('resolution', 'No resolution'))
            
            # Action buttons
            col1, col2, col3 = st.columns(3)
            with col1:
                if st.button(f"📋 Copy Query", key=f"copy_query_{i}"):
                    st.code(memory.get('query', ''))
            with col2:
                if st.button(f"📝 Copy Resolution", key=f"copy_res_{i}"):
                    st.code(memory.get('resolution', ''))

def export_data():
    """Export functionality for reports and data"""
    st.header("📤 Export Data")
    
    memories = load_memories()
    ticket_history = st.session_state.get('ticket_history', [])
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Export Memories")
        if memories:
            # JSON export
            memories_json = json.dumps(memories, indent=2)
            st.download_button(
                label="📥 Download Memories (JSON)",
                data=memories_json,
                file_name=f"maestro_memories_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )
            
            # CSV export
            memories_df = pd.DataFrame(memories)
            csv = memories_df.to_csv(index=False)
            st.download_button(
                label="📊 Download Memories (CSV)",
                data=csv,
                file_name=f"maestro_memories_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )
        else:
            st.info("No memories to export")
    
    with col2:
        st.subheader("Export Ticket History")
        if ticket_history:
            # JSON export
            history_json = json.dumps(ticket_history, indent=2)
            st.download_button(
                label="📥 Download History (JSON)",
                data=history_json,
                file_name=f"maestro_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json",
                mime="application/json"
            )
            
            # CSV export
            history_df = pd.DataFrame(ticket_history)
            csv = history_df.to_csv(index=False)
            st.download_button(
                label="📊 Download History (CSV)",
                data=csv,
                file_name=f"maestro_history_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                mime="text/csv"
            )
        else:
            st.info("No ticket history to export")

def apply_custom_css(dark_mode=False):
    """Apply custom CSS based on theme mode"""
    if dark_mode:
        # Dark mode CSS
        st.markdown("""
        <style>
        .stApp {
            background-color: #1e1e1e;
            color: #ffffff;
        }
        .main-header {
            background: linear-gradient(90deg, #4a5568 0%, #2d3748 100%);
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            text-align: center;
            color: white;
        }
        .metric-card {
            background: #2d3748;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #667eea;
            color: white;
        }
        .stSelectbox > div > div {
            background-color: #2d3748;
            color: white;
        }
        .stTextInput > div > div > input {
            background-color: #2d3748;
            color: white;
        }
        .stTextArea > div > div > textarea {
            background-color: #2d3748;
            color: white;
        }
        .stSidebar > div {
            background-color: #1a202c;
        }
        .status-success {
            color: #68d391;
            font-weight: bold;
        }
        .status-error {
            color: #fc8181;
            font-weight: bold;
        }
        div[data-testid="stExpander"] {
            background-color: #2d3748;
            border: 1px solid #4a5568;
        }
        .streamlit-expanderHeader {
            background-color: #2d3748;
            color: white;
        }
        .stButton > button {
            background-color: #4a5568;
            color: white;
            border: 1px solid #667eea;
        }
        .stButton > button:hover {
            background-color: #667eea;
            border: 1px solid #667eea;
        }
        .stSelectbox label {
            color: white;
        }
        .stTextInput label {
            color: white;
        }
        .stTextArea label {
            color: white;
        }
        .stCheckbox label {
            color: white;
        }
        div[data-testid="metric-container"] {
            background-color: #2d3748;
            border: 1px solid #4a5568;
            padding: 1rem;
            border-radius: 8px;
        }
        div[data-testid="metric-container"] label {
            color: #a0aec0;
        }
        div[data-testid="metric-container"] div {
            color: white;
        }
        </style>
        """, unsafe_allow_html=True)
    else:
        # Light mode CSS
        st.markdown("""
        <style>
        .stApp {
            background-color: #ffffff;
            color: #000000;
        }
        .main-header {
            background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 2rem;
            text-align: center;
            color: white;
        }
        .metric-card {
            background: #f0f2f6;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        .status-success {
            color: #28a745;
            font-weight: bold;
        }
        .status-error {
            color: #dc3545;
            font-weight: bold;
        }
        div[data-testid="stExpander"] {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
        }
        .stButton > button {
            background-color: #667eea;
            color: white;
            border: 1px solid #667eea;
        }
        .stButton > button:hover {
            background-color: #5a67d8;
            border: 1px solid #5a67d8;
        }
        div[data-testid="metric-container"] {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            padding: 1rem;
            border-radius: 8px;
        }
        </style>
        """, unsafe_allow_html=True)
def main():
    st.set_page_config(
        page_title="MAESTRO - Enhanced AI IT Operations",
        page_icon="🤖",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    # Initialize theme
    if 'dark_mode' not in st.session_state:
        st.session_state['dark_mode'] = False
    
    # Apply theme-specific CSS
    apply_custom_css(st.session_state.get('dark_mode', False))
    
    # Header
    header_title = "🤖 MAESTRO Enhanced - AI-Powered Multi-Agent IT Operations Platform"
    header_subtitle = "Advanced analytics, chat interface, and memory management"
    
    if st.session_state.get('dark_mode', False):
        st.markdown(f"""
        <div class="main-header">
            <h1>{header_title}</h1>
            <p>{header_subtitle}</p>
        </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown(f"""
        <div class="main-header">
            <h1>{header_title}</h1>
            <p>{header_subtitle}</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Sidebar navigation
    with st.sidebar:
        st.header("🔧 Navigation")
        
        # Initialize page selection in session state
        if 'current_page' not in st.session_state:
            st.session_state['current_page'] = "🏠 Dashboard"
        
        # Navigation buttons
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("🏠 Dashboard", use_container_width=True):
                st.session_state['current_page'] = "🏠 Dashboard"
            
            if st.button("💬 Chat Interface", use_container_width=True):
                st.session_state['current_page'] = "💬 Chat Interface"
            
            if st.button("📊 Analytics", use_container_width=True):
                st.session_state['current_page'] = "📊 Analytics"
        
        with col2:
            if st.button("📋 Submit Ticket", use_container_width=True):
                st.session_state['current_page'] = "📋 Submit Ticket"
            
            if st.button("🧠 Memory Explorer", use_container_width=True):
                st.session_state['current_page'] = "🧠 Memory Explorer"
            
            if st.button("📤  Export Data", use_container_width=True):
                st.session_state['current_page'] = "📤 Export Data"
        
        # Display current page
        st.info(f"*Current:* {st.session_state['current_page']}")
        
        page = st.session_state['current_page']
        
        st.markdown("---")
        
        # Settings
        st.header("⚙️ Settings")
        
        # Theme toggle with auto-rerun on change
        current_dark_mode = st.session_state.get('dark_mode', False)
        dark_mode = st.checkbox("🌙 Dark Mode", value=current_dark_mode)
        
        # Trigger rerun if theme changed
        if dark_mode != current_dark_mode:
            st.session_state['dark_mode'] = dark_mode
            st.rerun()
        
        # Theme status indicator
        if st.session_state.get('dark_mode', False):
            st.info("🌙 Dark mode is active")
        else:
            st.info("☀️ Light mode is active")
        
        # Clear data options
        if st.button("🗑️ Clear Chat History"):
            st.session_state['chat_messages'] = []
            st.success("Chat history cleared!")
        
        if st.button("🗑️ Clear Ticket History"):
            st.session_state['ticket_history'] = []
            st.success("Ticket history cleared!")
        
        st.markdown("---")
        st.markdown("*System Status*")
        memories = load_memories()
        st.success(f"💾 {len(memories)} memories stored")
        st.info(f"🎫 {len(st.session_state.get('ticket_history', []))} tickets processed")
    
    # Main content based on selected page
    if page == "🏠 Dashboard":
        create_analytics_dashboard()
        
    elif page == "📋 Submit Ticket":
        # Create three columns (same layout as maestro_ui_enhanced.py)
        col1, col2, col3 = st.columns([1, 1, 1])
        
        with col1:
            st.header("📝 Submit IT Ticket")
            
            # Sidebar for configuration
            priority = st.selectbox("Priority", ["Low", "Medium", "High"], index=2)
            
            # Memory status
            st.subheader("📚 Memory Status")
            memories = load_memories()
            if memories:
                st.success(f"💾 {len(memories)} resolutions stored")
                
                if st.button("View Stored Memories"):
                    with st.expander("Stored Resolutions", expanded=True):
                        for i, memory in enumerate(memories):
                            st.write(f"*{i+1}. {memory['query'][:60]}...*")
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
                    st.write("*Workflow Steps:*")
                    
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
                        st.success(f"🎯 *Status:* {result.status.name}")
                    else:
                        st.warning(f"⚠️ *Status:* {result.status.name}")
                
                # Agents involved
                if hasattr(result, 'node_history') and result.node_history:
                    agents = [node.node_id for node in result.node_history]
                    st.info(f"🤖 *Agents Used:* {', '.join(set(agents))}")
                    
                    # Agent flow
                    st.subheader("Agent Execution Flow")
                    for i, node in enumerate(result.node_history):
                        st.write(f"{i+1}. *{node.node_id}*")
                
                # Execution time
                if hasattr(result, 'execution_time'):
                    st.metric("⏱️ Execution Time", f"{result.execution_time}ms")
                
                # Final resolution
                st.subheader("🎯 Final Resolution")
                if hasattr(result, 'node_history') and result.node_history:
                    # Get the last meaningful result
                    for node in reversed(result.node_history):
                        if hasattr(node, 'result') and node.result and str(node.result).strip():
                            st.write(f"*Agent:* {node.node_id}")
                            st.markdown(str(node.result))
                            break
                    else:
                        # Check memory for the resolution
                        memories = load_memories()
                        if memories:
                            latest_resolution = memories[-1]['resolution']
                            st.success(f"✅ *Resolution:* {latest_resolution}")
                        else:
                            st.write("Resolution completed - check memory for details")
                else:
                    st.write("Workflow executed successfully")
                    
            else:
                st.info("Results will appear here after processing a ticket")
        
    elif page == "💬 Chat Interface":
        create_chat_interface()
        
    elif page == "🧠 Memory Explorer":
        create_memory_explorer()
        
    elif page == "📊 Analytics":
        create_analytics_dashboard()
        
    elif page == "📤 Export Data":
        export_data()

if _name_ == "_main_":
    main()