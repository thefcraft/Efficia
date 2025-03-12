from . import database, models
from unittest import TestCase

class TestChat(TestCase):   
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
    def test_create_message(self):
        chat_id = database.new_chat(title='New Chat', commit=False)
        #       A
        #   B       C
        #               D
        message_A = database.new_message(
            chat_id=chat_id,
            content='Write Hello World in Python',
            message_by='USER',
            parent_message_id=None,
            message_model=None,
            commit=False
        )
        
        message_B = database.new_message(
            chat_id=chat_id,
            content='print("Hello World!")',
            message_by='AI',
            parent_message_id=message_A,
            message_model='GPT4',
            commit=False
        )
        message_C = database.new_message(
            chat_id=chat_id,
            content='from pprint import pprint; pprint("Hello World!")',
            message_by='AI',
            parent_message_id=message_A,
            message_model='LLAMA3',
            commit=False
        )
        
        message_D = database.new_message(
            chat_id=chat_id,
            content='Error pprint not found',
            message_by='USER',
            parent_message_id=message_C,
            message_model=None,
            commit=False
        )
        
        assert database.get_current_leaf_node_id(chat_id=chat_id) == message_D
        assert database.get_current_leaf_node_id(chat_id=chat_id, message_id=message_C) == message_D
        
        try:
            database.next_message(chat_id=chat_id, message_id=message_D, return_type=None, commit=False)
            assert False, "not raising error"
        except IndexError as e: ...
        
        try:
            database.prev_message(chat_id=chat_id, message_id=message_D, return_type=None, commit=False)
            assert False, "not raising error"
        except IndexError as e: ...

        assert list(map(lambda x: x['MessageId'],
            database.get_chats_down(chat_id=chat_id, message_id=message_A))) == [message_A, message_C, message_D]
        assert list(map(lambda x: x['MessageId'],
            database.get_chats_down(chat_id=chat_id, message_id=message_A, max_result=2))) == [message_A, message_C]
        
        assert list(map(lambda x: x['MessageId'],
            database.get_chats_down(chat_id=chat_id, message_id=message_C))) == [message_C, message_D]
        
        assert database.prev_message(chat_id=chat_id, message_id=message_C, return_type='prev_message_id', commit=False) == message_B
        
        assert list(map(lambda x: x['MessageId'],
            database.get_chats_down(chat_id=chat_id, message_id=message_A))) == [message_A, message_B]
        
        assert list(map(lambda x: x['MessageId'],
            database.get_chats_above(chat_id=chat_id, message_id=message_B))) == [message_B, message_A]
        
        database.conn.commit()