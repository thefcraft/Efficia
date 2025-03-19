from db import get_database_Api as get_database, DataBase_Api as DataBase, logger
from db.models import IUrl, IApp, IActivityEntry
from .background_service_helper import App, SleepError
from .constants import INTERVAL, INACTIVITY_LIMIT, SAVE_EVERY#, MIN_DURATION_TO_SAVE
import time
from typing import Optional

def modify_iEntry(iEntry: IActivityEntry, active: bool, idleDuration: int, entry_duration: int) -> IActivityEntry:
    iEntry["IsActive"] = active
    iEntry['IdleDuration'] = idleDuration
    iEntry["Duration"] = entry_duration
    return iEntry

# conn.execute('SAVEPOINT sp1')
# cursor.execute('RELEASE SAVEPOINT sp1')
# conn.execute('ROLLBACK TO SAVEPOINT sp1')

def service(database: DataBase):
    old_app = App.from_active_window()
    old_app_id = old_app.app_id
    old_entry_id = old_app.entry_id
    old_idle_duration = old_app.get_idle_duration()
    old_active = old_idle_duration <= INACTIVITY_LIMIT
    entry_duration = 0
    last_activity_index: Optional[int] = None
    time_since_update = 0
    old_app_iEntry = old_app.get_iEntry(active=old_active, idleDuration=old_idle_duration, entry_duration=entry_duration)
    is_first: bool = True
    while True:
        time.sleep(INTERVAL) # entry_duration + INTERVAL because i am sleeping before this...
        try:
            new_app = App.from_active_window()
            new_app_id = new_app.app_id
            new_entry_id = new_app.entry_id
            new_idle_duration = new_app.get_idle_duration()
            new_active = new_idle_duration <= INACTIVITY_LIMIT
        
            full_screen_entry_id: Optional[str] = None
            if not new_app.url and new_app.is_browser and new_app.isfullscreen: # new_app.url @cached
                full_screen_entry_id = new_app.get_entry_id(old_app.url)
            
        except SleepError as e:
            logger.error(msg=f"{e}")
            continue
        except Exception as e:
            logger.error(msg=f"{e}")
            continue
        
        # new_app.get_window_gui_debug_info()
        if new_app_id == old_app_id and not is_first: # same app
            if new_entry_id == old_entry_id or (full_screen_entry_id and full_screen_entry_id == old_entry_id): # same window in an app
                if old_active == new_active: # same app and old one has same active state
                    logger.debug(f"SAME APP AND WINDOW AND ACTIVE STATE")
                    if time_since_update > SAVE_EVERY:
                        last_activity_index = database.update_or_insert_activity(
                            activity=modify_iEntry(iEntry=old_app_iEntry,
                                active=old_active, idleDuration=old_idle_duration, entry_duration=entry_duration + INTERVAL
                            ), 
                            EntryId=last_activity_index,
                            commit=True # NOTE: SAVE_EVERY
                        )
                        time_since_update = 0
                    # ------------------------
                    old_idle_duration = new_idle_duration
                    old_active = new_active
                    entry_duration += INTERVAL
                    time_since_update += INACTIVITY_LIMIT
                else: # same app but old one has different active state
                    logger.debug(f"SAME APP AND WINDOW BUT DIFFERENT ACTIVE STATE, new state: {not old_active}")
                    if not entry_duration == 0:
                        database.update_or_insert_activity(
                            activity=modify_iEntry(iEntry=old_app_iEntry,
                                active=old_active, idleDuration=old_idle_duration, entry_duration=entry_duration + INTERVAL
                            ), 
                            EntryId=last_activity_index,
                            commit=False
                        )
                    # ------------------------
                    old_active = new_active
                    old_idle_duration = new_idle_duration
                    old_active = new_active
                    entry_duration = 0
                    last_activity_index = None
                    time_since_update = 0
            else: # same app but different window
                logger.debug(f"SAME APP BUT DIFFERENT WINDOW: {new_app}")
                if not entry_duration == 0:
                    database.update_or_insert_activity(
                        activity=modify_iEntry(iEntry=old_app_iEntry,
                            active=old_active, idleDuration=old_idle_duration, entry_duration=entry_duration + INTERVAL
                        ), 
                        EntryId=last_activity_index,
                        commit=False
                    )
                # ------------------------
                old_app = new_app
                old_entry_id = new_entry_id
                old_idle_duration = new_idle_duration
                old_active = new_active
                entry_duration = 0
                last_activity_index = None
                time_since_update = 0
                old_app_iEntry = new_app.get_iEntry(active=new_active, idleDuration=new_idle_duration, entry_duration=entry_duration)
        else: # different app
            logger.debug(f"CHANGED TO NEW APP: {new_app}")
            if not entry_duration == 0:
                database.update_or_insert_activity(
                    activity=modify_iEntry(iEntry=old_app_iEntry,
                        active=old_active, idleDuration=old_idle_duration, entry_duration=entry_duration + INTERVAL
                    ), 
                    EntryId=last_activity_index,
                    commit=False
                )
            database.insert_app(
                app=new_app.get_iApp()
            )
            new_app.save_icon()
            # ------------------------
            old_app = new_app
            old_app_id = new_app_id
            old_entry_id = new_entry_id
            old_idle_duration = new_idle_duration
            old_active = new_active
            entry_duration = 0
            last_activity_index = None
            time_since_update = 0
            old_app_iEntry = new_app.get_iEntry(active=new_active, idleDuration=new_idle_duration, entry_duration=entry_duration)
            is_first = False

def run_service(check_server_status: bool = True):
    database = get_database(check_server_status)
    try:
        service(database)
    except KeyboardInterrupt as e:
        ...
    # finally:
    #     database.close(commit=True)
    print("running background service")