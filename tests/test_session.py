from . import db, models, database
from unittest import TestCase

class TestSession(TestCase):      
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        models.create_goal(database.cursor)
        models.create_session(database.cursor)
        database.conn.commit()
    def test_create_session(self):
        session = models.ISession(
            name='Focus Mode',
            desc='State Focus On The Current Task',
            GoalId=None
        )
        database.cursor.execute("""--sql
        INSERT INTO Sessions (
            name, desc, GoalId
        ) VALUES (?, ?, ?)
        """, (
           session['name'], session['desc'], session['GoalId']
        ))
        database.conn.commit()