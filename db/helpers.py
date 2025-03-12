# Utility functions (e.g., Path)

import os
import shutil
import logging
from .constants import loglevel
from typing import TypedDict, Optional, List, Literal, Dict, NewType
import requests
from bs4 import BeautifulSoup

def encode_weekdays(weekdays: List[Literal['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']]):
    # mapping of weekdays to their binary positions (0 to 6)
    day_map: Dict[Literal['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], Literal[0, 1, 2, 3, 4, 5, 6]] = {
        'sunday': 0,
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6
    }
    
    # Initialize the binary number as 0
    binary_number = 0
    
    # Set the corresponding bits to 1 for the given weekdays
    for day in weekdays:
        if day in day_map:
            # Using bitwise OR to set the bit at the correct position to 1
            binary_number |= (1 << day_map[day])
    
    return binary_number

def get_baseurl(url: str) -> str:
    url = url.removeprefix('http://').removeprefix('https://')
    pos = min(
        filter(
            lambda index: index != -1,
            (
                url.find('/'), 
                url.find('?'), 
                url.find('#')
            )
        ),
        default=None
    )
    return url[:pos]

class UrlInfo(TypedDict):
    title: Optional[str]
    description: Optional[str]
    favicon_url: str # maybe invalid...
def get_url_info(url: str) -> UrlInfo:
    # TODO: use playwright's firefox.launch(headless=True) as some site render everything through js :-( ;for example chat.openai.com
    # as url is a baseurl we have to add back protocol...
    # Notice: it may raises error if url is not valid (url is any random str)
    if not url.startswith('https://') or url.startswith('http://'):
        url = f'https://{url}'
    try:
        response = requests.get(url)
    except requests.exceptions.SSLError:
        url = f"http://{url.removeprefix('https://')}"
        response = requests.get(url)

    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Extract icon from meta tags
    favicon_url = f"{url}/favicon.ico"
    icon_link = soup.find("link", rel="icon") # Look for <link rel="icon"> in the HTML
    if icon_link and icon_link.get("href"): 
        favicon_url = icon_link["href"]
        if not favicon_url.startswith('http://') and not favicon_url.startswith('https://'): 
            favicon_url = f"{url}/{favicon_url}" # If the favicon URL is relative, make it absolute
            
    # Extract description from meta tags
    description: Optional[str] = None
    description_tag = soup.find('meta', attrs={'name': 'description'})
    if description_tag and description_tag.get('content'):
        description = description_tag.get('content')
    else:
        # Try OpenGraph description as a fallback
        og_description = soup.find('meta', attrs={'property': 'og:description'})
        if og_description and og_description.get('content'):
            description = og_description.get('content')
        else:
            twitter_description = soup.find('meta', attrs={'property': 'twitter:description'})
            if twitter_description and twitter_description.get('content'):
                description = twitter_description.get('content')
    
    # Extract title from meta tags
    title: Optional[str] = None
    if soup.title:
        title = soup.title.string
    else:
        # Try OpenGraph description as a fallback
        og_title = soup.find('meta', attrs={'property': 'og:title'})
        if og_title and og_title.get('content'):
            title = og_title.get('content')
        else:
            twitter_title = soup.find('meta', attrs={'property': 'twitter:title'})
            if twitter_title and twitter_title.get('content'):
                title = twitter_title.get('content')
    
    return UrlInfo(
        title=title,
        description=description,
        favicon_url=favicon_url
    )

class Path(str):
    """
    A class that extends the functionality of a string to handle file system paths.
    """
    def joinpath(self, *others) -> "Path":
        """
        Joins the path with one or more paths using os.path.join.
        Args:
            *others (str): One or more paths to join with.
        Returns:
            Path: The joined path.
        """
        return Path(os.path.join(self, *others))
    def __matmul__(self, other) -> "Path":
        return self.joinpath(other)
    def __truediv__(self, other) -> "Path":
        return self.joinpath(other)
    
    def exists(self) -> bool:
        """
        Checks if the path exists.
        Returns:
            bool: True if the path exists, False otherwise.
        """
        return os.path.exists(self)
    
    def mkdir(self, parents=False, exist_ok=False):
        """
        Creates a directory at the path.
        Args:
            parents (bool): If True, create parent directories as needed.
            exist_ok (bool): If True, do not raise an error if the directory already exists.
        """
        if parents:
            os.makedirs(self, exist_ok=exist_ok)
        else:
            os.mkdir(self)
    
    def read_text(self) -> str:
        """
        Reads the content of the file as text.
        Returns:
            str: The content of the file.
        Raises:
            AssertionError: If the path is not a file.
        """
        assert self.is_file(), "Path Must Be a File"
        with open(self, 'r', encoding='utf-8') as file:
            return file.read()
    
    def write_text(self, data: str):
        """
        Writes text data to the file.
        Args:
            data (str): The text data to write.
        Raises:
            AssertionError: If the path is not a file.
        """
        assert self.is_file(), "Path Must Be a File"
        with open(self, 'w', encoding='utf-8') as file:
            file.write(data)
    
    def read_bytes(self) -> bytes:
        """
        Reads the content of the file as bytes.
        Returns:
            bytes: The content of the file.
        Raises:
            AssertionError: If the path is not a file.
        """
        assert self.is_file(), "Path Must Be a File"
        with open(self, 'rb') as file:
            return file.read()
    
    def write_bytes(self, data: bytes):
        """
        Writes byte data to the file.
        Args:
            data (bytes): The byte data to write.
        Raises:
            AssertionError: If the path is not a file.
        """
        assert self.is_file(), "Path Must Be a File"
        with open(self, 'wb') as file:
            file.write(data)
    
    def listdir(self) -> list:
        """
        Lists the contents of the directory.
        Returns:
            list: A list of names of the entries in the directory.
        """
        return os.listdir(self)
    
    def is_dir(self) -> bool:
        """
        Checks if the path is a directory.
        Returns:
            bool: True if the path is a directory, False otherwise.
        """
        return os.path.isdir(self)
    
    def is_file(self) -> bool:
        """
        Checks if the path is a file.
        Returns:
            bool: True if the path is a file, False otherwise.
        """
        return os.path.isfile(self)
    
    def get_size(self) -> int:
        """
        Gets the size of the file in bytes.
        Returns:
            int: The size of the file in bytes.
        """
        return os.path.getsize(self)
    
    def get_mtime(self) -> float:
        """
        Gets the last modification time of the file.
        Returns:
            float: The last modification time of the file.
        """
        return os.path.getmtime(self)
    
    def copy(self, dst: "Path"):
        """
        Copies the file to the destination path.
        Args:
            dst (Path): The destination path.
        """
        shutil.copy(self, dst)
    
    def move(self, dst: "Path"):
        """
        Moves the file to the destination path.
        Args:
            dst (Path): The destination path.
        """
        shutil.move(self, dst)
    
    def delete(self):
        """
        Deletes the file or directory.
        Raises:
            OSError: If the path is a directory and it is not empty.
        """
        if not self.exists(): return
        if self.is_dir():
            os.rmdir(self)
        else:
            os.remove(self)

modulepath = Path(os.path.dirname(__file__))

if not modulepath.joinpath('..', 'instance').exists(): 
    modulepath.joinpath('..', 'instance').mkdir()
    
# Set up logging
logging.basicConfig(
    level=loglevel,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(modulepath.joinpath('..', "instance", "database.log")),
        logging.StreamHandler()
    ],
    encoding='utf-8'  # This specifies UTF-8 encoding
)
logger = logging.getLogger("Efficia")