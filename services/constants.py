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
INTERVAL: int = 2
SAVE_EVERY: int = 60*5
ICON_DIR: Path = modulepath.joinpath("instance", "icons")

if not ICON_DIR.exists(): ICON_DIR.mkdir(parents=True, exist_ok=True)
ICON_LISTDIR = ICON_DIR.listdir()

assert modulepath.joinpath("instance", "search_bar_address.json").exists(), "Please copy paste this file from assets."
with open (modulepath.joinpath("instance", "search_bar_address.json"), "r") as f:
    SEARCH_BAR_ADDRESS = json.load(f)