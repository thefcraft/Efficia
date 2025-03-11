from . import database, models, modify_iEntry
from unittest import TestCase
from typing import Optional
from datetime import datetime, timezone

class TestTodo(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        models.create_todo(database.cursor)
        database.conn.commit()
    
    def test_create_todo(self):
        todo = models.ITodo(
            title='make_create_todo_test',
            duedate=datetime.now(timezone.utc),
            parent_id=None
        )
        database.cursor.execute("""--sql
        INSERT INTO Todos (
            title, duedate, parent_id
        ) VALUES (?, ?, ?)
        """, (
           todo['title'], todo['duedate'], todo['parent_id']
        ))
        database.conn.commit()
        
    def test_create_child_todo(self):
        todo = models.ITodo(
            title='make_create_todo_test',
            duedate=datetime.now(timezone.utc),
            parent_id=None
        )
        database.cursor.execute("""--sql
        INSERT INTO Todos (
            title, duedate, parent_id
        ) VALUES (?, ?, ?)
        """, (
           todo['title'], todo['duedate'], todo['parent_id']
        ))
        parentid = database.cursor.lastrowid
        todo = models.ITodo(
            title='make_create_child_todo_test',
            duedate=datetime.now(timezone.utc),
            parent_id=parentid
        )
        database.cursor.execute("""--sql
        INSERT INTO Todos (
            title, duedate, parent_id
        ) VALUES (?, ?, ?)
        """, (
           todo['title'], todo['duedate'], todo['parent_id']
        ))
        database.conn.commit()