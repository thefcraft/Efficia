from . import db, models, database
from db import helpers
from unittest import TestCase
from datetime import time

class TestTimers(TestCase):   
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        models.create_goal(database.cursor)
        models.create_session(database.cursor)
        models.create_timer(database.cursor)
        database.conn.commit()
    def test_create_timer(self):
        timer = models.ITimer(
            title='start 30 min of focus',
            desc='focus is very important',
            duration=time(hour=0, minute=0, second=0),
            SessionId=None,
            GoalId=None
        )
        database.cursor.execute("""--sql
        INSERT INTO Timers (
            title, desc, duration, SessionId, GoalId
        ) VALUES (?, ?, ?, ?, ?)
        """, (
           timer['title'], timer['desc'], timer['duration'].strftime('%H:%M:%S'), timer['SessionId'], timer['GoalId']
        ))
        database.conn.commit()
    
    def test_create_alarm_with_goal(self):
        
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
        timer = models.ITimer(
            title='start 30 min of focus',
            desc='focus is very important',
            duration=time(hour=0, minute=0, second=0),
            SessionId=None,
            GoalId=goalid
        )
        database.cursor.execute("""--sql
        INSERT INTO Timers (
            title, desc, duration, SessionId, GoalId
        ) VALUES (?, ?, ?, ?, ?)
        """, (
           timer['title'], timer['desc'], timer['duration'].strftime('%H:%M:%S'), timer['SessionId'], timer['GoalId']
        ))
        database.conn.commit()
        
    def test_create_alarm_with_session(self):
        
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
        sessionid = database.cursor.lastrowid
        
        timer = models.ITimer(
            title='start 30 min of focus',
            desc='focus is very important',
            duration=time(hour=0, minute=0, second=0),
            SessionId=sessionid,
            GoalId=None
        )
        database.cursor.execute("""--sql
        INSERT INTO Timers (
            title, desc, duration, SessionId, GoalId
        ) VALUES (?, ?, ?, ?, ?)
        """, (
           timer['title'], timer['desc'], timer['duration'].strftime('%H:%M:%S'), timer['SessionId'], timer['GoalId']
        ))
        database.conn.commit()
        
    def test_create_alarm_with_both(self):
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
            GoalId=None
        )
        database.cursor.execute("""--sql
        INSERT INTO Sessions (
            name, desc, GoalId
        ) VALUES (?, ?, ?)
        """, (
           session['name'], session['desc'], session['GoalId']
        ))
        sessionid = database.cursor.lastrowid
        timer = models.ITimer(
            title='start 30 min of focus',
            desc='focus is very important',
            duration=time(hour=0, minute=0, second=0),
            SessionId=sessionid,
            GoalId=goalid
        )
        database.cursor.execute("""--sql
        INSERT INTO Timers (
            title, desc, duration, SessionId, GoalId
        ) VALUES (?, ?, ?, ?, ?)
        """, (
           timer['title'], timer['desc'], timer['duration'].strftime('%H:%M:%S'), timer['SessionId'], timer['GoalId']
        ))
        database.conn.commit()
        
class TestAlarm(TestCase):    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        models.create_session(database.cursor)
        models.create_goal(database.cursor)
        models.create_alarm(database.cursor)
        database.conn.commit()
    def test_create_alarm(self):
        alarm = models.IAlarm(
            title='hey start learning python on weekend',
            days=helpers.encode_weekdays([
                'sunday', 'saturday'
            ]),
            time=time(hour=15, minute=30, second=0),
            SessionId=None,
            GoalId=None
        )
        database.cursor.execute("""--sql
        INSERT INTO Alarms (
            title, days, time, SessionId, GoalId
        ) VALUES (?, ?, ?, ?, ?)
        """, (
           alarm['title'], alarm['days'], alarm['time'].strftime('%H:%M:%S'), alarm['SessionId'], alarm['GoalId']
        ))
        database.conn.commit()
        
    def test_create_alarm_with_goal(self):
        
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
        alarm = models.IAlarm(
            title='hey start learning python on weekend',
            days=helpers.encode_weekdays([
                'sunday', 'saturday'
            ]),
            time=time(hour=15, minute=30, second=0),
            SessionId=None,
            GoalId=goalid
        )
        database.cursor.execute("""--sql
        INSERT INTO Alarms (
            title, days, time, SessionId, GoalId
        ) VALUES (?, ?, ?, ?, ?)
        """, (
           alarm['title'], alarm['days'], alarm['time'].strftime('%H:%M:%S'), alarm['SessionId'], alarm['GoalId']
        ))
        database.conn.commit()
        
    def test_create_alarm_with_session(self):
        
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
        sessionid = database.cursor.lastrowid
        
        alarm = models.IAlarm(
            title='hey start learning python on weekend',
            days=helpers.encode_weekdays([
                'sunday', 'saturday'
            ]),
            time=time(hour=15, minute=30, second=0),
            SessionId=sessionid,
            GoalId=None
        )
        database.cursor.execute("""--sql
        INSERT INTO Alarms (
            title, days, time, SessionId, GoalId
        ) VALUES (?, ?, ?, ?, ?)
        """, (
           alarm['title'], alarm['days'], alarm['time'].strftime('%H:%M:%S'), alarm['SessionId'], alarm['GoalId']
        ))
        database.conn.commit()
        
    def test_create_alarm_with_both(self):
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
            GoalId=None
        )
        database.cursor.execute("""--sql
        INSERT INTO Sessions (
            name, desc, GoalId
        ) VALUES (?, ?, ?)
        """, (
           session['name'], session['desc'], session['GoalId']
        ))
        sessionid = database.cursor.lastrowid
        alarm = models.IAlarm(
            title='hey start learning python on weekend',
            days=helpers.encode_weekdays([
                'sunday', 'saturday'
            ]),
            time=time(hour=15, minute=30, second=0),
            SessionId=sessionid,
            GoalId=goalid
        )
        database.cursor.execute("""--sql
        INSERT INTO Alarms (
            title, days, time, SessionId, GoalId
        ) VALUES (?, ?, ?, ?, ?)
        """, (
           alarm['title'], alarm['days'], alarm['time'].strftime('%H:%M:%S'), alarm['SessionId'], alarm['GoalId']
        ))
        database.conn.commit()