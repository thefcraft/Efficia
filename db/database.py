import sqlite3
from typing import Optional
from .models import IActivityEntry, IApp, IBaseUrl, IUrl
from .models import IFetchActivityEntry, IFetchApp, IFetchBaseUrl, IFetchUrl
from .models import create_activity, create_app, create_base_url, create_url
from .helpers import get_baseurl, logger

class DataBase:
    def __init__(self, db_path: str):
        # Connect to SQLite database
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self.create_table()
        
    def close(self, commit: bool = False) -> None:
        if commit: self.conn.commit()
        self.conn.close()
    
    def create_table(self):
        create_app(self.cursor)
        create_base_url(self.cursor)
        create_url(self.cursor)
        create_activity(self.cursor)
        # Commit initial table creation
        self.conn.commit()
    
    def insert_baseurl(self, baseurl: IBaseUrl, commit: bool = True) -> None:
        self.cursor.execute("""--sql
        INSERT OR IGNORE INTO BaseURLs (
            baseURL, Title, Description
        ) VALUES (?, ?, ?)
        """, (
           baseurl['baseURL'], baseurl.get('Title'), baseurl.get('Description')
        ))
        if commit: self.conn.commit()
    
    def insert_url(self, url: IUrl, commit: bool = True) -> None:
        baseurl = get_baseurl(url['URL'])
        # if not baseurl: ... # TODO maybe just return for anyrandom string the url is None
        self.insert_baseurl(IBaseUrl(baseURL=baseurl, Title=None, Description=None), commit=False)
        self.cursor.execute("""--sql
        INSERT OR IGNORE INTO URLs (
            URL, baseURL
        ) VALUES (?, ?)
        """, (
           url['URL'], baseurl
        ))
        if commit: self.conn.commit()
        
    def insert_app(self, app: IApp, commit: bool = True) -> None:
        self.cursor.execute("""--sql
        INSERT OR IGNORE INTO Apps (
            AppId, ExeFileName, ExeDirName, IsChromiumBased, CompanyName, 
            ProductName, FileVersion, ProductVersion, FileDescription, 
            InternalName, LegalCopyright, LegalTrademarks, OriginalFilename, 
            Comments, PrivateBuild, SpecialBuild
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            app['AppId'], app['ExeFileName'], app['ExeDirName'], app['IsChromiumBased'], app.get('CompanyName'), 
            app.get('ProductName'), app.get('FileVersion'), app.get('ProductVersion'), app.get('FileDescription'), 
            app.get('InternalName'), app.get('LegalCopyright'), app.get('LegalTrademarks'), app.get('OriginalFilename'), 
            app.get('Comments'), app.get('PrivateBuild'), app.get('SpecialBuild')
        ))
        if commit: self.conn.commit()
        
    def insert_activity(self, activity: IActivityEntry, commit: bool = True) -> int:
        if activity.get('URL'):
            self.insert_url(url=IUrl(URL=activity['URL']), commit=False)
        self.cursor.execute("""--sql
        INSERT INTO ActivityEntries (
            AppId, Title, URL, IsActive, IdleDuration, Duration
        ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            activity['AppId'], activity['Title'], activity.get('URL'), activity['IsActive'], 
            activity['IdleDuration'], activity['Duration']
        ))
        if commit: self.conn.commit()
        assert self.cursor.lastrowid is not None, "Something went wrong..."
        return self.cursor.lastrowid
    
    def update_activity(self, activity: IActivityEntry, EntryId: int, commit: bool = True) -> None:
        # TODO URL may not exists in the table if something went wrong...
        self.cursor.execute("""--sql
        REPLACE INTO ActivityEntries (
            EntryId, AppId, Title, URL, IsActive, IdleDuration, Duration
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            EntryId, activity['AppId'], activity['Title'], activity.get('URL'), activity['IsActive'], 
            activity['IdleDuration'], activity['Duration']
        ))
        if commit: self.conn.commit()
    def update_or_insert_activity(self, activity: IActivityEntry, EntryId: Optional[int] = None, commit: bool = True) -> int:
        if not EntryId:
            return self.insert_activity(activity=activity, commit=commit)
        self.update_activity(
            activity=activity, EntryId=EntryId, commit=commit
        )
        return EntryId
        
