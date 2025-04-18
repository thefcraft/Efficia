from db import modulepath, logger, helpers, get_database, DataBase
from . import models
from fastapi import FastAPI, HTTPException, Depends, Query, Path, status
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from typing import List, Optional, Dict, Tuple, Literal
from io import BytesIO
import sqlite3
# from contextlib import contextmanager
import base64
import os
import requests
from datetime import datetime, timedelta, time, timezone
from .chatbot import app as chatbot_router

DEFAULT_BLOCK_ID = 1 # BlockId=1 for "Permanent Block" rule

# Initialize FastAPI app
app = FastAPI(
    title="Efficia API",
    description="API for Efficia Productivity Tracking Application",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot_router, prefix="/api")

# Database connection
DATABASE_PATH = modulepath.joinpath('..', 'instance', 'database.db')
# modulepath.joinpath('..', 'instance', 'icons_url').mkdir(parents=True, exist_ok=True)


# @contextmanager
def get_db():
    database = DataBase(
        db_path=DATABASE_PATH, check_create_table=False, check_same_thread=False
    )
    try:
        yield database
    finally:
        database.close()

# app.mount("/static/icons", StaticFiles(directory=icons_directory), name="static")

@app.get("/api/static/icons/{image_name}")
async def get_icon(image_name: str):
    image_path = modulepath.joinpath('..', 'instance', 'icons', image_name)
    if image_path.exists():
        return FileResponse(image_path)
    return FileResponse(modulepath.joinpath('..', 'assets', 'img', 'null.png'))

# API Routes

@app.get("/api/", tags=["Root"])
async def root():
    return {"message": "Welcome to Efficia API"}

