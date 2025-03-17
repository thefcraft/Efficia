from typing import TypedDict, Optional, Literal
from sqlite3 import Cursor
from datetime import datetime, time

    

#####################################################################################
#                                         CHAT                                      #
#####################################################################################

class IChat(TypedDict):
    title: Optional[str]
    leaf_node_id: Optional[int] # None
    active_depth: int # 0

class IFetchChat(IChat):
    ChatId: int
    Timestamp: datetime
    
def create_chat(cursor: Cursor): 
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Chats (
        ChatId INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        leaf_node_id INTEGER DEFAULT NULL,
        active_depth INTEGER DEFAULT 0,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (leaf_node_id) REFERENCES Messages (MessageId)
    )
    """)
    

#####################################################################################
#                                       MESSAGE                                     #
#####################################################################################

class IMessage(TypedDict):
    ChatId: int
    content: str
    message_by: Literal['USER', 'SYSTEM', 'AI']
    message_model: Literal[None, 'GPT4', 'LLAMA3']
    message_rating: Literal[None, 'LIKE', 'DISLIKE']
    
    level: int
    parent_id: Optional[int]
    siblings: int # 0
    position: int # 0
    childs: int # 0
    is_active: bool # true
        
class IFetchMessage(IMessage):
    MessageId: int
    Timestamp: datetime

def create_message(cursor: Cursor): 
    cursor.execute("""--sql
    CREATE TABLE IF NOT EXISTS Messages (
        MessageId INTEGER PRIMARY KEY AUTOINCREMENT,
        ChatId INTEGER NOT NULL,
        content TEXT NOT NULL,
        message_by TEXT NOT NULL,
        message_model TEXT,
        message_rating TEXT,
        
        level INTEGER NOT NULL,
        parent_id INTEGER DEFAULT NULL,
        siblings INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        childs INTEGER DEFAULT 0,
        is_active Boolean DEFAULT TRUE,
        Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ChatId) REFERENCES Chats (ChatId),
        FOREIGN KEY (parent_id) REFERENCES Messages (MessageId)
    )
    """)
    