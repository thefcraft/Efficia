import db
from db import models
from services.background_service import modify_iEntry

db.modulepath.joinpath('..', 'instance', 'debug.database.db').delete()
database = db.get_database(path=db.modulepath.joinpath('..', 'instance', 'debug.database.db'))