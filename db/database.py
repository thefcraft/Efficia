import sqlite3
from typing import Optional, Union
from .models import IActivityEntry, IApp, IBaseUrl, IUrl
from .models import IFetchActivityEntry, IFetchApp, IFetchBaseUrl, IFetchUrl
from . import models
from .helpers import get_baseurl, logger, get_url_info
from ml import langchain_classification
from contextlib import contextmanager

class NullCursor:
    """A placeholder cursor that raises an error if used outside the context."""
    def __getattr__(self, name):
        # Raise an error if any method or attribute is accessed on the NullCursor
        raise RuntimeError(f"Cursor is None, Please Run inside with database.cursor_context() as cursor: ...")
    
class DataBase:
    def __init__(self, db_path: str, check_create_table: bool = True, check_same_thread: bool = False):
        # Connect to SQLite database
        self.conn = sqlite3.connect(db_path, check_same_thread=check_same_thread)
        self.conn.row_factory = sqlite3.Row # Set row_factory to sqlite3.Row so that results are returned as dictionaries
        self.cursor: Union[sqlite3.Cursor, NullCursor] = NullCursor()
        with self.cursor_context() as cursor:
            if check_create_table: self.create_table()
    
    @contextmanager
    def cursor_context(self):
        self.cursor = self.conn.cursor()
        try:
            yield self.cursor  # Yield the cursor to the block of code using the context
        finally:
            self.cursor.close()  # Ensure the cursor is closed after use
            self.cursor = NullCursor()  # Remove the reference to the cursor

    def close(self, commit: bool = False) -> None:
        if commit: self.conn.commit()
        self.conn.close()
    def commit(self) -> None:
        return self.conn.commit()
    
    def create_table(self):
        models.create_block(self.cursor)
        models.create_category(self.cursor)
        models.create_app(self.cursor)
        models.create_base_url(self.cursor)
        models.create_url(self.cursor)
        models.create_activity(self.cursor)
        
        models.create_goal(self.cursor)
        models.create_session(self.cursor)
        models.create_timer(self.cursor)
        models.create_alarm(self.cursor)
        models.create_todo(self.cursor)
        models.create_note(self.cursor)
        models.create_notetag(self.cursor)
        models.create_notetagassignees(self.cursor)
        
        models.create_block_in_goal(self.cursor)
        models.create_block_in_session(self.cursor)
        
        # Commit initial table creation
        self.conn.commit()
    
    def insert_baseurl(self, baseurl: IBaseUrl, commit: bool = True) -> None:
        # Check if URL exists and whether it's fetched or not
        self.cursor.execute("""--sql
        SELECT 
            baseURL, Title, Description, is_fetched, icon_url, Timestamp
        FROM BaseURLs WHERE baseURL = ?
        LIMIT 1
        """, (
            baseurl['baseURL'],
        ))
        existing_url: IFetchBaseUrl = self.cursor.fetchone()
        
        title: Optional[str] = None
        desc: Optional[str] = None
        favicon: Optional[str] = None
        # feching info
        if not existing_url or (existing_url and not existing_url['is_fetched']):
            try:
                urlinfo = get_url_info(url=baseurl['baseURL'])
                title = urlinfo['title']
                desc = urlinfo['description']
                favicon = urlinfo['favicon_url']
            except Exception as e:
                logger.error(f"Error while Feching url info for {baseurl['baseURL']} ERROR: {e}")
                
        if existing_url is None:
            self.cursor.execute("""--sql
            INSERT INTO BaseURLs (
                baseURL, Title, Description, is_fetched, icon_url
            ) VALUES (?, ?, ?, ?, ?)
            """, (
               baseurl['baseURL'], title, desc, True, favicon
            ))
        elif existing_url and not existing_url['is_fetched']:
            self.cursor.execute("""--sql
            REPLACE INTO BaseURLs (
                baseURL, Title, Description, is_fetched, icon_url
            ) VALUES (?, ?, ?, ?, ?)
            """, (
               baseurl['baseURL'], title, desc, True, favicon
            ))
            if commit: self.conn.commit()
        try:
            new_url_class = langchain_classification.clssify_new_url(self.cursor, self.conn, 
                                                                     baseURL=baseurl['baseURL'], Title=baseurl['Title'], Description=baseurl['Description'], 
                                                                     commit=False)
            logger.info(msg=f"Url Classification report: {new_url_class} <= {baseurl['baseURL']}")
        except Exception as e:
            logger.error(msg=f"Url Classification error: {e} <= {baseurl['baseURL']}")
    
    def insert_url(self, url: IUrl, commit: bool = True) -> None:
        baseurl = get_baseurl(url['URL'])
        # if not baseurl: ... # TODO maybe just return for anyrandom string the url is None
        self.insert_baseurl(IBaseUrl(
                                     baseURL=baseurl, 
                                     Title=None, Description=None, 
                                     is_fetched=False,
                                     icon_url=None,
                                     BlockId=None,
                                     Category=None
                            ), 
                            commit=False)
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
            AppId, ExeFileName, ExeDirName, IsBrowser, CompanyName, 
            ProductName, FileVersion, ProductVersion, FileDescription, 
            InternalName, LegalCopyright, LegalTrademarks, OriginalFilename, 
            Comments, PrivateBuild, SpecialBuild
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            app['AppId'], app['ExeFileName'], app['ExeDirName'], app['IsBrowser'], app.get('CompanyName'), 
            app.get('ProductName'), app.get('FileVersion'), app.get('ProductVersion'), app.get('FileDescription'), 
            app.get('InternalName'), app.get('LegalCopyright'), app.get('LegalTrademarks'), app.get('OriginalFilename'), 
            app.get('Comments'), app.get('PrivateBuild'), app.get('SpecialBuild')
        ))
        try:
            new_app_class = langchain_classification.classify_new_app(self.cursor, self.conn, 
                                                                  app, 
                                                                  commit=False)
            logger.info(msg=f"App Classification report: {new_app_class} <= {app['AppId']}")
        except Exception as e:
            logger.error(msg=f"App Classification error: {e} <= {app['AppId']}")
        if commit: self.conn.commit()
        
    def insert_activity(self, activity: IActivityEntry, commit: bool = True) -> int:
        URL = activity.get('URL')
        if URL:
            self.insert_url(url=IUrl(URL=URL), commit=False)
        self.cursor.execute("""--sql
        INSERT INTO ActivityEntries (
            AppId, Title, URL, IsActive, IdleDuration, Duration
        ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            activity['AppId'], activity['Title'], URL, activity['IsActive'], 
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
        
