from ..helpers import Path, modulepath, logger
from datetime import datetime
import pytz

def format_timestamp(timestamp: str) -> str:
    # Parse the original timestamp string into a datetime object
    dt = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
    
    # Format the datetime object into the desired string with milliseconds and 'Z'
    formatted_timestamp = dt.strftime('%Y-%m-%dT%H:%M:%S') + '.000Z'
    
    return formatted_timestamp

def change_time_to_local(timestamp: str) -> str:
    dt = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
    utc_zone = pytz.utc
    dt_utc = utc_zone.localize(dt)
    # Convert the datetime to IST (Indian Standard Time)
    ist_zone = pytz.timezone('Asia/Kolkata')
    dt_ist = dt_utc.astimezone(ist_zone)
    return dt_ist.strftime('%Y-%m-%d %H:%M:%S')