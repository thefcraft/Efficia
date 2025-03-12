from . import database, models
from unittest import TestCase

class TestChat(TestCase):   
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    def test_create_chat(self):
        chatid = database.new_chat(title='New Chat', commit=False)
        database.conn.commit()