@app.get("/api/server_time", tags=["Time"], response_model=models.DateTime)
async def server_time(
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
        query = """--sql
            SELECT datetime('now') AS current_time
        """
        cursor.execute(query, ())
        row = cursor.fetchone()
        datetime = row['current_time']
    return models.DateTime(datetime=datetime)


@app.get("/api/server_init_check", tags=["Root"], response_model=models.SimpleSuccessResponse)
async def set_url_block_status(
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
        database.create_table()
        # Check if URL exists
        cursor.execute("SELECT BlockId FROM Blocks WHERE BlockId = ?", (DEFAULT_BLOCK_ID,))
        if not cursor.fetchone():
            cursor.execute("INSERT INTO Blocks (BlockId, permanent) VALUES (?, TRUE)", (DEFAULT_BLOCK_ID,))
            database.commit()
    
    return models.SimpleSuccessResponse(success=True, message=f"done.")


#####################################################################################
#                                   App                                             #
#####################################################################################

@app.get("/api/apps/", tags=["Apps"], response_model=List[models.AppResponse])
async def get_activities(
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:

        query = """--sql
            SELECT * FROM Apps
        """

        cursor.execute(query, ())

        result = []
        for row in cursor.fetchall():
            app_id: str = row['AppId']
            app = models.AppResponse(
                        AppId = app_id,
                        ExeFileName = row['ExeFileName'],
                        ExeDirName = row['ExeDirName'],
                        IsBrowser = row['IsBrowser'],
                        CompanyName = row['CompanyName'],
                        ProductName = row['ProductName'],
                        FileVersion = row['FileVersion'],
                        ProductVersion = row['ProductVersion'],
                        FileDescription = row['FileDescription'],
                        InternalName = row['InternalName'],
                        LegalCopyright = row['LegalCopyright'],
                        LegalTrademarks = row['LegalTrademarks'],
                        OriginalFilename = row['OriginalFilename'],
                        Comments = row['Comments'],
                        PrivateBuild = row['PrivateBuild'],
                        SpecialBuild = row['SpecialBuild'],
                        BlockId = row['BlockId'],
                        Category = row['Category'],
                        Timestamp = row['Timestamp'],
                        ICON = f"{base64.urlsafe_b64encode(app_id.encode('utf-8')).decode('utf-8')}.png"
                    )
            result.append(app)
        return result


@app.post("/api/apps/get_detail", tags=["Apps"], response_model=models.GetAppResponse)
async def get_activities(
    id: models.GetActivitiesById,
    database: DataBase = Depends(get_db)
):
    app_id = id.id
    with database.cursor_context() as cursor:
        
        query = """--sql
            SELECT * FROM Apps
            WHERE AppId = ?
        """
            
        cursor.execute(query, (app_id, ))
        
        row = cursor.fetchone()
        app_id: str = row['AppId']
        app = models.AppResponse(
                    AppId = app_id,
                    ExeFileName = row['ExeFileName'],
                    ExeDirName = row['ExeDirName'],
                    IsBrowser = row['IsBrowser'],
                    CompanyName = row['CompanyName'],
                    ProductName = row['ProductName'],
                    FileVersion = row['FileVersion'],
                    ProductVersion = row['ProductVersion'],
                    FileDescription = row['FileDescription'],
                    InternalName = row['InternalName'],
                    LegalCopyright = row['LegalCopyright'],
                    LegalTrademarks = row['LegalTrademarks'],
                    OriginalFilename = row['OriginalFilename'],
                    Comments = row['Comments'],
                    PrivateBuild = row['PrivateBuild'],
                    SpecialBuild = row['SpecialBuild'],
                    BlockId = row['BlockId'],
                    Category = row['Category'],
                    Timestamp = row['Timestamp'],
                    ICON = f"{base64.urlsafe_b64encode(app_id.encode('utf-8')).decode('utf-8')}.png"
                )
        
        today = datetime.now(timezone.utc)
        start_of_week = today - timedelta(days=today.weekday())  # Monday of this week
        days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        weekly_usage: Dict[Literal['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], float] = {day: 0.0 for day in days_of_week}
        total_uses = 0
        query = """--sql
            SELECT 
                date(EndTime) as day, SUM(Duration) as total_uses
            FROM ActivityEntries
            WHERE AppId = ?
            AND date(EndTime) >= ?
            GROUP BY date(EndTime)
        """
        cursor.execute(query, (app_id, start_of_week.date()))
        rows = cursor.fetchall()
        for row in rows:
            day_date = row['day']
            daily_hours = (row['total_uses'] or 0) / 3600  # Convert to hours
            day_name = days_of_week[(datetime.strptime(day_date, "%Y-%m-%d").weekday())]
            weekly_usage[day_name] = daily_hours
            total_uses += daily_hours
        
        
        hourly_usage = {f"hour_{hour}": 0.0 for hour in range(24)}
        query = """--sql
            SELECT strftime('%H', EndTime) AS hour, SUM(Duration) AS total_uses
            FROM ActivityEntries
            WHERE AppId = ?
            AND date(EndTime) >= ?
            GROUP BY hour
        """
        cursor.execute(query, (app_id, start_of_week.date()))
        rows = cursor.fetchall()
    
        # Populate the hourly_usage dictionary
        for row in rows:
            hourly_usage[f"hour_{row['hour']}"] = (row['total_uses'] or 0) / (3600 * (today.weekday()+1))  # Convert to hours and average over 7 days

    
        start_of_last_week = start_of_week - timedelta(weeks=1)  # Monday of last week
        end_of_last_week = start_of_last_week + timedelta(days=6)  # Sunday of last week


        query = """--sql
            SELECT 
                SUM(Duration) AS total_uses
            FROM ActivityEntries
            WHERE AppId = ?
            AND date(EndTime) >= ? AND date(EndTime) <= ?
        """
        cursor.execute(query, (app_id, start_of_last_week, end_of_last_week))
        row = cursor.fetchone()
        total_uses_sec = row['total_uses']
        total_uses_last_week = total_uses_sec / 3600 if total_uses_sec else 0
        avg_uses_last_week = total_uses_last_week/7
        avg_uses = total_uses / (today.weekday()+1)
        return models.GetAppResponse(
            app=app,
            total_uses_this_week = total_uses,
            total_uses_this_week_increase_percentage = ((total_uses - total_uses_last_week) / total_uses_last_week) * 100 if total_uses_last_week != 0 else 0,
            avg_uses_this_week = avg_uses,
            avg_uses_this_week_increase_percentage= ((avg_uses - avg_uses_last_week) / avg_uses_last_week) * 100 if avg_uses_last_week != 0 else 0,
            **weekly_usage,
            **hourly_usage
        )

@app.post("/api/apps/", tags=['Apps'], response_model=models.BoolResponse)
async def add_app(
    app: models.IApp,
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
        database.insert_app(app=app.model_dump(), commit=True)
    return models.BoolResponse(sucess=True)

@app.put("/api/apps/{app_id}/block", tags=["Apps"], response_model=models.SimpleSuccessResponse)
async def set_app_block_status(
    block_request: models.BlockUpdateRequest,
    app_id: str = Path(..., description="The AppId of the app to block/unblock"),
    database: DataBase = Depends(get_db)
):
    """Sets or removes the block for a specific application."""
    new_block_id = DEFAULT_BLOCK_ID if block_request.block else None
    with database.cursor_context() as cursor:
        # Check if app exists first
        cursor.execute("SELECT AppId FROM Apps WHERE AppId = ?", (app_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="App not found")

        cursor.execute("UPDATE Apps SET BlockId = ? WHERE AppId = ?", (new_block_id, app_id))
        database.commit()
    status_msg = "blocked" if block_request.block else "unblocked"
    return models.SimpleSuccessResponse(success=True, message=f"App '{app_id}' {status_msg}.")


#####################################################################################
#                                   BaseUrl                                         #
#####################################################################################
@app.get("/api/baseUrls/", tags=["BaseUrl"], response_model=List[models.BaseUrlResponse])
async def get_activities(
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
    
        query = """--sql
            SELECT * FROM BaseURLs
        """

        cursor.execute(query, ())

        result = []
        for row in cursor.fetchall():
            base_url: str = row['baseURL']
            
            query = """--sql
                SELECT COUNT(a.EntryId) as visit_count, MAX(a.EndTime) as Timestamp FROM ActivityEntries AS a
                INNER JOIN URLs AS u on u.URL = a.URL
                WHERE u.baseURL = ?
            """

            cursor.execute(query, (base_url, ))

            rowother = cursor.fetchone()
            visit_count: int = rowother['visit_count']
            last_visited: str = rowother['Timestamp']

            url = models.BaseUrlResponse(
                        baseURL= base_url,
                        Title= row['Title'],
                        Description= row['Description'],
                        is_fetched= row['is_fetched'],
                        icon_url= row['icon_url'],
                        BlockId= row['BlockId'],
                        Category= row['Category'],
                        Timestamp = row['Timestamp'],
                        visitCount=visit_count,
                        lastVisited=last_visited
                    )
            result.append(url)
        return result

@app.post("/api/baseUrls/get_detail", tags=["BaseUrl"], response_model=models.GetBaseUrlResponse)
async def get_activities(
    id: models.GetActivitiesById,
    database: DataBase = Depends(get_db)
):
    baseurl_id = id.id
    with database.cursor_context() as cursor:
        
        query = """--sql
            SELECT * FROM BaseURLs
            WHERE baseURL = ?
        """
            
        cursor.execute(query, (baseurl_id, ))
        
        row = cursor.fetchone()
        base_url: str = row['baseURL']
        result_baseurl = models.BaseUrlResponse(
                    baseURL = base_url,
                    Title = row['Title'],
                    Description = row['Description'],
                    is_fetched = row['is_fetched'],
                    icon_url = row['icon_url'],
                    BlockId = row['BlockId'],
                    Category = row['Category'],
                    Timestamp = row['Timestamp'],
                    visitCount = None,
                    lastVisited = None
                )
            
        query = """--sql
            SELECT COUNT(a.EntryId) as visit_count, MAX(a.EndTime) as Timestamp FROM ActivityEntries AS a
            INNER JOIN URLs AS u on u.URL = a.URL
            WHERE u.baseURL = ?
        """
        cursor.execute(query, (base_url, ))
        rowother = cursor.fetchone()
        visit_count: int = rowother['visit_count']
        last_visited: str = rowother['Timestamp']
        result_baseurl.visitCount = visit_count
        result_baseurl.lastVisited = last_visited
        
        
        today = datetime.now(timezone.utc)
        start_of_week = today - timedelta(days=today.weekday())  # Monday of this week
        days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        weekly_usage: Dict[Literal['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], float] = {day: 0.0 for day in days_of_week}
        total_uses = 0
        query = """--sql
            SELECT 
                date(EndTime) as day, SUM(Duration) as total_uses
            FROM ActivityEntries
            INNER JOIN URLs AS u on u.URL = ActivityEntries.URL
            WHERE u.baseURL = ?
            AND date(EndTime) >= ?
            GROUP BY date(EndTime)
        """
        cursor.execute(query, (base_url, start_of_week.date()))
        rows = cursor.fetchall()
        for row in rows:
            day_date = row['day']
            daily_hours = (row['total_uses'] or 0) / 3600  # Convert to hours
            day_name = days_of_week[(datetime.strptime(day_date, "%Y-%m-%d").weekday())]
            weekly_usage[day_name] = daily_hours
            total_uses += daily_hours
        
        
        hourly_usage = {f"hour_{hour}": 0.0 for hour in range(24)}
        query = """--sql
            SELECT strftime('%H', EndTime) AS hour, SUM(Duration) AS total_uses
            FROM ActivityEntries
            INNER JOIN URLs AS u on u.URL = ActivityEntries.URL
            WHERE u.baseURL = ?
            AND date(EndTime) >= ?
            GROUP BY hour
        """
        cursor.execute(query, (base_url, start_of_week.date()))
        rows = cursor.fetchall()
    
        # Populate the hourly_usage dictionary
        for row in rows:
            hourly_usage[f"hour_{row['hour']}"] = (row['total_uses'] or 0) / (3600 * (today.weekday()+1))  # Convert to hours and average over 7 days

    
        start_of_last_week = start_of_week - timedelta(weeks=1)  # Monday of last week
        end_of_last_week = start_of_last_week + timedelta(days=6)  # Sunday of last week


        query = """--sql
            SELECT 
                SUM(Duration) AS total_uses
            FROM ActivityEntries
            INNER JOIN URLs AS u on u.URL = ActivityEntries.URL
            WHERE u.baseURL = ?
            AND date(EndTime) >= ? AND date(EndTime) <= ?
        """
        cursor.execute(query, (base_url, start_of_last_week, end_of_last_week))
        row = cursor.fetchone()
        total_uses_sec = row['total_uses']
        total_uses_last_week = total_uses_sec / 3600 if total_uses_sec else 0
        avg_uses_last_week = total_uses_last_week/7
        avg_uses = total_uses / (today.weekday()+1)
        return models.GetBaseUrlResponse(
            baseurl=result_baseurl,
            total_uses_this_week = total_uses,
            total_uses_this_week_increase_percentage = ((total_uses - total_uses_last_week) / total_uses_last_week) * 100 if total_uses_last_week != 0 else 0,
            avg_uses_this_week = avg_uses,
            avg_uses_this_week_increase_percentage= ((avg_uses - avg_uses_last_week) / avg_uses_last_week) * 100 if avg_uses_last_week != 0 else 0,
            **weekly_usage,
            **hourly_usage
        )

@app.put("/api/urls/{base_url}/block", tags=["BaseUrl"], response_model=models.SimpleSuccessResponse)
async def set_url_block_status(
    block_request: models.BlockUpdateRequest,
    base_url: str = Path(..., description="The baseURL to block/unblock (decoded)"),
    database: DataBase = Depends(get_db)
):
    """Sets or removes the block for a specific BaseURL."""
    # Decode base_url if it arrives encoded (depends on frontend implementation)
    # For simplicity, assume it arrives decoded here. If not, use base64.urlsafe_b64decode
    decoded_base_url = base_url # Adjust if needed
    new_block_id = DEFAULT_BLOCK_ID if block_request.block else None
    with database.cursor_context() as cursor:
        # Check if URL exists
        cursor.execute("SELECT baseURL FROM BaseURLs WHERE baseURL = ?", (decoded_base_url,))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BaseURL not found")

        cursor.execute("UPDATE BaseURLs SET BlockId = ? WHERE baseURL = ?", (new_block_id, decoded_base_url))
        database.commit()
    status_msg = "blocked" if block_request.block else "unblocked"
    return models.SimpleSuccessResponse(success=True, message=f"URL '{decoded_base_url}' {status_msg}.")

@app.post("/api/categories/url", tags=["Category"], response_model=Optional[models.Category]) # Similar to /categories/app
async def update_url_category(
    url_category: models.UrlCategory,
    database: DataBase = Depends(get_db)
):
    """Assigns or unassigns a category to a BaseURL."""
    with database.cursor_context() as cursor:
        # Check if BaseURL exists
        cursor.execute("SELECT baseURL FROM BaseURLs WHERE baseURL = ?", (url_category.baseURL,))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BaseURL not found")

        if not url_category.Category:
            # Unassign category
            cursor.execute("UPDATE BaseURLs SET Category = NULL WHERE baseURL = ?", (url_category.baseURL,))
            database.commit()
            return None
        else:
            # Assign category - check if category exists
            cursor.execute("SELECT * FROM Categories WHERE Category = ?", (url_category.Category,))
            category_record = cursor.fetchone()
            if not category_record:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Category '{url_category.Category}' not found")

            cursor.execute("UPDATE BaseURLs SET Category = ? WHERE baseURL = ?", (url_category.Category, url_category.baseURL))
            database.commit()
            # Recalculate itemCount for response (optional, or handle in GET)
            cursor.execute("SELECT COUNT(AppId) as count FROM Apps WHERE Category = ?", (category_record['Category'],))
            app_count = cursor.fetchone()['count']
            cursor.execute("SELECT COUNT(baseURL) as count FROM BaseURLs WHERE Category = ?", (category_record['Category'],))
            url_count = cursor.fetchone()['count']
            item_count = app_count + url_count
            return models.Category(
                Category=category_record['Category'],
                BlockId=category_record['BlockId'],
                Timestamp=category_record['Timestamp'],
                itemCount=item_count
            )

# --- Endpoint to add a new BaseURL manually (if needed) ---
@app.post("/api/baseUrls/", tags=["BaseUrl"], response_model=models.BaseUrlResponse)
async def add_manual_base_url(
    base_url_data: models.BaseUrlResponse, # Use appropriate model if fields differ
    database: DataBase = Depends(get_db)
):
    """Manually adds a new BaseURL (e.g., for blocking before visit)."""
    # Basic validation
    if not base_url_data.baseURL or not base_url_data.baseURL.strip():
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="baseURL cannot be empty")

    with database.cursor_context() as cursor:
        try:
             # Use the existing insert_baseurl logic, setting is_fetched to True manually?
             # Or create a simplified insert here. Assuming simplified insert:
             cursor.execute(
                 """--sql
                 INSERT INTO BaseURLs (baseURL, Title, Description, Category, BlockId, is_fetched, icon_url)
                 VALUES (?, ?, ?, ?, ?, ?, ?)
                 """,
                 (
                     base_url_data.baseURL,
                     base_url_data.Title,
                     base_url_data.Description,
                     base_url_data.Category,
                     base_url_data.BlockId,
                     False, # Let background fetching handle this if needed
                     None # Or allow setting icon manually
                 )
             )
             database.commit()
             # Fetch the inserted record to return it
             cursor.execute("SELECT * FROM BaseURLs WHERE baseURL = ?", (base_url_data.baseURL,))
             new_record = cursor.fetchone()
             if not new_record:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve newly added BaseURL")
             # Add visitCount and lastVisited as None initially
             return models.BaseUrlResponse(**dict(new_record), visitCount=0, lastVisited=None)

        except sqlite3.IntegrityError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"BaseURL '{base_url_data.baseURL}' already exists.")
        except Exception as e:
             logger.error(f"Error adding manual BaseURL: {e}")
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not add BaseURL")


#####################################################################################
#                                  Activity                                         #
#####################################################################################


@app.get("/api/activity/", tags=["Activity"], response_model=List[models.GetActivity])
async def get_activities(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    app_id: Optional[str] = Query(None, description="Filter by AppId"),
    limit: int = Query(100, ge=1, le=1000), page: int = Query(0, ge=0), 
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
    
        query = """--sql
            SELECT * FROM ActivityEntries AS e
            INNER JOIN Apps AS a on a.AppId = e.AppId
        """
        params = []

        # Build the WHERE clause based on filters
        where_clauses = []

        if start_date:
            where_clauses.append("date(EndTime) >= ?")
            params.append(start_date)

        if end_date:
            where_clauses.append("date(EndTime) <= ?")
            params.append(end_date)

        if app_id:
            where_clauses.append("AppId = ?")
            params.append(app_id)

        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)

        query += " ORDER BY EndTime DESC LIMIT ? OFFSET ?"
        params.append(limit)
        params.append(page*limit)

        cursor.execute(query, params)

        result = []
        for row in cursor.fetchall():
            app_id = row['AppId']
            app = models.AppResponse(
                        AppId = app_id,
                        ExeFileName = row['ExeFileName'],
                        ExeDirName = row['ExeDirName'],
                        IsBrowser = row['IsBrowser'],
                        CompanyName = row['CompanyName'],
                        ProductName = row['ProductName'],
                        FileVersion = row['FileVersion'],
                        ProductVersion = row['ProductVersion'],
                        FileDescription = row['FileDescription'],
                        InternalName = row['InternalName'],
                        LegalCopyright = row['LegalCopyright'],
                        LegalTrademarks = row['LegalTrademarks'],
                        OriginalFilename = row['OriginalFilename'],
                        Comments = row['Comments'],
                        PrivateBuild = row['PrivateBuild'],
                        SpecialBuild = row['SpecialBuild'],
                        BlockId = row['BlockId'],
                        Category = row['Category'],
                        Timestamp = row['Timestamp'],
                        ICON = f"{base64.urlsafe_b64encode(app_id.encode('utf-8')).decode('utf-8')}.png"
                    )
            url = row['URL']
            activity = models.ActivityEntryResponse(
                        EntryId = row['EntryId'],
                        AppId = app_id,
                        Title = row['Title'],
                        URL = url,
                        IsActive = row['IsActive'],
                        IdleDuration = row['IdleDuration'],
                        Duration = row['Duration'],
                        EndTime = row['EndTime'],
                        URL_ICON = base64.urlsafe_b64encode(url.encode('utf-8')).decode('utf-8') if url else None
                    )
            result.append(
                models.GetActivity(
                    app=app,
                    activity=activity,
                )
            )
        return result

@app.post("/api/activity/", tags=["Activity"], response_model=models.AddActivityResponse)
async def add_activity(
    data: models.CreateUpdateActivity,
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
        EntryId = database.update_or_insert_activity(
            activity=data.activity.model_dump(),
            EntryId=data.EntryId,
            commit=True
        )
    return models.AddActivityResponse(sucess=True, EntryId=EntryId)

#####################################################################################
#                                   _Todo                                           #
#####################################################################################

# Create a new todo
@app.post("/api/todos/", tags=["Todo"], response_model=models.Todo)
def create_todo(
    todo: models.TodoCreate, 
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
        if todo.parent_id is not None:
            cursor.execute("""--sql
                    SELECT * FROM Todos WHERE todo_id = ?
                """, (todo.parent_id,)
            )
            todo_record = cursor.fetchone()
            if todo_record is None:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Parent Not Found')
            if todo_record['parent_id'] is not None:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail='Multi Level Nested Todo Is Not Allowed')

        cursor.execute("""--sql
            INSERT INTO Todos (title, duedate, parent_id) 
            VALUES (?, ?, ?)
            """, (todo.title, todo.duedate, todo.parent_id)
        )
        database.commit()
        todo_id = cursor.lastrowid
        cursor.execute("""--sql
                SELECT * FROM Todos WHERE todo_id = ?
            """, (todo_id,)
        )
        todo_record = cursor.fetchone()
        return models.Todo(todo_id=todo_record['todo_id'], title=todo_record['title'], duedate=todo_record['duedate'],
                    parent_id=todo_record['parent_id'], completed=todo_record['completed'], Timestamp=todo_record['Timestamp'])

# Fetch all todos with nested structure
@app.get("/api/todos/", tags=["Todo"], response_model=List[Tuple[models.Todo, List[models.Todo]]])
def get_todos(
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
        cursor.execute("SELECT * FROM Todos")
        todo_records = cursor.fetchall()

        # Create a dictionary of todos by their ID
        todos_by_id: Dict[int, Tuple[models.Todo, List[models.Todo]]] = {}
        for todo_record in todo_records:
            todo = models.Todo(todo_id=todo_record['todo_id'], title=todo_record['title'], duedate=todo_record['duedate'],
                    parent_id=todo_record['parent_id'], completed=todo_record['completed'], Timestamp=todo_record['Timestamp'])
            parent_todo_tuple = todos_by_id.get(todo.parent_id)
            if parent_todo_tuple is None:
                todos_by_id[todo.todo_id] = (todo, [])
            else:
                todos_by_id[todo.parent_id][1].append(todo)

        return list(todos_by_id.values())


#####################################################################################
#                               Category                                            #
#####################################################################################

@app.get("/api/categories/", tags=["Category"], response_model=List[models.Category])
def get_categories(
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
        cursor.execute("SELECT * FROM Categories")
        category_records = cursor.fetchall()

        result = []
        for category_record in category_records:
            cursor.execute("SELECT COUNT(AppId) as count FROM Apps WHERE Category = ?", (category_record['Category'],))
            app_count = cursor.fetchone()['count']
            cursor.execute("SELECT COUNT(baseURL) as count FROM BaseURLs WHERE Category = ?", (category_record['Category'],))
            url_count = cursor.fetchone()['count']
            count = app_count + url_count
            category = models.Category(Category=category_record['Category'], BlockId=category_record['BlockId'], Timestamp=category_record['Timestamp'], itemCount=count)
            result.append(category)

        return result
# @app.post("/categories/detail", tags=["Category"], response_model=List[models.Category])
# def get_categories(conn: sqlite3.Connection = Depends(get_db)):
#     cursor = conn.cursor()
#     cursor.execute("SELECT * FROM Categories")
#     category_records = cursor.fetchall()

#     result = []
#     for category_record in category_records:
#         cursor.execute("SELECT COUNT(AppId) as count FROM Apps WHERE Category = ?", (category_record['Category'],))
#         app_count = cursor.fetchone()['count']
#         cursor.execute("SELECT COUNT(baseURL) as count FROM BaseURLs WHERE Category = ?", (category_record['Category'],))
#         url_count = cursor.fetchone()['count']
#         count = app_count + url_count
#         category = models.Category(Category=category_record['Category'], BlockId=category_record['BlockId'], Timestamp=category_record['Timestamp'], itemCount=count)
#         result.append(category)

#     return result

@app.get("/api/categories/{category_name}", tags=["Category"], response_model=models.CategoryDetailResponse)
async def get_category_details(
    category_name: str = Path(..., description="The name of the category"),
    database: DataBase = Depends(get_db)
):
    """Gets details for a specific category."""
    with database.cursor_context() as cursor:
        cursor.execute("SELECT * FROM Categories WHERE Category = ?", (category_name,))
        category_record = cursor.fetchone()
        if not category_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        # Recalculate itemCount
        cursor.execute("SELECT COUNT(AppId) as count FROM Apps WHERE Category = ?", (category_name,))
        app_count = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(baseURL) as count FROM BaseURLs WHERE Category = ?", (category_name,))
        url_count = cursor.fetchone()['count']
        item_count = app_count + url_count

        # Optionally fetch associated items (can be slow, consider separate endpoint)
        # apps = fetch_apps_by_category(cursor, category_name)
        # urls = fetch_urls_by_category(cursor, category_name)

        return models.CategoryDetailResponse(
            **dict(category_record),
            itemCount=item_count,
            # apps=apps, # Add if fetching items
            # urls=urls  # Add if fetching items
        )

@app.put("/api/categories/{category_name}", tags=["Category"], response_model=models.Category)
async def update_category(
    update_data: models.UpdateCategoryRequest,
    category_name: str = Path(..., description="The name of the category to update"),
    database: DataBase = Depends(get_db)
):
    """Updates category properties (e.g., description, block)."""
    with database.cursor_context() as cursor:
        # Check if category exists
        cursor.execute("SELECT Category FROM Categories WHERE Category = ?", (category_name,))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        # Build update query dynamically (only update provided fields)
        update_fields = []
        params = []
        if update_data.description is not None:
            # Need to ADD a description column to Categories table first!
            # ALTER TABLE Categories ADD COLUMN description TEXT;
             # update_fields.append("description = ?")
             # params.append(update_data.description)
             logger.warning("Description update requested but 'description' column might be missing in Categories table.")
             pass # Comment out update if column doesn't exist
        if update_data.blockId is not None:
            # Check if blockId exists in Blocks table (optional validation)
            # cursor.execute("SELECT BlockId FROM Blocks WHERE BlockId = ?", (update_data.blockId,))
            # if not cursor.fetchone():
            #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"BlockId {update_data.blockId} not found")
            update_fields.append("BlockId = ?")
            params.append(update_data.blockId)
        elif update_data.blockId is None and hasattr(update_data, 'blockId'): # Explicitly setting blockId to null
             update_fields.append("BlockId = NULL")


        if not update_fields:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No update data provided")

        params.append(category_name)
        query = f"UPDATE Categories SET {', '.join(update_fields)} WHERE Category = ?"
        cursor.execute(query, tuple(params))
        database.commit()

        # Fetch and return updated category
        cursor.execute("SELECT * FROM Categories WHERE Category = ?", (category_name,))
        updated_record = cursor.fetchone()
        # Recalculate itemCount
        cursor.execute("SELECT COUNT(AppId) as count FROM Apps WHERE Category = ?", (category_name,))
        app_count = cursor.fetchone()['count']
        cursor.execute("SELECT COUNT(baseURL) as count FROM BaseURLs WHERE Category = ?", (category_name,))
        url_count = cursor.fetchone()['count']
        item_count = app_count + url_count
        return models.Category(**dict(updated_record), itemCount=item_count)


@app.delete("/api/categories/{category_name}", tags=["Category"], response_model=models.DeleteResponse)
async def delete_category(
    category_name: str = Path(..., description="The name of the category to delete"),
    database: DataBase = Depends(get_db)
):
    """Deletes a category. Note: This might fail if items still reference it (FK constraint)."""
    with database.cursor_context() as cursor:
         # Check if category exists
        cursor.execute("SELECT Category FROM Categories WHERE Category = ?", (category_name,))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

        try:
             # Optional: First unassign category from Apps and BaseURLs
             cursor.execute("UPDATE Apps SET Category = NULL WHERE Category = ?", (category_name,))
             cursor.execute("UPDATE BaseURLs SET Category = NULL WHERE Category = ?", (category_name,))

             # Then delete the category
             cursor.execute("DELETE FROM Categories WHERE Category = ?", (category_name,))
             database.commit()
             if cursor.rowcount == 0: # Should not happen after existence check, but good practice
                  raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found during delete")
             return models.DeleteResponse(success=True, id=category_name, message="Category deleted successfully")
        except sqlite3.IntegrityError as e:
             logger.error(f"Integrity error deleting category {category_name}: {e}")
             raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Cannot delete category. It might be referenced by other items or blocks.")
        except Exception as e:
            logger.error(f"Error deleting category {category_name}: {e}")
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete category")


# Create a new todo
@app.post("/api/categories/", tags=["Category"], response_model=models.Category)
def create_categories(
    category: models.CategoryCreate, 
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
        cursor.execute("""--sql
            INSERT OR IGNORE INTO Categories (Category, BlockId) 
            VALUES (?, ?)
            """, (category.Category, category.BlockId)
        )
        database.commit()
        cursor.execute("""--sql
                SELECT * FROM Categories WHERE Category = ?
            """, (category.Category,)
        )
        category_record = cursor.fetchone()
        return models.Category(Category=category_record['Category'], BlockId=category_record['BlockId'], Timestamp=category_record['Timestamp'])


@app.post("/api/categories/app", tags=["Category"], response_model=Optional[models.Category])
def update_app_category(
    app_category: models.AppCategory, 
    database: DataBase = Depends(get_db)
):
    with database.cursor_context() as cursor:
        if not app_category.Category:
            cursor.execute("""--sql
                UPDATE Apps 
                SET Category = NULL
                WHERE AppId = ?
                """, (app_category.AppId, )
            )
            database.commit()
            return None
        cursor.execute("""--sql
                SELECT * FROM Categories WHERE Category = ?
            """, (app_category.Category,)
        )
        category_record = cursor.fetchone()
        if not category_record: 
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Category: {app_category.Category} is not found")
        cursor.execute("""--sql
            UPDATE Apps 
            SET Category = ?
            WHERE AppId = ?
            """, (app_category.Category, app_category.AppId)
        )
        database.commit()
        return models.Category(Category=category_record['Category'], BlockId=category_record['BlockId'], Timestamp=category_record['Timestamp'])

@app.put("/api/todos/{todo_id}/toggle", tags=["Todo"], response_model=models.TodoToggleResponse)
async def toggle_todo_completion(
    todo_id: int = Path(..., description="The ID of the todo item to toggle"),
    database: DataBase = Depends(get_db)
):
    """Toggles the completion status of a todo item."""
    with database.cursor_context() as cursor:
        # Check if todo exists
        cursor.execute("SELECT completed FROM Todos WHERE todo_id = ?", (todo_id,))
        record = cursor.fetchone()
        if not record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

        new_status = not record['completed']
        cursor.execute("UPDATE Todos SET completed = ? WHERE todo_id = ?", (new_status, todo_id))

        # Also handle subtasks: If parent is marked incomplete, subtasks should arguably be incomplete too.
        # If parent is marked complete, subtasks *could* be marked complete (optional rule).
        # Let's mark subtasks incomplete if parent becomes incomplete.
        if not new_status: # If parent is marked incomplete
             cursor.execute("UPDATE Todos SET completed = ? WHERE parent_id = ?", (False, todo_id))

        # Check if marking a subtask complete should complete the parent if all others are done
        cursor.execute("SELECT parent_id FROM Todos WHERE todo_id = ?", (todo_id,))
        parent_record = cursor.fetchone()
        if parent_record and parent_record['parent_id'] is not None and new_status:
             parent_id = parent_record['parent_id']
             # Check if all siblings (including current) are now complete
             cursor.execute("""--sql
                 SELECT COUNT(*) as total, SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END) as completed_count
                 FROM Todos
                 WHERE parent_id = ?
             """, (parent_id,))
             subtask_counts = cursor.fetchone()
             if subtask_counts and subtask_counts['total'] == subtask_counts['completed_count']:
                  cursor.execute("UPDATE Todos SET completed = ? WHERE todo_id = ?", (True, parent_id))


        database.commit()
        return models.TodoToggleResponse(todo_id=todo_id, completed=new_status)


@app.delete("/api/todos/{todo_id}", tags=["Todo"], response_model=models.DeleteResponse)
async def delete_todo(
    todo_id: int = Path(..., description="The ID of the todo item to delete"),
    database: DataBase = Depends(get_db)
):
    """Deletes a todo item. Also deletes its subtasks."""
    with database.cursor_context() as cursor:
         # Check if todo exists
        cursor.execute("SELECT todo_id FROM Todos WHERE todo_id = ?", (todo_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")

        try:
             # Delete subtasks first (important for FK constraints if they exist)
             cursor.execute("DELETE FROM Todos WHERE parent_id = ?", (todo_id,))
             # Delete the main task
             cursor.execute("DELETE FROM Todos WHERE todo_id = ?", (todo_id,))
             database.commit()
             if cursor.rowcount == 0: # Should not happen after existence check
                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found during delete")
             return models.DeleteResponse(success=True, id=todo_id, message="Todo and its subtasks deleted successfully")
        except Exception as e:
             logger.error(f"Error deleting todo {todo_id}: {e}")
             database.conn.rollback() # Rollback on error
             raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete todo")


# --- Add other CRUD endpoints for Todos (Update title/duedate) as needed ---
# Example PUT /api/todos/{todo_id}



# === Notes Endpoints ===

@app.get("/api/notes/", tags=["Notes"], response_model=List[models.NoteResponse])
async def get_notes_with_details(
    database: DataBase = Depends(get_db)
):
    """Fetches all notes, joining with goals and aggregating tags."""
    notes_dict = {}
    with database.cursor_context() as cursor:
        # Fetch notes joined with goals
        query = """--sql
            SELECT
                n.note_id, n.title, n.content, n.GoalId, n.Timestamp, g.name as goalName
            FROM Notes n
            LEFT JOIN Goals g ON n.GoalId = g.GoalId
            ORDER BY n.Timestamp DESC
        """
        cursor.execute(query)
        notes_records = cursor.fetchall()
        for record in notes_records:
            notes_dict[record['note_id']] = dict(record)
            notes_dict[record['note_id']]['tags'] = [] # Initialize empty list for tags

        # Fetch tag assignments
        query_tags = """--sql
            SELECT nta.note_id, nta.notetag
            FROM NoteTagAssignees nta
            WHERE nta.note_id IN (SELECT note_id FROM Notes) -- Ensure we only get tags for existing notes
        """
        cursor.execute(query_tags)
        tag_assignments = cursor.fetchall()

        # Assign tags to notes in the dictionary
        for assignment in tag_assignments:
            note_id = assignment['note_id']
            if note_id in notes_dict:
                notes_dict[note_id]['tags'].append(assignment['notetag'])

    # Convert dictionary back to list of NoteResponse models
    result = [models.NoteResponse(**data) for data in notes_dict.values()]
    return result


@app.post("/api/notes/", tags=["Notes"], response_model=models.NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: models.NoteCreate,
    database: DataBase = Depends(get_db)
):
    """Creates a new note and handles associated tags."""
    with database.cursor_context() as cursor:
        try:
            # 1. Insert the note
            cursor.execute(
                """--sql
                INSERT INTO Notes (title, content, GoalId) VALUES (?, ?, ?)
                """,
                (note_data.title, note_data.content, note_data.GoalId)
            )
            note_id = cursor.lastrowid
            if not note_id:
                raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to create note")

            # 2. Handle Tags
            created_tags = set()
            if note_data.tags:
                for tag_name in note_data.tags:
                    tag_name = tag_name.strip()
                    if tag_name: # Ensure tag is not empty
                        # Create tag if it doesn't exist
                        cursor.execute("INSERT OR IGNORE INTO NoteTags (notetag) VALUES (?)", (tag_name,))
                        # Assign tag to note
                        cursor.execute("INSERT OR IGNORE INTO NoteTagAssignees (note_id, notetag) VALUES (?, ?)", (note_id, tag_name))
                        created_tags.add(tag_name)

            database.commit()

            # 3. Fetch and return the created note with details
            cursor.execute(
                """--sql
                SELECT
                    n.note_id, n.title, n.content, n.GoalId, n.Timestamp, g.name as goalName
                FROM Notes n
                LEFT JOIN Goals g ON n.GoalId = g.GoalId
                WHERE n.note_id = ?
                """, (note_id,)
            )
            new_note_record = cursor.fetchone()
            if not new_note_record:
                 raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to retrieve created note")

            response_data = dict(new_note_record)
            response_data['tags'] = sorted(list(created_tags)) # Return the tags added

            return models.NoteResponse(**response_data)

        except sqlite3.IntegrityError as e:
             logger.error(f"Integrity error creating note: {e}")
             database.conn.rollback()
             # Could be FK constraint violation if GoalId is invalid
             if "FOREIGN KEY constraint failed" in str(e):
                  raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid GoalId provided.")
             else:
                  raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error creating note.")
        except Exception as e:
            logger.error(f"Error creating note: {e}")
            database.conn.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create note")


@app.delete("/api/notes/{note_id}", tags=["Notes"], response_model=models.DeleteResponse)
async def delete_note(
    note_id: int = Path(..., description="The ID of the note to delete"),
    database: DataBase = Depends(get_db)
):
    """Deletes a note and its tag associations."""
    with database.cursor_context() as cursor:
        # Check if note exists
        cursor.execute("SELECT note_id FROM Notes WHERE note_id = ?", (note_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")

        try:
            # Delete tag associations first
            cursor.execute("DELETE FROM NoteTagAssignees WHERE note_id = ?", (note_id,))
            # Delete the note itself
            cursor.execute("DELETE FROM Notes WHERE note_id = ?", (note_id,))
            database.commit()

            if cursor.rowcount == 0: # Should not happen after existence check
                 raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found during delete")

            return models.DeleteResponse(success=True, id=note_id, message="Note deleted successfully")
        except Exception as e:
            logger.error(f"Error deleting note {note_id}: {e}")
            database.conn.rollback()
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete note")

# --- Add PUT /api/notes/{note_id} later for updating notes ---

# --- (Optional) Endpoint to get all unique tags ---
@app.get("/api/notetags/", tags=["Notes"], response_model=List[str])
async def get_all_tags(database: DataBase = Depends(get_db)):
    with database.cursor_context() as cursor:
        cursor.execute("SELECT notetag FROM NoteTags ORDER BY notetag ASC")
        tags = [row['notetag'] for row in cursor.fetchall()]
        return tags




# === Placeholder Endpoints for Other Features ===
# Add basic GET endpoints for Goals, Sessions, Notes, Timers, Alarms
# They will initially return empty lists or mock data until fully implemented.

@app.get("/api/goals/", tags=["Goals"], response_model=List[dict])
async def get_goals():
    raise NotImplementedError("Not Implemented")
    # TODO: Implement actual database query
    return []

@app.get("/api/sessions/", tags=["Sessions"], response_model=List[dict])
async def get_sessions():
    raise NotImplementedError("Not Implemented")
    # TODO: Implement actual database query
    return []



@app.get("/api/timers/", tags=["Timers & Alarms"], response_model=List[dict])
async def get_timers():
    raise NotImplementedError("Not Implemented")
     # TODO: Implement actual database query
    return []

@app.get("/api/alarms/", tags=["Timers & Alarms"], response_model=List[dict])
async def get_alarms():
    raise NotImplementedError("Not Implemented")
     # TODO: Implement actual database query
    return []

# === Activity History Endpoint (already exists) ===
# GET /api/activity/ - Keep this one

# === Dashboard / Analytics / Timeline (Complex - Deferred) ===
# These require significant aggregation logic. Defer implementation.
@app.get("/api/dashboard/summary", tags=["Dashboard"], response_model=dict)
async def get_dashboard_summary():
    raise NotImplementedError("Not Implemented")
    # TODO: Implement aggregation queries
    return {"message": "Dashboard summary endpoint not yet implemented"}

@app.get("/api/analytics/overview", tags=["Analytics"], response_model=dict)
async def get_analytics_overview():
    raise NotImplementedError("Not Implemented")
    # TODO: Implement aggregation queries
    return {"message": "Analytics overview endpoint not yet implemented"}

@app.get("/api/timeline/", tags=["Timeline"], response_model=List[dict])
async def get_timeline(date: Optional[str] = Query(None, description="Date YYYY-MM-DD")):
    raise NotImplementedError("Not Implemented")
    # TODO: Implement logic to fetch various event types for the date
    return [{"message": "Timeline endpoint not yet implemented"}]


# === Settings (Complex - Deferred) ===
@app.get("/api/settings/", tags=["Settings"], response_model=dict)
async def get_settings():
    raise NotImplementedError("Not Implemented")
    # TODO: Implement fetching user settings
    return {"message": "Settings endpoint not yet implemented"}

# === AI Assistant (Complex - Deferred) ===
@app.post("/api/ai/insights", tags=["AI"], response_model=dict)
async def get_ai_insights():
    raise NotImplementedError("Not Implemented")
    # TODO: Implement AI analysis logic
    return {"message": "AI insights endpoint not yet implemented"}