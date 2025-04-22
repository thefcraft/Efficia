import os
import dotenv

dotenv.load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

from api import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host='127.0.0.1', port=8000)