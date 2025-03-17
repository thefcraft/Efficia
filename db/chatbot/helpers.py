from ..helpers import Path, modulepath, logger
from datetime import datetime


def format_timestamp(timestamp: str) -> str:
    # Parse the original timestamp string into a datetime object
    dt = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
    
    # Format the datetime object into the desired string with milliseconds and 'Z'
    formatted_timestamp = dt.strftime('%Y-%m-%dT%H:%M:%S') + '.000Z'
    
    return formatted_timestamp