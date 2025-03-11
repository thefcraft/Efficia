from . import database, models, modify_iEntry
from unittest import TestCase
from typing import Optional
from datetime import datetime, timezone

class TestNote(TestCase):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        models.create_note(database.cursor)
        models.create_notetag(database.cursor)
        models.create_notetagassignees(database.cursor)
        database.conn.commit()
    
    def test_create_note(self):
        note = models.INote(
            title='test_notes', content='test_note_content'
        )
        database.cursor.execute("""--sql
        INSERT INTO Notes (
            title, content
        ) VALUES (?, ?)
        """, (
           note['title'], note['content']
        ))
        database.conn.commit()
        
    def test_create_notetag(self):
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
        database.conn.commit()
        
    def test_create_notetagassignees(self):
        note = models.INote(
            title='test_notes', content='test_note_content'
        )
        database.cursor.execute("""--sql
        INSERT INTO Notes (
            title, content
        ) VALUES (?, ?)
        """, (
           note['title'], note['content']
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