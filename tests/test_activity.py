from . import database, models, modify_iEntry
from unittest import TestCase
from typing import Optional

class TestActivity(TestCase):        
    def test_insert_app(self):
        database.insert_app(
            app=models.IApp(
                AppId='test_app',
                ExeFileName='test_exe.exe',
                ExeDirName='test',
                IsBrowser=False
            ), commit=True
        )
    def test_insert_activity(self):
        database.update_or_insert_activity(
            activity=models.IActivityEntry(
                AppId='1', # TODO: Must not able to insert in the database as foreign key is invalid
                Title='test_title',
                URL=None,
                IsActive=True,
                IdleDuration=0.1,
                Duration=12 # TODO convert it into int in the database
            ), 
            EntryId=None,
            commit=True
        )
    def test_update_activity(self):
        iEntry = models.IActivityEntry(
            AppId='1',
            Title='test_title',
            URL=None,
            IsActive=True,
            IdleDuration=0.1,
            Duration=12
        )
        insert_activity_id = database.update_or_insert_activity(
            activity=iEntry, 
            EntryId=None,
            commit=False
        )
        database.update_or_insert_activity(
            activity=modify_iEntry(
                iEntry=iEntry,
                active=False, # TODO: Remove this in the modify activity as if this changes then the activity should be changed too
                idleDuration=7.64,
                entry_duration=246
            ), 
            EntryId=insert_activity_id,
            commit=True
        )
        
        
