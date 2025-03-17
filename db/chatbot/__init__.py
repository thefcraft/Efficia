from typing import Optional
from .helpers import modulepath, Path
from .database import DataBase, GetMessages

if not modulepath.joinpath('..', 'instance').exists(): 
    modulepath.joinpath('..', 'instance').mkdir()
if not modulepath.joinpath('..', 'instance', 'chatbot').exists(): 
    modulepath.joinpath('..', 'instance', 'chatbot').mkdir()


global_database: Optional[DataBase] = None
def get_database(memory: bool = False, path: Optional[Path] = None) -> DataBase: 
    global global_database
    if global_database is None:
        global_database = DataBase(
            db_path=(modulepath.joinpath('..', 'instance', 'chatbot', 'database.db') if not path else path) if not memory else ':memory:'
        )
    return global_database