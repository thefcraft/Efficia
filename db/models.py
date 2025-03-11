from typing import TypedDict, Optional
from sqlite3 import Cursor
from datetime import datetime, time

    

#####################################################################################
#                               Block                                               #
#####################################################################################

class IBlock(TypedDict):
    permanent: bool
    daily_limit: Optional[time]
    
class IFetchBlock(IBlock):
    BlockId: int
    Timestamp: datetime
    
def create_block(cursor: Cursor): 
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Blocks (
        BlockId INTEGER PRIMARY KEY AUTOINCREMENT,
        permanent BOOLEAN DEFAULT FALSE,
        daily_limit TIME,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    
 
#####################################################################################
#                               Category                                            #
#####################################################################################

class ICategory(TypedDict):
    Category: str # Primary Key
    BlockId: Optional[int]
class IFetchCategory(ICategory):
    Timestamp: datetime
    
def create_category(cursor: Cursor): 
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Categories (
        Category TEXT PRIMARY KEY,
        BlockId INTEGER,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (BlockId) REFERENCES Blocks (BlockId)
    )
    """)    

#####################################################################################
#                                   App                                             #
#####################################################################################

class IApp(TypedDict):
    AppId: str # Primary Key
    ExeFileName: str
    ExeDirName: str
    IsBrowser: bool                         # after migration `second_block_id`
    CompanyName: Optional[str]
    ProductName: Optional[str]
    FileVersion: Optional[str]
    ProductVersion: Optional[str]
    FileDescription: Optional[str]
    InternalName: Optional[str]
    LegalCopyright: Optional[str]
    LegalTrademarks: Optional[str]
    OriginalFilename: Optional[str]
    Comments: Optional[str]
    PrivateBuild: Optional[str]
    SpecialBuild: Optional[str]
    BlockId: Optional[int]                  # after migration `second_block_id`
    Category: Optional[str]                 # after migration `second_block_id`
    
class IFetchApp(IApp):
    Timestamp: datetime
    
def create_app(cursor: Cursor):
    # Create Apps table
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Apps (
        AppId TEXT PRIMARY KEY,
        ExeFileName TEXT NOT NULL,
        ExeDirName TEXT NOT NULL,
        IsBrowser BOOLEAN NOT NULL,  -- after migration `second_block_id`
        CompanyName TEXT,
        ProductName TEXT,
        FileVersion TEXT,
        ProductVersion TEXT,
        FileDescription TEXT,
        InternalName TEXT,
        LegalCopyright TEXT,
        LegalTrademarks TEXT,
        OriginalFilename TEXT,
        Comments TEXT,
        PrivateBuild TEXT,
        SpecialBuild TEXT,
        BlockId INTEGER,                    -- after migration `second_block_id`
        Category TEXT,                      -- after migration `second_block_id`
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (BlockId) REFERENCES Blocks (BlockId),
        FOREIGN KEY (Category) REFERENCES Categories (Category)
    )
    """)
    
    
    
#####################################################################################
#                              ActivityEntry                                        #
#####################################################################################

class IActivityEntry(TypedDict):
    AppId: str # Foreign Key
    Title: str
    URL: Optional[str] # Foreign Key
    IsActive: bool
    IdleDuration: float
    Duration: float
class IFetchActivityEntry(IActivityEntry):
    EntryId: int # Primary Key
    EndTime: datetime # NOTE: Insert or Replace by last EntryId
    
def create_activity(cursor: Cursor):
    # Create ActivityEntries table
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS ActivityEntries (
        EntryId INTEGER PRIMARY KEY AUTOINCREMENT,
        AppId TEXT NOT NULL,
        Title TEXT NOT NULL,
        URL TEXT,
        IsActive BOOLEAN NOT NULL,
        IdleDuration REAL NOT NULL,
        Duration REAL NOT NULL,
        EndTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (AppId) REFERENCES Applications (AppId),
        FOREIGN KEY (URL) REFERENCES URLs (URL)
    )
    """)
    
    
    
#####################################################################################
#                                   Url                                             #
#####################################################################################

class IUrl(TypedDict):
    URL: str # Primary Key
class IFetchUrl(IUrl):
    baseURL: Optional[str] # Foreign Key
    Timestamp: datetime
    
def create_url(cursor: Cursor): 
    # Create URLs table with URL as the primary key
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS URLs (
        URL TEXT PRIMARY KEY,
        baseURL TEXT,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (baseURL) REFERENCES BaseURLs (baseURL)
    )
    """)    
    
    
    
#####################################################################################
#                                   BaseUrl                                         #
#####################################################################################

class IBaseUrl(TypedDict):
    baseURL: str # Primary Key
    Title: Optional[str]
    Description: Optional[str]
    is_fetched: bool                        # after migration `first_updating_url`
    icon_url: Optional[str]                 # after migration `first_updating_url`
    BlockId: Optional[int]                  # after migration `second_block_id`
    Category: Optional[str]                 # after migration `second_block_id`
class IFetchBaseUrl(IBaseUrl):
    Timestamp: datetime

