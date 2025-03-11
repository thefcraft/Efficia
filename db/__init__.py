from .helpers import Path, modulepath, logger
from .database import DataBase
from typing import Optional

if not modulepath.joinpath('instance').exists(): 
    modulepath.joinpath('instance').mkdir()

global_database: Optional[DataBase] = None
def get_database(memory: bool = False) -> DataBase: 
    global global_database
    if global_database is None:
        global_database = DataBase(
            db_path=modulepath.joinpath('instance', 'database.db') if not memory else ':memory:'
        )
    return global_database