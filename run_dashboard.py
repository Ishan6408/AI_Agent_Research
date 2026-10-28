import sys
import subprocess
import os

if __name__ == '__main__':
    # Get the absolute path to the dashboard app
    dashboard_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dashboard', 'app.py')
    
    print("Starting the VEIL Dashboard...")
    
    # Run streamlit via the current python executable
    # This bypasses the "streamlit is not recognized" error in Windows terminals
    subprocess.run([sys.executable, "-m", "streamlit", "run", dashboard_path])
