from services.background_service_helper import App
import time

def run_script():
    time.sleep(1)
    app = App.from_active_window()
    print(app.app_id)
    print(app.url)
    app.get_window_gui_debug_info()