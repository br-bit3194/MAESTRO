"""
Utility functions for MAESTRO UI enhancements
"""
import json
import os
from datetime import datetime, timedelta
import streamlit as st

def load_config():
    """Load configuration from config.json"""
    config_path = os.path.join(os.path.dirname(_file_), 'config.json')
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return default config if file doesn't exist
        return {
            "ui_settings": {
                "app_name": "MAESTRO Enhanced",
                "default_theme": "light"
            }
        }

def save_config(config):
    """Save configuration to config.json"""
    config_path = os.path.join(os.path.dirname(_file_), 'config.json')
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)

def get_memory_file_path():
    """Get the path to the memories file"""
    memories_dir = os.path.join(os.path.dirname(os.path.abspath(_file_)), "memories")
    return os.path.join(memories_dir, "maestro_memories.json")

def load_memories():
    """Load memories from JSON file"""
    memory_file = get_memory_file_path()
    
    if os.path.exists(memory_file):
        try:
            with open(memory_file, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            return []
    return []

def save_ticket_to_history(ticket_data):
    """Save ticket data to session history"""
    if 'ticket_history' not in st.session_state:
        st.session_state['ticket_history'] = []
    
    st.session_state['ticket_history'].append(ticket_data)

def format_timestamp(timestamp_str):
    """Format timestamp string for display"""
    try:
        dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        return dt.strftime('%Y-%m-%d %H:%M:%S')
    except:
        return timestamp_str

def calculate_success_rate(tickets):
    """Calculate success rate from ticket history"""
    if not tickets:
        return 0.0
    
    successful = len([t for t in tickets if t.get('status') == 'completed'])
    return (successful / len(tickets)) * 100

def get_recent_activity(tickets, days=7):
    """Get recent activity within specified days"""
    if not tickets:
        return []
    
    cutoff_date = datetime.now() - timedelta(days=days)
    recent = []
    
    for ticket in tickets:
        try:
            ticket_date = datetime.fromisoformat(ticket.get('timestamp', ''))
            if ticket_date >= cutoff_date:
                recent.append(ticket)
        except:
            continue
    
    return recent

def create_status_badge(status):
    """Create colored status badge"""
    status_colors = {
        'completed': '🟢',
        'failed': '🔴', 
        'processing': '🟡',
        'pending': '⚪'
    }
    
    return f"{status_colors.get(status, '⚪')} {status.upper()}"

def export_to_json(data, filename):
    """Export data to JSON format"""
    return json.dumps(data, indent=2, default=str)

def search_memories(memories, query):
    """Search memories by query string"""
    if not query:
        return memories
    
    query_lower = query.lower()
    return [
        memory for memory in memories
        if query_lower in memory.get('query', '').lower() or
           query_lower in memory.get('resolution', '').lower()
    ]

def get_agent_statistics(ticket_history):
    """Calculate agent usage statistics"""
    agent_stats = {}
    
    for ticket in ticket_history:
        agents_used = ticket.get('agents_used', [])
        for agent in agents_used:
            if agent not in agent_stats:
                agent_stats[agent] = {
                    'total_uses': 0,
                    'successful_uses': 0,
                    'avg_execution_time': 0
                }
            
            agent_stats[agent]['total_uses'] += 1
            if ticket.get('status') == 'completed':
                agent_stats[agent]['successful_uses'] += 1
    
    # Calculate success rates
    for agent, stats in agent_stats.items():
        if stats['total_uses'] > 0:
            stats['success_rate'] = (stats['successful_uses'] / stats['total_uses']) * 100
        else:
            stats['success_rate'] = 0
    
    return agent_stats

def validate_ticket_input(description, priority, category):
    """Validate ticket input fields"""
    errors = []
    
    if not description or len(description.strip()) < 10:
        errors.append("Description must be at least 10 characters long")
    
    if not priority:
        errors.append("Priority must be selected")
    
    if not category:
        errors.append("Category must be selected")
    
    return errors

def create_ticket_summary(ticket_data):
    """Create a summary of ticket data"""
    summary = {
        'id': ticket_data.get('id', 'N/A'),
        'timestamp': format_timestamp(ticket_data.get('timestamp', '')),
        'priority': ticket_data.get('priority', 'Unknown'),
        'category': ticket_data.get('category', 'Unknown'),
        'status': ticket_data.get('status', 'Unknown'),
        'description_preview': ticket_data.get('description', '')[:100] + '...' if len(ticket_data.get('description', '')) > 100 else ticket_data.get('description', '')
    }
    
    return summary

class NotificationManager:
    """Manage UI notifications and alerts"""
    
    @staticmethod
    def success(message, duration=3):
        """Show success notification"""
        st.success(f"✅ {message}")
    
    @staticmethod
    def error(message, duration=5):
        """Show error notification"""
        st.error(f"❌ {message}")
    
    @staticmethod
    def warning(message, duration=4):
        """Show warning notification"""
        st.warning(f"⚠️ {message}")
    
    @staticmethod
    def info(message, duration=3):
        """Show info notification"""
        st.info(f"ℹ️ {message}")

class ProgressTracker:
    """Track and display progress for long-running operations"""
    
    def _init_(self, total_steps):
        self.total_steps = total_steps
        self.current_step = 0
        self.progress_bar = st.progress(0)
        self.status_text = st.empty()
    
    def update(self, step_name):
        """Update progress"""
        self.current_step += 1
        progress = self.current_step / self.total_steps
        self.progress_bar.progress(progress)
        self.status_text.text(f"Step {self.current_step}/{self.total_steps}: {step_name}")
    
    def complete(self, message="Complete!"):
        """Mark as complete"""
        self.progress_bar.progress(1.0)
        self.status_text.text(message)