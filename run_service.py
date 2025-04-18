from services import background_service
import time
if __name__ == "__main__":
    print("Starting background_service in 3 sec...")
    time.sleep(3)
    background_service.run_service(check_server_status = True)