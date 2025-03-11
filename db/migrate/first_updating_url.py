import sqlite3

def undo_migration(conn: sqlite3.Connection) -> bool:
    cursor = conn.cursor()

    # Check if the migration has already been undone
    cursor.execute("PRAGMA table_info(BaseURLs)")
    columns = set(map(lambda x: x[1], cursor.fetchall()))
    if 'icon_url' not in columns:
        print("Migration has already been undone...")
        return True

    try:
        cursor.execute("PRAGMA foreign_keys=off;")  # Disable foreign key enforcement
        
        # Create the old BaseURLs table (same schema as before the migration)
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS BaseURLs_old (
            baseURL TEXT PRIMARY KEY,
            Title TEXT,
            Description TEXT,
            Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        # Copy the data from the new table to the old one
        cursor.execute("""--sql
        INSERT INTO BaseURLs_old (baseURL, Title, Description, Timestamp)
        SELECT baseURL, Title, Description, Timestamp FROM BaseURLs;
        """)

        # Drop the new BaseURLs table
        cursor.execute("DROP TABLE BaseURLs;")
        
        # Rename the old table back to BaseURLs
        cursor.execute("ALTER TABLE BaseURLs_old RENAME TO BaseURLs;")
        
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

    # Check if the migration has already been done
    cursor.execute("PRAGMA table_info(BaseURLs)")
    columns = set(map(lambda x: x[1], cursor.fetchall()))
    if 'icon_url' in columns:
        print("Already migrated...")
        return True

    try:
        cursor.execute("PRAGMA foreign_keys=off;")  # Disable foreign key enforcement
        
        # Rename the old table to keep the original data
        cursor.execute("ALTER TABLE BaseURLs RENAME TO BaseURLs_old;")
        
        # Create the new BaseURLs table with the new columns
        cursor.execute("""--sql
        CREATE TABLE IF NOT EXISTS BaseURLs (
            baseURL TEXT PRIMARY KEY,
            Title TEXT,
            Description TEXT,
            is_fetched BOOLEAN DEFAULT FALSE,
            icon_url TEXT,
            Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)
        
        # Copy the data from the old table to the new one
        cursor.execute("""--sql
        INSERT INTO BaseURLs (baseURL, Title, Description, Timestamp)
        SELECT baseURL, Title, Description, Timestamp FROM BaseURLs_old;
        """)
        
        # Drop the old table
        cursor.execute("DROP TABLE BaseURLs_old;")
        
        cursor.execute("PRAGMA foreign_keys=on;")  # Re-enable foreign key enforcement
        
        # Commit the changes to the database
        conn.commit()

        print("Migration completed successfully.")
        return True
    except sqlite3.Error as e:
        print(f"Migration failed: {e}")
        conn.rollback()  # Rollback any changes in case of an error
        return False

if __name__ == "__main__":
    import os 
    modulepath = os.path.join(os.path.dirname(__file__), '..')
    db_path = os.path.join(modulepath, 'instance', 'database.db')
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    
    try:
        # Run the migration
        print(migrate_database(conn))
        # print(undo_migration(conn))
    finally:
        conn.close()
