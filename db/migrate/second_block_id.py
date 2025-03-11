import sqlite3
from db import models

def undo_migration(conn: sqlite3.Connection) -> bool:
    cursor = conn.cursor()

    # Check if the migration has already been undone
    cursor.execute("PRAGMA table_info(BaseURLs)")
    columns = set(map(lambda x: x[1], cursor.fetchall()))
    if 'Category' not in columns:
        print("Migration has already been undone...")
        return True
    
    try:
        cursor.execute("PRAGMA foreign_keys=off;")  # Disable foreign key enforcement
        
        # Create the old BaseURLs table (same schema as before the migration)
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS Apps_old (
            AppId TEXT PRIMARY KEY,
            ExeFileName TEXT NOT NULL,
            ExeDirName TEXT NOT NULL,
            IsChromiumBased BOOLEAN NOT NULL,
            CompanyName TEXT,
            ProductName TEXT,
            FileVersion TEXT,
            ProductVersion TEXT,
            FileDescription TEXT,
            InternalName TEXT,
            LegalCopyright TEXT,
            LegalTrademarks TEXT,
            OriginalFilename TEXT,
            Comments TEXT,
            PrivateBuild TEXT,
            SpecialBuild TEXT,
            Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        # Create the old BaseURLs table (same schema as before the migration)
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS BaseURLs_old (
            baseURL TEXT PRIMARY KEY,
            Title TEXT,
            Description TEXT,
            is_fetched BOOLEAN DEFAULT FALSE,   -- after migration `first_updating_url`
            icon_url TEXT,                      -- after migration `first_updating_url`
            Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        # Copy the data from the new table to the old one
        cursor.execute("""--sql
        INSERT INTO BaseURLs_old (baseURL, Title, Description, is_fetched, icon_url, Timestamp)
        SELECT baseURL, Title, Description, is_fetched, icon_url, Timestamp FROM BaseURLs;
        """)
        cursor.execute("""--sql
        INSERT INTO Apps_old (
            AppId, ExeFileName, ExeDirName, IsChromiumBased, CompanyName, ProductName,
            FileVersion, ProductVersion, FileDescription, InternalName, LegalCopyright, 
            LegalTrademarks, OriginalFilename, Comments, PrivateBuild, SpecialBuild,
            Timestamp
        )
        SELECT AppId, ExeFileName, ExeDirName, IsBrowser, CompanyName, ProductName,
            FileVersion, ProductVersion, FileDescription, InternalName, LegalCopyright, 
            LegalTrademarks, OriginalFilename, Comments, PrivateBuild, SpecialBuild,
            Timestamp FROM Apps;
        """)

        # Drop the new BaseURLs table
        cursor.execute("DROP TABLE BaseURLs;")
        cursor.execute("DROP TABLE Apps;")
        
        # Rename the old table back to BaseURLs
        cursor.execute("ALTER TABLE BaseURLs_old RENAME TO BaseURLs;")
        cursor.execute("ALTER TABLE Apps_old RENAME TO Apps;")
        
        cursor.execute("DROP TABLE Categories;")
        cursor.execute("DROP TABLE Blocks;")
        
        cursor.execute("DROP TABLE NoteTagAssignees;")
        cursor.execute("DROP TABLE NoteTags;")
        cursor.execute("DROP TABLE Notes;")
        cursor.execute("DROP TABLE Todos;")
        cursor.execute("DROP TABLE Alarms;")
        cursor.execute("DROP TABLE Timers;")
        cursor.execute("DROP TABLE Sessions;")
        cursor.execute("DROP TABLE Goals;")
        
        cursor.execute("DROP TABLE BlockInGoals;")
        cursor.execute("DROP TABLE BlockInSessions;")
        
        cursor.execute("PRAGMA foreign_keys=on;")  # Re-enable foreign key enforcement
        
        # Commit the changes to the database
        conn.commit()

        print("Migration undone successfully.")
        return True
    except sqlite3.Error as e:
        print(f"Undo migration failed: {e}")
        conn.rollback()  # Rollback any changes in case of an error
        return False
    
def migrate_database(conn: sqlite3.Connection) -> bool:
    cursor = conn.cursor()
    
    models.create_block(cursor)
    models.create_category(cursor)
    
    # Check if the migration has already been done
    cursor.execute("PRAGMA table_info(BaseURLs)")
    columns = set(map(lambda x: x[1], cursor.fetchall()))
    if 'Category' in columns:
        print("Already migrated...")
        return True

    try:
        cursor.execute("PRAGMA foreign_keys=off;")  # Disable foreign key enforcement
        
        # Rename the old table to keep the original data
        cursor.execute("ALTER TABLE BaseURLs RENAME TO BaseURLs_old;")
        cursor.execute("ALTER TABLE Apps RENAME TO Apps_old;")
        
        # Create the new BaseURLs table with the new columns
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS BaseURLs (
            baseURL TEXT PRIMARY KEY,
            Title TEXT,
            Description TEXT,
            is_fetched BOOLEAN DEFAULT FALSE,   -- after migration `first_updating_url`
            icon_url TEXT,                      -- after migration `first_updating_url`
            BlockId INTEGER,                    -- after migration `second_block_id`
            Category TEXT,                      -- after migration `second_block_id`
            Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (BlockId) REFERENCES Blocks (BlockId),
            FOREIGN KEY (Category) REFERENCES Categories (Category)
        );
        """)
        
        # Create the new Apps table with the new columns
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS Apps (
            AppId TEXT PRIMARY KEY,
            ExeFileName TEXT NOT NULL,
            ExeDirName TEXT NOT NULL,
            IsBrowser BOOLEAN NOT NULL,       -- after migration `second_block_id`
            CompanyName TEXT,
            ProductName TEXT,
            FileVersion TEXT,
            ProductVersion TEXT,
            FileDescription TEXT,
            InternalName TEXT,
            LegalCopyright TEXT,
            LegalTrademarks TEXT,
            OriginalFilename TEXT,
            Comments TEXT,
            PrivateBuild TEXT,
            SpecialBuild TEXT,
            BlockId INTEGER,                    -- after migration `second_block_id`
            Category TEXT,                      -- after migration `second_block_id`
            Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (BlockId) REFERENCES Blocks (BlockId),
            FOREIGN KEY (Category) REFERENCES Categories (Category)
        );
        """)
        
        # Copy the data from the old table to the new one
        cursor.execute("""--sql
        INSERT INTO BaseURLs (baseURL, Title, Description, Timestamp, is_fetched, icon_url)
        SELECT baseURL, Title, Description, Timestamp, is_fetched, icon_url FROM BaseURLs_old;
        """)
        
        cursor.execute("""--sql
        INSERT INTO Apps (
            AppId, ExeFileName, ExeDirName, IsBrowser, CompanyName, ProductName,
            FileVersion, ProductVersion, FileDescription, InternalName, LegalCopyright, 
            LegalTrademarks, OriginalFilename, Comments, PrivateBuild, SpecialBuild,
            Timestamp
        )
        SELECT AppId, ExeFileName, ExeDirName, IsChromiumBased, CompanyName, ProductName,
            FileVersion, ProductVersion, FileDescription, InternalName, LegalCopyright, 
            LegalTrademarks, OriginalFilename, Comments, PrivateBuild, SpecialBuild,
            Timestamp FROM Apps_old;
        """)
        
        # Drop the old table
        cursor.execute("DROP TABLE BaseURLs_old;")
        cursor.execute("DROP TABLE Apps_old;")
        
        cursor.execute("PRAGMA foreign_keys=on;")  # Re-enable foreign key enforcement
        
        # Commit the changes to the database
        conn.commit()

        print("Migration completed successfully.")
        return True
    except sqlite3.Error as e:
        print(f"Migration failed: {e}")
        conn.rollback()  # Rollback any changes in case of an error
        return False
