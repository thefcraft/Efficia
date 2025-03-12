from .. import db
from db.chatbot import models

db.chatbot.modulepath.joinpath('..', 'instance', 'chatbot', 'debug.database.db').delete()
database = db.chatbot.get_database(path=db.chatbot.modulepath.joinpath('..', 'instance', 'chatbot', 'debug.database.db'))