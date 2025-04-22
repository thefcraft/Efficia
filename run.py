import os
import dotenv

dotenv.load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

import subprocess
import signal
import atexit
import sys
from typing import List
import time
from api import app
import uvicorn

class BackgroundProcessManager:
    def __init__(self):
        self.processes: List[subprocess.Popen[bytes]] = []

    def start_process(self, command):
        """Start a background process (e.g., npm run dev)."""
        process = subprocess.Popen(command, shell=True)
        self.processes.append(process)
        print(f"Started process: {command}")
        return process

    def stop_all_processes(self):
        """Terminate all running background processes."""
        print("Stopping all background processes...")
        for process in self.processes:
            process.kill()  # Forcefully terminate the process
            process.wait()  # Wait for the process to finish
        print("All background processes stopped.")

    def cleanup(self, signum=None, frame=None):
        """Cleanup processes when receiving an interrupt (e.g., Ctrl+C)."""
        print("Received interrupt signal, cleaning up...")
        self.stop_all_processes()

if __name__ == "__main__":
    # Register cleanup to handle interrupt signals (Ctrl+C)
    process_manager = BackgroundProcessManager()

    # Register cleanup function for SIGINT (Ctrl+C)
    signal.signal(signal.SIGINT, process_manager.cleanup)

    # Register the cleanup function to be run on script exit
    atexit.register(process_manager.cleanup)

    # Start processes (e.g., 'npm run dev' or other commands)
    # process_manager.start_process('uv run run_api.py')
    process_manager.start_process('cd frontend && npm run dev')  # Example of another background task
    process_manager.start_process('uv run run_service.py')

    # Run indefinitely until interrupted by Ctrl+C or another signal
    print("Running indefinitely. Press Ctrl+C to stop...")
    uvicorn.run(app, host='127.0.0.1', port=8000)