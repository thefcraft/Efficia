import sqlite3
from typing import Optional, Literal, List
from . import models

class GetMessages(models.IFetchMessage):
    depth: int

# TODO: insted of get_current_leaf_node_id safe headId into the chats database and update it so max_result matters
# TODO: also save curr depts into the database

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
    
    def new_chat(self, title: str, commit: bool = True) -> int:
        chat = models.IChat(title=title, leaf_node_id=None, active_depth=0)
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
    def update_chat_title(self, chat_id: int, title: str, commit: bool = True):
        self.cursor.execute("""--sql
            UPDATE Chats
            SET title = ?
            WHERE ChatId = ?
        """, (
           title, chat_id
        ))
        if commit: self.conn.commit() 
    
    def new_message(self, chat_id: int, content: str, message_by: Literal['USER', 'SYSTEM', 'AI'], parent_message_id: Optional[int] = None,
                    message_model: Literal[None, 'GPT4', 'LLAMA3'] = None, commit: bool = True) -> int:
        if parent_message_id is None:
            self.cursor.execute("""--sql
                SELECT COUNT(MessageId) as num_messages FROM Messages 
                WHERE parent_id IS NULL AND ChatId = ?
            """, (
                chat_id,
            ))
            parent_childs = self.cursor.fetchone()['num_messages']

            # siblings increasing and inactive all childs
            
            self.cursor.execute("""--sql
                UPDATE Messages 
                SET is_active = FALSE, siblings=?
                WHERE parent_id IS NULL AND ChatId = ?
            """, (
                parent_childs+1, chat_id
            ))
            
            level = 1
            position = parent_childs + 1
            siblings = parent_childs + 1

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

        new_message_id = self.cursor.lastrowid

        self.cursor.execute("""--sql
            UPDATE Chats
            SET leaf_node_id = ?, active_depth = ?
            WHERE ChatId = ?
        """, (
            new_message_id, message['level'], message['ChatId']
        ))

        if commit: self.conn.commit()
        assert new_message_id is not None, "Something went wrong..."
        return new_message_id
    
    def next_message(self, chat_id: int, message_id: int, return_type: Literal[None, 'next_message_id', 'next_message_leaf_id'] = 'next_message_leaf_id', 
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
        assert message is not None, "message not found by given ids"
        if message['position'] == message['siblings']: 
            raise IndexError("already at last chat")
        
        if message['parent_id'] is None:
            self.cursor.execute("""--sql
                UPDATE Messages 
                SET is_active = (position=?)
                WHERE level = 1 AND parent_id IS NULL
            """, (
                message['position'] + 1,
            ))
        else:
            self.cursor.execute("""--sql
                UPDATE Messages 
                SET is_active = (position=?)
                WHERE level = ? AND parent_id = ?
            """, (
                message['position'] + 1, message['level'], message['parent_id']
            ))
        new_leaf_node_id = self.get_current_leaf_node_id(chat_id=chat_id, message_id=message['parent_id'], use_get_chat_info=False)
        self.cursor.execute("""--sql
            UPDATE Chats 
            SET leaf_node_id = ?
            WHERE ChatId = ?
        """, (
            new_leaf_node_id, chat_id
        ))

        if commit: self.conn.commit()
        
        if return_type == 'next_message_leaf_id':
            return new_leaf_node_id
        
        if return_type == 'next_message_id':
            return self.get_current_active_child_id(chat_id=chat_id, message_id=message['parent_id'])
        
    def prev_message(self, chat_id: int, message_id: int, return_type: Literal[None, 'prev_message_id', 'prev_message_leaf_id'] = 'prev_message_leaf_id', 
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
        assert message is not None, "message not found by given ids"
        if message['position'] == 1: 
            raise IndexError("already at first chat")
        
        if message['parent_id'] is None:
            self.cursor.execute("""--sql
                UPDATE Messages 
                SET is_active = (position=?)
                WHERE level = 1 AND parent_id IS NULL
            """, (
                message['position'] - 1,
            ))
        else:
            self.cursor.execute("""--sql
                UPDATE Messages 
                SET is_active = (position=?)
                WHERE level = ? AND parent_id = ?
            """, (
                message['position'] - 1, message['level'], message['parent_id']
            ))

        new_leaf_node_id = self.get_current_leaf_node_id(chat_id=chat_id, message_id=message['parent_id'], use_get_chat_info=False)
        self.cursor.execute("""--sql
            UPDATE Chats 
            SET leaf_node_id = ?
            WHERE ChatId = ?
        """, (
            new_leaf_node_id, message['ChatId']
        ))

        if commit: self.conn.commit()
        
        if return_type == 'prev_message_leaf_id':
            return new_leaf_node_id
        
        if return_type == 'prev_message_id':
            return self.get_current_active_child_id(chat_id=chat_id, message_id=message['parent_id'])
        
    def get_current_active_child_id(self, chat_id: int, message_id: Optional[int]) -> int: 
        if message_id is None:
            self.cursor.execute("""--sql
                SELECT 
                    MessageId, ChatId, content, message_by, message_model, message_rating, 
                    level, parent_id, siblings, position, childs, is_active, Timestamp
                FROM Messages WHERE parent_id IS NULL AND is_active AND ChatId = ?
                LIMIT 1
            """, (
                chat_id,
            ))
        else:
            self.cursor.execute("""--sql
                SELECT 
                    MessageId, ChatId, content, message_by, message_model, message_rating, 
                    level, parent_id, siblings, position, childs, is_active, Timestamp
                FROM Messages WHERE parent_id = ? AND is_active AND ChatId = ?
                LIMIT 1
            """, (
                message_id, chat_id
            ))
        child_message: Optional[models.IFetchMessage] = self.cursor.fetchone()
        assert child_message is not None, "something went wrong, no child at all"
        return child_message['MessageId']

    def get_current_leaf_node_id(self, chat_id: int, message_id: Optional[int] = None, use_get_chat_info: bool = True) -> int: 
        if message_id is None:
            if use_get_chat_info:
                leaf_node_id = self.get_chat_info(chat_id)['leaf_node_id']
            else:
                self.cursor.execute("""--sql                    
                WITH RECURSIVE active_path(MessageId, parent_id, level, is_active) As (
                    -- Base case: start from the given root node.
                    SELECT m.MessageId, m.parent_id, m.level, m.is_active
                    FROM Messages as m
                    WHERE m.ChatId=? AND m.parent_id IS NULL AND m.is_active
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
            items: list = self.cursor.fetchall()
            assert len(items) != 0, "This is already a leaf node"
            item = items[-1]
            leaf_node_id = item['MessageId']
        else:
            self.cursor.execute("""--sql                    
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
            leaf_node_id = item['MessageId']
        return leaf_node_id
    
    def get_chats_above(self, chat_id: int, message_id: int, max_result: int = 50) -> List[GetMessages]:
        self.cursor.execute("""--sql                    
            WITH RECURSIVE active_path(MessageId, ChatId, content, message_by, message_model, message_rating, 
                            level, parent_id, siblings, position, childs, is_active, Timestamp, depth) As (
                -- Base case: start from the given root node.
                SELECT m.MessageId, m.ChatId, m.content, m.message_by, m.message_model, m.message_rating, m.level, m.parent_id, m.siblings, m.position, m.childs, m.is_active, m.Timestamp, 1 as depth
                FROM Messages as m
                WHERE m.ChatId=? AND m.MessageId = ?
                UNION ALL
                -- Recursive case: join on the parent.
                SELECT m.MessageId, m.ChatId, m.content, m.message_by, m.message_model, m.message_rating, m.level, m.parent_id, m.siblings, m.position, m.childs, m.is_active, m.Timestamp, a.depth + 1 as depth
                FROM Messages as m
                INNER JOIN active_path AS a ON m.ChatId = a.ChatId and m.MessageId = a.parent_id and m.is_active and depth != ?
            )
            SELECT * FROM active_path
        """, (
            chat_id, message_id, max_result
        ))
        
        items: list = self.cursor.fetchall()
        return items
        
    def get_chats_down(self, chat_id: int, message_id: Optional[int], max_result: int = 50) -> List[GetMessages]:
        if message_id is None:
            self.cursor.execute("""--sql                    
                WITH RECURSIVE active_path(MessageId, ChatId, content, message_by, message_model, message_rating, 
                                level, parent_id, siblings, position, childs, is_active, Timestamp, depth) As (
                    -- Base case: start from the given root node.
                    SELECT m.MessageId, m.ChatId, m.content, m.message_by, m.message_model, m.message_rating, m.level, m.parent_id, m.siblings, m.position, m.childs, m.is_active, m.Timestamp, 1 as depth
                    FROM Messages as m
                    WHERE m.ChatId=? AND m.parent_id IS NULL AND m.is_active
                    UNION ALL
                    -- Recursive case: join on the parent.
                    SELECT m.MessageId, m.ChatId, m.content, m.message_by, m.message_model, m.message_rating, m.level, m.parent_id, m.siblings, m.position, m.childs, m.is_active, m.Timestamp, a.depth + 1 as depth
                    FROM Messages as m
                    INNER JOIN active_path a ON m.ChatId = a.ChatId and a.MessageId = m.parent_id and m.is_active and depth != ?
                )
                SELECT * FROM active_path
            """, (
                chat_id, max_result
            ))
        else:
            self.cursor.execute("""--sql                    
                WITH RECURSIVE active_path(MessageId, ChatId, content, message_by, message_model, message_rating, 
                                level, parent_id, siblings, position, childs, is_active, Timestamp, depth) As (
                    -- Base case: start from the given root node.
                    SELECT m.MessageId, m.ChatId, m.content, m.message_by, m.message_model, m.message_rating, m.level, m.parent_id, m.siblings, m.position, m.childs, m.is_active, m.Timestamp, 1 as depth
                    FROM Messages as m
                    WHERE m.ChatId=? AND m.MessageId = ?
                    UNION ALL
                    -- Recursive case: join on the parent.
                    SELECT m.MessageId, m.ChatId, m.content, m.message_by, m.message_model, m.message_rating, m.level, m.parent_id, m.siblings, m.position, m.childs, m.is_active, m.Timestamp, a.depth + 1 as depth
                    FROM Messages as m
                    INNER JOIN active_path a ON m.ChatId = a.ChatId and a.MessageId = m.parent_id and m.is_active and depth != ?
                )
                SELECT * FROM active_path
            """, (
                chat_id, message_id, max_result
            ))

        items: list = self.cursor.fetchall()
        return items
    
    def get_chat_info(self, chat_id: int) -> models.IFetchChat:
        self.cursor.execute("""--sql
            SELECT ChatId, title, leaf_node_id, active_depth, Timestamp FROM Chats 
            WHERE ChatId = ?
        """, (
            chat_id, 
        ))
        chat: models.IFetchChat = self.cursor.fetchone()
        assert chat is not None, "Chat_id is Wrong, or maybe something went wrong"
        return chat
    
    def get_chat_messages(self, chat_id: int) -> List[models.IFetchMessage]:
        self.cursor.execute("""--sql
            SELECT MessageId, ChatId, content, message_by, message_model, message_rating, level, parent_id, siblings, position, childs, is_active, Timestamp
            FROM Messages
            WHERE ChatId = ?
            ORDER BY level ASC, position ASC
        """, (
            chat_id, 
        ))
        messages = self.cursor.fetchall()
        return messages
    
    def get_chat_message(self, chat_id: int, message_id: int) -> models.IFetchMessage:
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
        assert message is not None, "message not found by given ids"
        return message
    
    def get_lazy_chat_messages(self, chat_id: int) -> List[models.IFetchMessage]:
        self.cursor.execute("""--sql                    
            WITH RECURSIVE active_path(MessageId, ChatId, content, message_by, message_model, message_rating, 
                            level, parent_id, siblings, position, childs, is_active, Timestamp, depth) As (
                -- Base case: start from the given root node.
                SELECT m.MessageId, m.ChatId, m.content, m.message_by, m.message_model, m.message_rating, m.level, m.parent_id, m.siblings, m.position, m.childs, m.is_active, m.Timestamp, 1 as depth
                FROM Messages as m
                WHERE m.ChatId=? AND m.parent_id IS NULL AND m.is_active
                UNION ALL
                -- Recursive case: join on the parent.
                SELECT m.MessageId, m.ChatId, m.content, m.message_by, m.message_model, m.message_rating, m.level, m.parent_id, m.siblings, m.position, m.childs, m.is_active, m.Timestamp, a.depth + 1 as depth
                FROM Messages as m
                INNER JOIN active_path a ON m.ChatId = a.ChatId and a.MessageId = m.parent_id and m.is_active
            )
                            
            SELECT m.MessageId, m.ChatId, m.content, m.message_by, m.message_model, m.message_rating, m.level, m.parent_id, m.siblings, m.position, m.childs, m.is_active, m.Timestamp
            FROM Messages as m
            INNER JOIN active_path a ON m.ChatId = ? and ((m.parent_id IS NULL AND a.parent_id IS NULL) OR (a.parent_id = m.parent_id))
            ORDER BY m.level ASC, m.position ASC
        """, (
            chat_id,chat_id
        ))
        messages = self.cursor.fetchall()
        return messages
    
    def get_all_chats(self) -> List[models.IFetchChat]:
        self.cursor.execute("""--sql                    
            SELECT ChatId, title, leaf_node_id, active_depth, Timestamp
            FROM Chats
            ORDER BY Timestamp DESC
        """, ())
        chats = self.cursor.fetchall()
        return chats