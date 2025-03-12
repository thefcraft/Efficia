from db import get_database
from db.migrate import second_block_id, first_updating_url

if __name__ == "__main__":
    database = get_database()
    first_updating_url.migrate_database(database.conn)
    second_block_id.migrate_database(database.conn)
    database.close(commit=False) # already commited in the migrate_database fn