import subprocess
import signal
import atexit
import sys
from typing import List
from pystray import Icon, MenuItem, Menu
from PIL import Image, ImageDraw
import msvcrt
import logging

import os
if getattr(sys, 'frozen', False):
    basedir = os.path.dirname(sys.executable) # Running as bundled executable
else:
    basedir = os.path.dirname(__file__) # Running as script
basedir = os.path.abspath(basedir)    
if basedir.endswith('dist'):
    basedir = os.path.abspath(os.path.join(basedir, '..'))

# Set up basic logging to a file
log_path = os.path.join(basedir, 'dist', 'log.log')
logging.basicConfig(
    filename=log_path,
    level=logging.ERROR,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Log unhandled exceptions
def handle_exception(exc_type, exc_value, exc_traceback):
    if issubclass(exc_type, KeyboardInterrupt):
        # Allow keyboard interrupt to exit cleanly
        sys.__excepthook__(exc_type, exc_value, exc_traceback)
        return
    logging.error("Uncaught exception", exc_info=(exc_type, exc_value, exc_traceback))

sys.excepthook = handle_exception


_lock_handle = None
def is_already_running():
    global _lock_handle
    lockfile = os.path.join(os.path.join(basedir, 'dist', 'app.lock'))
    try:
        # Open the lock file in write mode (create if not exists)
        _lock_handle = open(lockfile, 'w+')
        
        # Try to lock the file exclusively
        msvcrt.locking(_lock_handle.fileno(), msvcrt.LK_NBLCK, 1)
        return False  # Lock acquired successfully
    except OSError:
        # If lock cannot be acquired, another instance is running
        _lock_handle.close()
        return True

class BackgroundProcessManager:
    def __init__(self):
        self.processes: List[subprocess.Popen] = []

    def start_process(self, command):
        """Start a background process in its own process group (Windows)."""
        # CREATE_NEW_PROCESS_GROUP lets us send CTRL_BREAK_EVENT
        proc = subprocess.Popen(
            command,
            shell=True,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
        )
        self.processes.append(proc)
        print(f"Started: {command} (PID {proc.pid})")
        return proc

    def stop_all_processes(self):
        """Terminate all running background processes and their children."""
        print("Stopping all background processes...")
        for proc in self.processes:
            subprocess.call(
                ["taskkill", "/F", "/T", "/PID", str(proc.pid)],
                creationflags=subprocess.CREATE_NO_WINDOW
            )
            # try:
            #     # On Windows, send CTRL_BREAK to kill group
            #     proc.send_signal(signal.CTRL_BREAK_EVENT)
            #     proc.wait(timeout=5)
            # except Exception:
            #     subprocess.call(["taskkill", "/F", "/T", "/PID", str(proc.pid)])
        self.processes.clear()
        print("All background processes stopped.")
        sys.exit(0)

    def cleanup(self, signum=None, frame=None):
        """Cleanup processes on interrupt or exit."""
        print(f"Received signal {signum}. Cleaning up...")
        self.stop_all_processes()
        # sys.exit(0)

# Instantiate manager and register handlers
def main():
    mgr = BackgroundProcessManager()

    # Register for CTRL+C, console close, and atexit
    signal.signal(signal.SIGINT, mgr.cleanup)
    try:
        signal.signal(signal.SIGBREAK, mgr.cleanup)  # Windows
    except AttributeError:
        pass
    atexit.register(mgr.stop_all_processes)

    # Start background tasks
    mgr.start_process(f'cd {basedir} && cd frontend && npm run dev')
    mgr.start_process(f'cd {basedir} && uv run run_service.py')
    mgr.start_process(f'cd {basedir} && uv run run_api.py')

    # Create tray icon
    def create_image():
        width = height = 64
        img = Image.new('RGB', (width, height), (255, 255, 255))
        draw = ImageDraw.Draw(img)
        draw.ellipse((0, 0, width, height), fill=(0, 255, 0))
        return img

    def on_quit(icon, item):
        print("Quitting...")
        icon.stop()
        mgr.cleanup()

    icon = Icon("FastAPI Tray", create_image(), menu=Menu(MenuItem("Quit", on_quit)))
    print("Service running. Use tray icon or Ctrl+C to exit.")
    icon.run()

if __name__ == '__main__':
    if is_already_running():
        print("Another instance is already running.")
        sys.exit(0)
    main()