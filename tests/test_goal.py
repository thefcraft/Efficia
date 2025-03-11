from . import db, models, database
from unittest import TestCase
from datetime import datetime, timezone

class TestGoal(TestCase):        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        models.create_goal(database.cursor)
        models.create_session(database.cursor)
        models.create_todo(database.cursor)
        models.create_note(database.cursor)
        models.create_notetag(database.cursor)
        models.create_notetagassignees(database.cursor)
        database.conn.commit()
        
    def test_create_goal(self):
        goal = models.IGoal(
            name='Learn Python',
            desc='Learning Python Under 30 days'
        )
        database.cursor.execute("""--sql
        INSERT INTO Goals (
            name, desc
        ) VALUES (?, ?)
        """, (
           goal['name'], goal['desc']
        ))
        database.conn.commit()
    def test_create_goal_with_sessions(self):
        goal = models.IGoal(
            name='Learn Python',
            desc='Learning Python Under 30 days'
        )
        database.cursor.execute("""--sql
        INSERT INTO Goals (
            name, desc
        ) VALUES (?, ?)
        """, (
           goal['name'], goal['desc']
        ))
        
        goalid = database.cursor.lastrowid
        
        session = models.ISession(
            name='Focus Mode',
            desc='State Focus On The Current Task',
            GoalId=goalid
        )
        database.cursor.execute("""--sql
        INSERT INTO Sessions (
            name, desc, GoalId
        ) VALUES (?, ?, ?)
        """, (
           session['name'], session['desc'], session['GoalId']
        ))
        database.conn.commit()
        
    def test_goal_todo(self):
        goal = models.IGoal(
            name='Learn Python',
            desc='Learning Python Under 30 days'
        )
        database.cursor.execute("""--sql
        INSERT INTO Goals (
            name, desc
        ) VALUES (?, ?)
        """, (
           goal['name'], goal['desc']
        ))
        goalid = database.cursor.lastrowid
        todo = models.ITodo(
            title='make_create_todo_test',
            duedate=datetime.now(timezone.utc),
            parent_id=None
        )
        database.cursor.execute("""--sql
        INSERT INTO Todos (
            title, duedate, parent_id, GoalId
        ) VALUES (?, ?, ?, ?)
        """, (
           todo['title'], todo['duedate'], todo['parent_id'], goalid
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
        
    def test_goal_note(self):
        goal = models.IGoal(
            name='Learn Python',
            desc='Learning Python Under 30 days'
        )
        database.cursor.execute("""--sql
        INSERT INTO Goals (
            name, desc
        ) VALUES (?, ?)
        """, (
           goal['name'], goal['desc']
        ))
        goalid = database.cursor.lastrowid
        note = models.INote(
            title='test_notes', content='test_note_content'
        )
        database.cursor.execute("""--sql
        INSERT INTO Notes (
            title, content, GoalId
        ) VALUES (?, ?, ?)
        """, (
           note['title'], note['content'], goalid
        ))
        note_id = database.cursor.lastrowid
        
        notetag = models.INoteTag(
            notetag='test_tag_1'
        )
        database.cursor.execute("""--sql
        INSERT OR IGNORE INTO NoteTags (
            notetag
        ) VALUES (?)
        """, (
           notetag['notetag'],
        ))
        
        notetagassignees = models.INoteTagAssignees(
            note_id=note_id,
            notetag=notetag['notetag']
        )
        database.cursor.execute("""--sql
        INSERT INTO NoteTagAssignees (
            note_id, notetag
        ) VALUES (?, ?)
        """, (
           notetagassignees['note_id'],
           notetagassignees['notetag']
        ))
        
        database.conn.commit()
        
    