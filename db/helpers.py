# Utility functions (e.g., Path)

import os
import shutil
import logging
from .constants import loglevel

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
        if self.is_dir():
            os.rmdir(self)
        else:
            os.remove(self)

modulepath = Path(os.path.dirname(__file__))

if not modulepath.joinpath('instance').exists(): 
    modulepath.joinpath('instance').mkdir()
    
# Set up logging
logging.basicConfig(
    level=loglevel,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(modulepath.joinpath("instance", "database.log")),
        logging.StreamHandler()
    ],
    encoding='utf-8'  # This specifies UTF-8 encoding
)
logger = logging.getLogger("Efficia")