def create_base_url(cursor: Cursor): 
    # Create URLs table with URL as the primary key
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS BaseURLs (
        baseURL TEXT PRIMARY KEY,
        Title TEXT,
        Description TEXT,
        is_fetched BOOLEAN DEFAULT FALSE,   -- after migration `first_updating_url`
        icon_url TEXT,                      -- after migration `first_updating_url`
        BlockId INTEGER,                    -- after migration `second_block_id`
        Category TEXT,                      -- after migration `second_block_id`
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (BlockId) REFERENCES Blocks (BlockId),
        FOREIGN KEY (Category) REFERENCES Categories (Category)
    )
    """)    


#####################################################################################
#                               Goal                                                #
#####################################################################################


class IGoal(TypedDict):
    name: str
    desc: Optional[str]
class IFetchGoal(IGoal):
    GoalId: int
    Timestamp: datetime
    
def create_goal(cursor: Cursor): 
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Goals (
        GoalId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        desc TEXT
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)    
    

#####################################################################################
#                               Session                                             #
#####################################################################################

class ISession(TypedDict):
    name: str
    desc: Optional[str]
    GoalId: Optional[int]
class IFetchSession(ISession):
    SessionId: str # Primary 
    Timestamp: datetime
    
def create_session(cursor: Cursor): # break, meeting, focus, learn python etc
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Sessions (
        SessionId INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        desc TEXT,
        GoalId INTEGER,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)        

#####################################################################################
#                               _TODO                                               #
#####################################################################################

class ITodo(TypedDict):
    title: str
    # content: Optional[str] # insted of content reference it to notes 
    duedate: Optional[datetime]
    parent_id: Optional[int]
    GoalId: Optional[int]
class IFetchTodo(ITodo):
    todo_id: int
    completed: bool
    Timestamp: datetime

def create_todo(cursor: Cursor): 
    # Create URLs table with URL as the primary key
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Todos (
        todo_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        duedate DATETIME,
        parent_id INTEGER,
        completed BOOLEAN DEFAULT FALSE,
        GoalId INTEGER,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES Todos (parent_id),
        FOREIGN KEY (GoalId) REFERENCES Goals (GoalId)
    )
    """)
    

#####################################################################################
#                               _NOTE                                               #
#####################################################################################

class INoteTag(TypedDict):
    notetag: str
class IFetchNoteTag(INoteTag):
    Timestamp: datetime
def create_notetag(cursor: Cursor): 
    # Create URLs table with URL as the primary key
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS NoteTags (
        notetag TEXT PRIMARY KEY,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
class INote(TypedDict):
    title: str
    content: Optional[str]
    GoalId: Optional[int]
class IFetchNote(INote):
    note_id: int
    Timestamp: datetime

def create_note(cursor: Cursor): 
    # Create URLs table with URL as the primary key
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Notes (
        note_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        GoalId INTEGER,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (GoalId) REFERENCES Goals (GoalId)
    )
    """)
    
class INoteTagAssignees(TypedDict):
    note_id: int
    notetag: str
class IFetchNoteTagAssignees(INoteTagAssignees):
    ...
def create_notetagassignees(cursor: Cursor): 
    # Create URLs table with URL as the primary key
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS NoteTagAssignees (
        note_id INTEGER NOT NULL,
        notetag TEXT NOT NULL,
        PRIMARY KEY (note_id, notetag),
        FOREIGN KEY (note_id) REFERENCES Notes (note_id),
        FOREIGN KEY (notetag) REFERENCES NoteTags (notetag)
    )
    """)
    
#####################################################################################
#                               Alarm                                               #
#####################################################################################

class IAlarm(TypedDict):
    title: str
    desc: Optional[str]
    time: time
    days: int # use binary value xxxxxxx for sun, mon, tue, wed, ...
    SessionId: Optional[int]
    GoalId: Optional[int]
class IFetchAlarm(IAlarm):
    alarm_id: int
    Timestamp: datetime
    
def create_alarm(cursor: Cursor): 
    # Create URLs table with URL as the primary key
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Alarms (
        alarm_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        desc TEXT,
        time TIME NOT NULL,
        days INTEGER DEFAULT 0, -- use binary value xxxxxxx
        SessionId INTEGER, 
        GoalId INTEGER,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (SessionId) REFERENCES Sessions (SessionId),
        FOREIGN KEY (GoalId) REFERENCES Goals (GoalId)
    )
    """)
    
#####################################################################################
#                               Timers                                              #
#####################################################################################

class ITimer(TypedDict):
    title: str
    desc: Optional[str]
    duration: time
    SessionId: Optional[int]
    GoalId: Optional[int]
class IFetchTimer(ITimer):
    timer_id: int
    Timestamp: datetime
    
def create_timer(cursor: Cursor): 
    # Create URLs table with URL as the primary key
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Timers (
        timer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        desc TEXT,
        duration TIME NOT NULL,
        SessionId INTEGER, 
        GoalId INTEGER,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (SessionId) REFERENCES Sessions (SessionId),
        FOREIGN KEY (GoalId) REFERENCES Goals (GoalId)
    )
    """)


#####################################################################################
#                           BlockInGoals Join Table                                 #
#####################################################################################
class IBLockInGoal(TypedDict):
    BlockId: int
    GoalId: int
class IFetchBLockInGoal(IBLockInGoal):
    Timestamp: datetime
def create_block_in_goal(cursor: Cursor):
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS BlockInGoals (
        BlockId INTEGER,
        GoalId INTEGER,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (BlockId, GoalId),
        FOREIGN KEY (BlockId) REFERENCES Blocks (BlockId),
        FOREIGN KEY (GoalId) REFERENCES Goals (GoalId)
    )
    """)
    
#####################################################################################
#                            BlockInSessions Join Table                             #
#####################################################################################
class IBLockInSession(TypedDict):
    BlockId: int
    SessionId: int
class IFetchBLockInSession(IBLockInSession):
    Timestamp: datetime
def create_block_in_session(cursor: Cursor):
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS BlockInSessions (
        BlockId INTEGER,
        SessionId INTEGER,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (BlockId, SessionId),
        FOREIGN KEY (BlockId) REFERENCES Blocks (BlockId),
        FOREIGN KEY (SessionId) REFERENCES Sessions (SessionId)
    )
    """)