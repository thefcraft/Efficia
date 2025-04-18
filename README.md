# Efficia - AI-Powered Productivity Tracker

Efficia is a comprehensive productivity application designed for Windows users. It helps track computer activity, minimize distractions through smart blocking, manage tasks and goals, take notes, and leverage AI for insights and assistance via a chatbot interface.

This project aims to provide a robust system for monitoring user activity and offering tools to enhance focus and efficiency. It integrates database management, background services, machine learning models, and a web-based frontend for user interaction and data visualization.

This project particularly demonstrates database design for activity logging, hierarchical data storage (chatbots, todos), and relational data modeling for productivity features.

## TODO
- [ ] REMOVE API KEYS
- [ ] Add Multiple MCP Server for task like gmail, google search etc etc
- [ ] Use Langchain for the above
- [ ] Voice part is computationally expensive so search solutions
- [ ] Improve the Classification Part (maybe by custom embedding based classification)
- [ ] fix full window detection (for multiple screens/monitor)
- [ ] TF/DF: The agent part is missing implementation
- [ ] Fix Ui/Ux and backend connection and api is missing

## ✨ Features

*   **Real-time Activity Tracking:** Monitors active applications, window titles, and URLs (for browsers).
*   **Idle Time Detection:** Tracks user inactivity periods.
*   **Application & URL Management:** Lists tracked apps/sites with details and icons.
*   **Categorization:** Assign custom categories to apps and websites.
*   **Smart Blocking:** Block specific applications or websites (based on category or individually - *Backend basic blocking implemented*).
*   **Todo List:** Manage tasks with subtask support.
*   **Notes:** Simple note-taking functionality with tagging.
*   **AI Chatbot:** Integrated chatbot for assistance (powered by Groq API).
*   **AI-Powered Title Generation:** Automatically generates titles for new chat sessions.
*   **AI Classification (Planned/Partial):** ML models to automatically categorize new apps/URLs.
*   **Data Visualization:** View activity history, app/URL usage statistics (via API).
*   **Web Interface:** User-friendly dashboard and management pages built with React/TypeScript.
*   **(Planned Features based on Frontend):** Goals, Sessions, Timers, Alarms, Analytics Dashboard, Timeline View, Settings.

## 🛠️ Tech Stack

*   **Backend:** Python, FastAPI
*   **Database:** SQLite
*   **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn UI, Recharts
*   **Background Service:** Python (using `psutil`, `win32api`, etc.)
*   **Machine Learning:** Langchain, Python (for classification & title generation)
*   **AI API:** Groq API (for Chatbot)
*   **Package Management:** `uv` (Python - based on `uv.lock`), `bun` (Frontend)
*   **Testing:** Pytest

## 📁 Project Structure

```
├── api/             # FastAPI backend application (main API and chatbot)
├── assets/          # Static assets like icons, config files
├── db/              # Database interaction layer (SQLite connection, models, helpers, migrations)
├── frontend/        # React frontend application (Vite, TypeScript, Tailwind, Shadcn)
├── ml/              # Machine learning components (Langchain integrations)
├── scripts/         # Utility scripts (e.g., getting debug info)
├── services/        # Background activity tracking service for Windows
├── tests/           # Unit and integration tests (pytest)
├── instance/        # Runtime data directory (database, logs, icons - created automatically)
├── .env             # Environment variables (API keys, etc. - !! DO NOT COMMIT !!)
├── run.py           # Main execution script (likely orchestrates others)
├── run_api.py       # Script to run the FastAPI server
├── run_service.py   # Script to run the background service
├── run_migration.py # Script to run database migrations
├── pyproject.toml   # Python project configuration and dependencies
├── uv.lock          # Pinned Python dependencies for `uv`
└── README.md        # This file
```

## 🚀 Getting Started

### Prerequisites

*   Python (Check `.python-version` or `pyproject.toml` for specific version, e.g., 3.10+)
*   `uv` (Python package manager - `pip install uv`)
*   Node.js and Bun (`npm install -g bun`)
*   Git
*   Windows Operating System (for the background service)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/thefcraft/Efficia.git
    cd Efficia
    ```

2.  **Backend Setup:**
    ```bash
    # Create a virtual environment (optional but recommended)
    python -m venv .venv
    source .venv/bin/activate  # On Windows use `.venv\Scripts\activate`

    # Install Python dependencies using uv
    uv sync

    # Set up environment variables
    cp .env.example .env # Create .env if an example exists, otherwise create manually
    # Edit .env and add your API keys (e.g., GROQ_API_KEY)
    # !! IMPORTANT: Ensure .env is listed in your .gitignore file !!
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    bun install
    # bun run build # Optional: build for production
    cd ..
    ```

4.  **Database Setup:**
    ```bash
    # The database file (`instance/database.db`) will be created automatically.
    # Run migrations if necessary:
    python run_migration.py
    ```

## ▶️ Running the Application

You need to run multiple components simultaneously. Open separate terminal windows for each.

1.  **Start the Backend API:**
    ```bash
    # Make sure your virtual environment is activated
    python run_api.py
    # Or: uvicorn api:app --reload --port 8000 (adjust host/port if needed)
    ```
    The API will typically be available at `http://127.0.0.1:8000`.

2.  **Start the Background Service (on Windows):**
    ```bash
    # Make sure your virtual environment is activated
    python run_service.py
    ```
    This service will start tracking your activity and sending data to the API.

3.  **Start the Frontend Development Server:**
    ```bash
    cd frontend
    bun run dev
    ```
    The frontend will usually be available at `http://localhost:3000` (or another port specified by Vite).

*(Note: For production, you would build the frontend (`bun run build`) and serve the static files, potentially using the FastAPI backend itself or a dedicated web server like Nginx.)*

## 🗄️ Database

*   **Type:** SQLite
*   **Location:** The database file (`database.db`) is stored in the `instance/` directory, which should be created automatically if it doesn't exist.
*   **Schema:** Defined in `db/models.py`.
*   **Migrations:** Database schema changes are managed via scripts in `db/migrate/`. Run `python run_migration.py` to apply pending migrations.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Write tests for your changes.
5. Ensure all tests pass (`pytest`).
6. Commit your changes (`git commit -m 'Add some feature'`).
7. Push to the branch (`git push origin feature/your-feature-name`).
8. Open a Pull Request.

## 📄 License

This project is licensed under the [MIT License](LICENSE).