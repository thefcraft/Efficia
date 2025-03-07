import win32api
from .utils import cached, try_default
from typing import Tuple
class FileInfo:
    def __init__(self, exe_full_path: str, exe_dir_name: str, exe_file_name: str, exe_lang_and_code_page: Tuple[str, str]):
        self.exe_full_path = exe_full_path
        self.exe_dir_name = exe_dir_name
        self.exe_file_name = exe_file_name
        self.exe_lang_and_code_page = exe_lang_and_code_page
        
    @property
    @cached
    def language(self) -> str:
        language, _ = self.exe_lang_and_code_page
        return language
    @property
    @cached
    def code_page(self) -> str:
        _, code_page = self.exe_lang_and_code_page
        return code_page    
        
    @property
    @cached
    @try_default(default_value=None)
    def CompanyName(self) -> str:
        return str(win32api.GetFileVersionInfo(
            self.exe_full_path, 
            f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\CompanyName'
        ))
    @property
    @cached
    @try_default(default_value=None)
    def ProductName(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path,
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\ProductName'
            ))
    @property
    @cached
    @try_default(default_value=None)
    def FileVersion(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path, 
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\FileVersion'
            ))
    @property
    @cached
    @try_default(default_value=None)
    def FileDescription(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path, 
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\FileDescription'
            ))
    @property
    @cached
    @try_default(default_value=None)
    def ProductVersion(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path, 
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\ProductVersion'
            ))
    @property
    @cached
    @try_default(default_value=None)
    def InternalName(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path, 
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\InternalName'
            ))   
    @property
    @cached
    @try_default(default_value=None)
    def LegalCopyright(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path, 
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\LegalCopyright'
            ))
    @property
    @cached
    @try_default(default_value=None)
    def LegalTrademarks(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path, 
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\LegalTrademarks'
            ))  
    @property
    @cached
    @try_default(default_value=None)
    def OriginalFilename(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path, 
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\OriginalFilename'
            )) 
    @property
    @cached
    @try_default(default_value=None)
    def Comments(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path, 
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\Comments'
            ))  
    @property
    @cached
    @try_default(default_value=None)
    def PrivateBuild(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path, 
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\PrivateBuild'
            ))
    @property
    @cached
    @try_default(default_value=None)
    def SpecialBuild(self) -> str: 
        return str(win32api.GetFileVersionInfo(
                self.exe_full_path, 
                f'\\StringFileInfo\\{self.language:04x}{self.code_page:04x}\\SpecialBuild'
            )) 
    
    def __repr__(self) -> str:
        return "FileInfo(\n\t" + ", \n\t".join(f"{k}={v}" for k, v in map(
            lambda i: (i, self.__getattribute__(i)), dir(self)
        ) if not k.startswith('__') and k not in ("json", 'exe_full_path', 'language', 'code_page')) + "\n)"
    @property
    def json(self):
        return {
            "CompanyName": self.CompanyName,
            "ProductName": self.ProductName,
            "FileVersion": self.FileVersion,
            "FileDescription": self.FileDescription,
            "ProductVersion": self.ProductVersion,
            "InternalName": self.InternalName,
            "LegalCopyright": self.LegalCopyright,
            "LegalTrademarks": self.LegalTrademarks,
            "OriginalFilename": self.OriginalFilename,
            "Comments": self.Comments,
            "PrivateBuild": self.PrivateBuild,
            "SpecialBuild": self.SpecialBuild,
            "ExeDirName": self.exe_dir_name,
            "ExeFileName": self.exe_file_name,
        }