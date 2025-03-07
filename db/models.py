from typing import TypedDict, Optional
from sqlite3 import Cursor
from datetime import datetime

    
#####################################################################################
#                                   App                                             #
#####################################################################################

class IApp(TypedDict):
    AppId: str # Primary Key
    ExeFileName: str
    ExeDirName: str
    IsChromiumBased: bool
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
    
class IFetchApp(IApp):
    Timestamp: datetime
    
def create_app(cursor: Cursor):
    # Create Apps table
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Apps (
        AppId TEXT PRIMARY KEY,
        ExeFileName TEXT NOT NULL,
        ExeDirName TEXT NOT NULL,
        IsChromiumBased BOOLEAN NOT NULL,
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
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
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
class IFetchBaseUrl(IBaseUrl):
    Timestamp: datetime

def create_base_url(cursor: Cursor): 
    # Create URLs table with URL as the primary key
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS BaseURLs (
        baseURL TEXT PRIMARY KEY,
        Title TEXT,
        Description TEXT,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
    """)    
 