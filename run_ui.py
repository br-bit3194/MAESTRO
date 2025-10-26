#!/usr/bin/env python3
"""
MAESTRO UI Launcher
Run this script to start the Streamlit web interface
"""

import subprocess
import sys
import os

def main():
    print("🤖 Starting MAESTRO UI...")
    print("📍 Navigate to: http://localhost:8501")
    print("🛑 Press Ctrl+C to stop")
    
    # Change to the correct directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Run streamlit
    try:
        subprocess.run([
            sys.executable, "-m", "streamlit", "run", "maestro_ui_enhanced.py",
            "--server.port", "8507",
            "--server.address", "localhost"
        ])
    except KeyboardInterrupt:
        print("\n👋 MAESTRO UI stopped")

if __name__ == "__main__":
    main()
