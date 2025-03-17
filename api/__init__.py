from db import modulepath, logger, helpers
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
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# app.mount("/static/icons", StaticFiles(directory=icons_directory), name="static")

@app.get("/static/icons/{image_name}")
async def get_icon(image_name: str):
    image_path = modulepath.joinpath('..', 'instance', 'icons', image_name)
    if image_path.exists():
        return FileResponse(image_path)
    return FileResponse(modulepath.joinpath('..', 'assets', 'img', 'null.png'))

# API Routes

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to Efficia API"}


#####################################################################################
#                                   App                                             #
#####################################################################################

@app.get("/apps/", tags=["Apps"], response_model=List[models.AppResponse])
async def get_activities(
    conn: sqlite3.Connection = Depends(get_db)
):
    cursor = conn.cursor()
    
    query = """--sql
        SELECT * FROM Apps
    """
        
    cursor.execute(query, ())
    
    result = []
    for row in cursor.fetchall():
        app_id: str = row['AppId']
        app = models.AppResponse(
                    id = base64.urlsafe_b64encode(app_id.encode('utf')).decode('utf'),
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


@app.get("/apps/{id}", tags=["Apps"], response_model=models.GetAppResponse)
async def get_activities(
    id: str,
    conn: sqlite3.Connection = Depends(get_db)
):
    try:
        app_id = base64.urlsafe_b64decode(id.encode('utf')).decode('utf')
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Error Wrong app id: {id}\nError: {e}")
    cursor = conn.cursor()
    
    query = """--sql
        SELECT * FROM Apps
        WHERE AppId = ?
    """
        
    cursor.execute(query, (app_id, ))
    
    row = cursor.fetchone()
    app_id: str = row['AppId']
    app = models.AppResponse(
                id = base64.urlsafe_b64encode(app_id.encode('utf')).decode('utf'),
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
    weekly_usage: Dict[Literal['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], float] = {

    }
    total_uses = 0
    for i in range(7):
        day_date = start_of_week + timedelta(days=i)
        day_name = days_of_week[i]
        query = """
            SELECT 
                SUM(Duration) AS total_uses
            FROM ActivityEntries
            WHERE AppId = ?
            AND date(EndTime) = ?
        """
        cursor.execute(query, (app_id, day_date.date()))
        row = cursor.fetchone()
        if row and row['total_uses']:
            daily_hours = row['total_uses'] / 3600  # Convert to hours
            total_uses += daily_hours
        else:
            daily_hours = 0
        weekly_usage.update({ day_name: daily_hours })

    
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
        **weekly_usage
    )


#####################################################################################
#                                   BaseUrl                                         #
#####################################################################################
@app.get("/baseUrls/", tags=["BaseUrl"], response_model=List[models.BaseUrlResponse])
async def get_activities(
    conn: sqlite3.Connection = Depends(get_db)
):
    cursor = conn.cursor()
    
    query = """--sql
        SELECT * FROM BaseURLs
    """
        
    cursor.execute(query, ())
    
    result = []
    for row in cursor.fetchall():
        base_url: str = row['baseURL']
        url = models.BaseUrlResponse(
                    id = base64.urlsafe_b64encode(base_url.encode('utf')).decode('utf'),
                    baseURL= base_url,
                    Title= row['Title'],
                    Description= row['Description'],
                    is_fetched= row['is_fetched'],
                    icon_url= row['icon_url'],
                    BlockId= row['BlockId'],
                    Category= row['Category'],
                    Timestamp = row['Timestamp']
                )
        result.append(url)
    return result


#####################################################################################
#                                  Activity                                         #
#####################################################################################


@app.get("/activity/", tags=["Activity"], response_model=List[models.GetActivity])
async def get_activities(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    app_id: Optional[str] = Query(None, description="Filter by AppId"),
    limit: int = Query(100, ge=1, le=1000), page: int = Query(0, ge=0), 
    conn: sqlite3.Connection = Depends(get_db)
):
    cursor = conn.cursor()
    
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
                    id = "", # TODO
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


#####################################################################################
#                                   _Todo                                           #
#####################################################################################

# Create a new todo
@app.post("/todos/", tags=["Todo"], response_model=models.Todo)
def create_todo(todo: models.TodoCreate, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
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
    conn.commit()
    todo_id = cursor.lastrowid
    cursor.execute("""--sql
            SELECT * FROM Todos WHERE todo_id = ?
        """, (todo_id,)
    )
    todo_record = cursor.fetchone()
    return models.Todo(todo_id=todo_record['todo_id'], title=todo_record['title'], duedate=todo_record['duedate'],
                parent_id=todo_record['parent_id'], completed=todo_record['completed'], Timestamp=todo_record['Timestamp'])

# Fetch all todos with nested structure
@app.get("/todos/", tags=["Todo"], response_model=List[Tuple[models.Todo, List[models.Todo]]])
def get_todos(conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
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

@app.get("/categories/", tags=["Category"], response_model=List[models.Category])
def get_categories(conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
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


# Create a new todo
@app.post("/categories/", tags=["Category"], response_model=models.Category)
def create_categories(category: models.CategoryCreate, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    cursor.execute("""--sql
        INSERT OR IGNORE INTO Categories (Category, BlockId) 
        VALUES (?, ?)
        """, (category.Category, category.BlockId)
    )
    conn.commit()
    cursor.execute("""--sql
            SELECT * FROM Categories WHERE Category = ?
        """, (category.Category,)
    )
    category_record = cursor.fetchone()
    return models.Category(Category=category_record['Category'], BlockId=category_record['BlockId'], Timestamp=category_record['Timestamp'])


@app.post("/categories/app", tags=["Category"], response_model=Optional[models.Category])
def update_app_category(app_category: models.AppCategory, conn: sqlite3.Connection = Depends(get_db)):
    cursor = conn.cursor()
    if not app_category.Category:
        cursor.execute("""--sql
            UPDATE Apps 
            SET Category = NULL
            WHERE AppId = ?
            """, (app_category.AppId, )
        )
        conn.commit()
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
    conn.commit()
    return models.Category(Category=category_record['Category'], BlockId=category_record['BlockId'], Timestamp=category_record['Timestamp'])
