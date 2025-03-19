from .helpers import Path, modulepath, logger
from .database import DataBase
from typing import Optional
from . import chatbot
from .models import IActivityEntry, IApp
import requests

if not modulepath.joinpath('..', 'instance').exists(): 
    modulepath.joinpath('..', 'instance').mkdir()

global_database: Optional[DataBase] = None
def get_database(memory: bool = False, path: Optional[Path] = None) -> DataBase: 
    global global_database
    if global_database is None:
        global_database = DataBase(
            db_path=(modulepath.joinpath('..', 'instance', 'database.db') if not path else path) if not memory else ':memory:'
        )
    return global_database
class DataBase_Api:
    def __init__(self, url: str, check_server_status: bool = True):
        self.url = url.removesuffix('/')
        if check_server_status:
            resp = requests.get(f"{self.url}/api/")
            assert resp.ok
    def insert_app(self, app: IApp):
        resp = requests.post(f"{self.url}/api/apps/", json={
            **app
        })
        assert resp.ok
    def update_or_insert_activity(self, activity: IActivityEntry, EntryId: Optional[int] = None, commit: bool = True):
        resp = requests.post(f"{self.url}/api/activity/", json={
            "activity": activity,
            "EntryId": EntryId,
            "commit": commit
        })
        assert resp.ok
def get_database_Api(check_server_status: bool = True) -> DataBase_Api:
    return DataBase_Api('http://127.0.0.1:8000', check_server_status=check_server_status)