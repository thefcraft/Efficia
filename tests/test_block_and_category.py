from . import db, models, database
from unittest import TestCase
from datetime import time

class TestBlock(TestCase): 
    def test_create_block(self):
        block = models.IBlock(
            permanent=False,
            daily_limit=time(hour=1, minute=15)
        )
        database.cursor.execute("""--sql
        INSERT INTO Blocks (
            permanent, daily_limit
        ) VALUES (?, ?)
        """, (
           block['permanent'], block['daily_limit'].strftime('%H:%M:%S')
        ))
        database.conn.commit()

class TestCategory(TestCase):        
    def test_create_category(self):
        category = models.ICategory(
            Category='Programming',
            BlockId=None
        )
        database.cursor.execute("""--sql
        INSERT OR IGNORE INTO Categories (
           Category, BlockId
        ) VALUES (?, ?)
        """, (
           category['Category'], category['BlockId']
        ))
        database.conn.commit()
        
    def test_block_category(self):
        block = models.IBlock(
            permanent=False,
            daily_limit=time(hour=1, minute=15)
        )
        database.cursor.execute("""--sql
        INSERT INTO Blocks (
            permanent, daily_limit
        ) VALUES (?, ?)
        """, (
           block['permanent'], block['daily_limit'].strftime('%H:%M:%S')
        ))
        blockid = database.cursor.lastrowid
        category = models.ICategory(
            Category='Programming',
            BlockId=blockid
        )
        database.cursor.execute("""--sql
        INSERT OR REPLACE INTO Categories (
           Category, BlockId
        ) VALUES (?, ?)
        """, (
           category['Category'], category['BlockId']
        ))
        database.conn.commit()