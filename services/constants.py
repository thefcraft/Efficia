from typing import NewType
from db import modulepath, Path
import json
#####################################################################################
#                                   Types                                           #
#####################################################################################

# Second = NewType('Second', int)
# Url = NewType('Url', str)
# Timestamp = NewType('Timestamp', str)

#####################################################################################
#                                   Constants                                       #
#####################################################################################
INACTIVITY_LIMIT: int = 60*2
INTERVAL: int = 5
# MIN_DURATION_TO_SAVE: int = 10
SAVE_EVERY: int = 60*5
ICON_DIR: Path = modulepath.joinpath('..', "instance", "icons")

if not ICON_DIR.exists(): ICON_DIR.mkdir(parents=True, exist_ok=True)
ICON_LISTDIR = ICON_DIR.listdir()

if not modulepath.joinpath('..', "instance", "search_bar_address.json").exists():
    with open (modulepath.joinpath("..", 'assets', "search_bar_address.json"), "r") as f:
        SEARCH_BAR_ADDRESS = json.load(f)
    with open (modulepath.joinpath('..', "instance", "search_bar_address.json"), "w") as f:
        json.dump(SEARCH_BAR_ADDRESS, f)
else:
    with open (modulepath.joinpath('..', "instance", "search_bar_address.json"), "r") as f:
        SEARCH_BAR_ADDRESS = json.load(f)
        
# assert MIN_DURATION_TO_SAVE < SAVE_EVERY, "HEY MIN_DURATION_TO_SAVE is not less than SAVE_EVERY"