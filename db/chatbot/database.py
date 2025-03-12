import sqlite3
from typing import Optional, Literal, List
from . import models

class DataBase:
    def __init__(self, db_path: str):
        # Connect to SQLite database
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row # Set row_factory to sqlite3.Row so that results are returned as dictionaries
        self.cursor = self.conn.cursor()
        self.create_table()
        
    def close(self, commit: bool = False) -> None:
        if commit: self.conn.commit()
        self.conn.close()
    
    def create_table(self):
        models.create_chat(self.cursor)
        models.create_message(self.cursor)
        # Commit initial table creation
        self.conn.commit()
    
    def new_chat(self, title: Optional[str] = None, commit: bool = True) -> int:
        chat = models.IChat(title=title)
        self.cursor.execute("""--sql
            INSERT INTO Chats (
                title
            ) VALUES (?)
        """, (
           chat['title'],
        ))
        if commit: self.conn.commit()
        assert self.cursor.lastrowid is not None, "Something went wrong..."
        return self.cursor.lastrowid
    
    def new_message(self, chat_id: int, content: str, message_by: Literal['USER', 'SYSTEM', 'AI'], parent_message_id: Optional[int] = None,
                    message_model: Literal[None, 'GPT4', 'LLAMA3'] = None, commit: bool = True) -> int:
        if parent_message_id is None:
            level = 1
            position = 1
            siblings = 1
        else:
            self.cursor.execute("""--sql
                SELECT 
                    MessageId, ChatId, content, message_by, message_model, message_rating, 
                    level, parent_id, siblings, position, childs, is_active, Timestamp
                FROM Messages WHERE MessageId = ? AND ChatId = ?
                LIMIT 1
            """, (
                parent_message_id, chat_id
            ))
            parent: Optional[models.IFetchMessage] = self.cursor.fetchone()
            assert parent is not None, "Wrong id"
            parent_childs = parent['childs']
            parent_level = parent['level']
            
            self.cursor.execute("""--sql
                UPDATE Messages 
                SET childs=?
                WHERE MessageId = ? AND ChatId = ?
            """, (
                parent_childs + 1, parent_message_id, chat_id
            ))
            
            # siblings increasing and inactive all childs
            
            self.cursor.execute("""--sql
                UPDATE Messages 
                SET is_active = FALSE, siblings=?
                WHERE parent_id = ? AND ChatId = ?
            """, (
                parent_childs+1, parent_message_id, chat_id
            ))
            
            level = parent_level + 1
            position = parent_childs + 1
            siblings = parent_childs + 1

        message = models.IMessage(
            ChatId=chat_id,
            content=content,
            message_by=message_by,
            message_model=message_model,
            message_rating=None,
            level=level,
            parent_id=parent_message_id,
            siblings=siblings,
            position=position,
            childs=0,
            is_active=True
        )
        
        self.cursor.execute("""--sql
            INSERT INTO Messages (
                ChatId, content, message_by, message_model, message_rating, level, parent_id, siblings, position, childs, is_active
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
           message['ChatId'], message['content'], message['message_by'], message['message_model'], message['message_rating'],
           message['level'], message['parent_id'], message['siblings'], message['position'], message['childs'], message['is_active']
        ))
        if commit: self.conn.commit()
        assert self.cursor.lastrowid is not None, "Something went wrong..."
        return self.cursor.lastrowid
    
    def next_message(self, chat_id: int, message_id: int, return_type: Literal[None, 'next_message_id', 'next_message_leaf_id'] = 'next_message_id', 
                     commit: bool = True) -> Optional[int]:
        self.cursor.execute("""--sql
            SELECT 
                MessageId, ChatId, content, message_by, message_model, message_rating, 
                level, parent_id, siblings, position, childs, is_active, Timestamp
            FROM Messages WHERE MessageId = ? AND ChatId = ?
            LIMIT 1
        """, (
            message_id, chat_id
        ))
        message: Optional[models.IFetchMessage] = self.cursor.fetchone()
        assert message is not None, "chat not found by given ids"
        if message['position'] == message['siblings']: 
            raise IndexError("already at last chat")
        
        self.cursor.execute("""--sql
            UPDATE Messages 
            SET is_active = (position=?),
            WHERE level = ? AND parent_id = ?
        """, (
            message['position'] + 1, message['level'], message['parent_id']
        ))
        if commit: self.conn.commit()
        
        if return_type == 'next_message_leaf_id':
            return self.get_current_leaf_node_id(chat_id=chat_id, message_id=message['parent_id'])
        
        if return_type == 'next_message_id':
            return self.get_current_active_child_id(chat_id=chat_id, message_id=message['parent_id'])
        
    def prev_message(self, chat_id: int, message_id: int, return_type: Literal[None, 'prev_message_id', 'prev_message_leaf_id'] = 'prev_message_id', 
                     commit: bool = True) -> Optional[int]:
        self.cursor.execute("""--sql
            SELECT 
                MessageId, ChatId, content, message_by, message_model, message_rating, 
                level, parent_id, siblings, position, childs, is_active, Timestamp
            FROM Messages WHERE MessageId = ? AND ChatId = ?
            LIMIT 1
        """, (
            message_id, chat_id
        ))
        message: Optional[models.IFetchMessage] = self.cursor.fetchone()
        assert message is not None, "chat not found by given ids"
        if message['position'] == 1: 
            raise IndexError("already at first chat")
        
        self.cursor.execute("""--sql
            UPDATE Messages 
            SET is_active = (position=?)
            WHERE level = ? AND parent_id = ?
        """, (
            message['position'] - 1, message['level'], message['parent_id']
        ))
        if commit: self.conn.commit()
        
        if return_type == 'prev_message_leaf_id':
            return self.get_current_leaf_node_id(chat_id=chat_id, message_id=message['parent_id'])
        
        if return_type == 'prev_message_id':
            return self.get_current_active_child_id(chat_id=chat_id, message_id=message['parent_id'])
        
    def get_current_active_child_id(self, chat_id: int, message_id: int) -> int: 
        self.cursor.execute("""--sql
            SELECT 
                MessageId, ChatId, content, message_by, message_model, message_rating, 
                level, parent_id, siblings, position, childs, is_active, Timestamp
            FROM Messages WHERE parent_id = ? AND is_active = TRUE AND ChatId = ?
            LIMIT 1
        """, (
            message_id, chat_id
        ))
        child_message: Optional[models.IFetchMessage] = self.cursor.fetchone()
        assert child_message is not None, "something went wrong, no child at all"
        return child_message['MessageId']
        
    def get_current_leaf_node_id(self, chat_id: int, message_id: Optional[int] = None) -> int: 
        if message_id is None:
            self.cursor.execute(f"""--sql                    
                WITH RECURSIVE active_path(MessageId, parent_id, level, is_active) As (
                    -- Base case: start from the given root node.
                    SELECT m.MessageId, m.parent_id, m.level, m.is_active
                    FROM Messages as m
                    WHERE m.ChatId=? AND m.parent_id IS NULL
                    UNION ALL
                    -- Recursive case: join on the parent.
                    SELECT m.MessageId, m.parent_id, m.level, m.is_active
                    FROM Messages as m
                    INNER JOIN active_path a ON a.MessageId = m.parent_id and m.is_active
                )
                SELECT * FROM active_path
            """, (
                chat_id,
            ))    
        else:
            self.cursor.execute(f"""--sql                    
                WITH RECURSIVE active_path(MessageId, parent_id, level, is_active) As (
                    -- Base case: start from the given root node.
                    SELECT m.MessageId, m.parent_id, m.level, m.is_active
                    FROM Messages as m
                    WHERE m.ChatId=? AND m.MessageId = ?
                    UNION ALL
                    -- Recursive case: join on the parent.
                    SELECT m.MessageId, m.parent_id, m.level, m.is_active
                    FROM Messages as m
                    INNER JOIN active_path a ON a.MessageId = m.parent_id and m.is_active
                )
                SELECT * FROM active_path
            """, (
                chat_id, message_id
            ))
        
        items: list = self.cursor.fetchall()
        assert len(items) != 0, "This is already a leaf node"
        item = items[-1]
        return item['MessageId']
    
    def get_chats_above(self, chat_id: int, message_id: int, max_result: int = 50) -> List:
        self.cursor.execute(f"""--sql                    
            WITH RECURSIVE active_path(MessageId, parent_id, level, is_active, ChatId, query_index) As (
                -- Base case: start from the given root node.
                SELECT m.MessageId, m.parent_id, m.level, m.is_active, m.ChatId, 1 as query_index
                FROM Messages as m
                WHERE m.ChatId=? AND m.MessageId = ?
                UNION ALL
                -- Recursive case: join on the parent.
                SELECT m.MessageId, m.parent_id, m.level, m.is_active, m.ChatId, a.query_index + 1 as query_index
                FROM Messages as m
                INNER JOIN active_path a ON m.ChatId = a.ChatId and m.MessageId = a.parent_id and m.is_active and query_index != ?
            )
            SELECT * FROM active_path
        """, (
            chat_id, message_id, max_result
        ))
        
        items: list = self.cursor.fetchall()
        return items
        
    def get_chats_down(self, chat_id: int, message_id: int, max_result: int = 50) -> List:
        self.cursor.execute(f"""--sql                    
            WITH RECURSIVE active_path(MessageId, parent_id, level, is_active, ChatId, query_index) As (
                -- Base case: start from the given root node.
                SELECT m.MessageId, m.parent_id, m.level, m.is_active, m.ChatId, 1 as query_index
                FROM Messages as m
                WHERE m.ChatId=? AND m.MessageId = ?
                UNION ALL
                -- Recursive case: join on the parent.
                SELECT m.MessageId, m.parent_id, m.level, m.is_active, m.ChatId, a.query_index + 1 as query_index
                FROM Messages as m
                INNER JOIN active_path a ON m.ChatId = a.ChatId and a.MessageId = m.parent_id and m.is_active and query_index != ?
            )
            SELECT * FROM active_path
        """, (
            chat_id, message_id, max_result
        ))
        
        items: list = self.cursor.fetchall()
        return items
    
