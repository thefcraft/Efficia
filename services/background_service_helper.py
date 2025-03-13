import win32gui
import win32api
import win32con
import win32ui
import win32process
from pywinauto import Application, WindowSpecification
from PIL import Image
import psutil
import os
import ctypes
import base64
from datetime import datetime
from dataclasses import dataclass
import json
from typing import Optional, List, Tuple, Dict, Union, TypeVar, Generic, overload, Callable, NewType, Any, Literal

from db import DataBase, modulepath, logger
from db.models import IApp, IUrl, IActivityEntry
from .constants import ICON_LISTDIR, ICON_DIR, SEARCH_BAR_ADDRESS
from .fileinfo import FileInfo
from .utils import cached, try_default, debug

from ctypes import windll
user32 = windll.user32
user32.SetProcessDPIAware()
full_screen_rect = (0, 0, user32.GetSystemMetrics(0), user32.GetSystemMetrics(1))
logger.info(f"SCREEN_RECT: {full_screen_rect}")

class SleepError(Exception): ...

class App:
    def __init__(self, hwnd: int, pid: int):
        assert pid >= 0, "pid must be positive integer"
        
        self.hwnd: int = hwnd
        self.pid: int = pid
        
        self.last_url: Optional[str] = None
        
        self.process = psutil.Process(pid)
        self.exe_file_name = self.process.name()
        self.fileinfo = FileInfo(
            exe_full_path=self.exe_full_path,
            exe_dir_name=self.exe_dir_name,
            exe_file_name=self.exe_dir_name,
            exe_lang_and_code_page=self.exe_lang_and_code_page
        ) if self.exe_lang_and_code_page else None
        
            
    @property
    @cached
    def cpu_percent(self: "App") -> float: return self.process.cpu_percent(interval=0.1)
    
    @property
    @cached
    def memory_info(self: "App") -> "psutil.pmem": return self.process.memory_info()
    
    @property
    @cached
    @try_default(default_value=None)
    def exe_lang_and_code_page(self: "App") -> Tuple[str, str]: 
        ms: List[Tuple[str, str]] = win32api.GetFileVersionInfo(self.exe_full_path, '\\VarFileInfo\\Translation')
        language, code_page = ms[0]
        return language, code_page
    
    @property
    @try_default(default_value=None)
    def isfullscreen(self) -> bool:
        return win32gui.GetWindowRect(self.hwnd) == full_screen_rect
        
    @classmethod
    def from_active_window(cls) -> "App":
        hwnd = win32gui.GetForegroundWindow()
        _, pid = win32process.GetWindowThreadProcessId(hwnd)
        if pid < 0: raise SleepError("Computer May be in Sleep...")
        return cls(hwnd, pid)
    
    @property
    @cached
    def exe_full_path(self) -> str:
        hprocess = win32api.OpenProcess(win32con.PROCESS_QUERY_INFORMATION | win32con.PROCESS_VM_READ, False, self.pid)
        return win32process.GetModuleFileNameEx(hprocess, 0)
    
    @property
    @cached
    def exe_dir_name(self) -> str:
        file_path = self.exe_full_path
        dirname = os.path.dirname(file_path)
        return os.path.basename(dirname)
    
    @property
    def is_browser(self) -> bool:
        # TODO: update names of browser like for different versions...
        # TODO: also add other versions of browser too with updated serarch bar_address
        if not self: return False
        return self.app_id in (
            "Microsoft Corporation | Microsoft Edge", 
            "Brave Software, Inc. | Brave Browser", 
            "Google LLC | Google Chrome",
            "Mozilla Corporation | Nightly"
        )
    
    @property
    @cached
    def entry_id(self) -> str:
        if self.url:
            return f" {self.title} | {self.url}"
        return f"{self.title}"
    
    def get_entry_id(self, url: Optional[str] = None) -> str:
        if url:
            return f" {self.title} | {url}"
        return f"{self.title}"
    
    @property
    @cached
    def app_id(self) -> str:
        if not self.fileinfo or not self.fileinfo.CompanyName or self.fileinfo.CompanyName == 'None' or not self.fileinfo.ProductName or self.fileinfo.ProductName == 'None':
            return f"{self.exe_dir_name} | {self.exe_file_name}"
        return f"{self.fileinfo.CompanyName} | {self.fileinfo.ProductName}"
    
    @property
    @cached
    def title(self) -> str: 
        if self.is_browser:
            result = win32gui.GetWindowText(self.hwnd)
            if not result:
                current_app = Application(backend='uia').connect(handle=self.hwnd)
                dlg = current_app.windows()[0]
                result = dlg.window_text()
                if not result:
                    dlg = current_app.window(handle=self.hwnd) 
                    result = dlg.window_text()
            return result
        return win32gui.GetWindowText(self.hwnd)
    
    @property
    @cached
    @try_default(default_value=None)
    def url(self) -> Optional[str]:
        if not self.is_browser: 
            self.last_url = None
            return None
        
        address_list = SEARCH_BAR_ADDRESS[self.app_id]
        for address in address_list:
            url = self.get_ui_element_value_by_address_and_title(address=address)
            if url: break
        if not url:
            for address in address_list:
                url = self.get_ui_element_value_by_address_and_title(address=address, take_first_windos=True)
                if url: break
            if not url:
                logger.warning(f"Could not find URL for {self.app_id}")
        
        if not url: return None
        if url.find(' ') != -1: return None # space must not be in the url
        # if url.find('.') == -1: return None # . or must be present in the url like .com etc; Note: this is not handled for localhost
        # url, title = result
        self.last_url = url
        return url
    
    @cached
    @try_default(default_value=False)
    def save_icon(self) -> bool:
        # Check if icon already exists
        icon_file_name = f"{base64.urlsafe_b64encode(self.app_id.encode('utf-8')).decode('utf-8')}.png"
        if icon_file_name in ICON_LISTDIR: return True
        icon_path = os.path.join(ICON_DIR, icon_file_name)
            
        # Extract the icon
        ico_x = win32api.GetSystemMetrics(win32con.SM_CXICON)
        ico_y = win32api.GetSystemMetrics(win32con.SM_CYICON)
        
        large, small = win32gui.ExtractIconEx(self.exe_full_path, 0)
        
        if not large: 
            logger.warning(f"Unable to extract icon for {self.exe_file_name}")
            return False
        
        if small:
            win32gui.DestroyIcon(small[0])
            
        hdc = win32ui.CreateDCFromHandle(win32gui.GetDC(0))
        hbmp = win32ui.CreateBitmap()
        hbmp.CreateCompatibleBitmap(hdc, ico_x, ico_y)
        hdc_compatible = hdc.CreateCompatibleDC()
        hdc_compatible.SelectObject(hbmp)
        hdc_compatible.DrawIcon((0, 0), large[0])

        bmpstr = hbmp.GetBitmapBits(True)
        icon = Image.frombuffer( 
            'RGBA',
            (ico_x, ico_y),
            bmpstr, 'raw', 'BGRA', 0, 1
        )
        win32gui.DestroyIcon(large[0])
        
        icon.save(icon_path, format="PNG")
        icon.close()
        ICON_LISTDIR.append(icon_file_name)
        return True
    
    def __repr__(self) -> str:
        if self.url:
            return f"<{self.app_id}: {self.title} | {self.url}>"
        else:
            return f"<{self.app_id}: {self.title}>"
    def __bool__(self) -> bool:
        return self.exe_file_name is not None
    def __eq__(self, value: Union["App", None, Any]) -> bool:
        if not isinstance(value, App):
            if value is None: return not self
            return False
        if not value: return not self
        if not self: return not value
        return self.app_id == value.app_id and (self.entry_id == value.entry_id or (self.title == value.title and value.url == None))

    @debug
    @try_default(default_value=None)
    def get_window_gui_debug_info(self, file_name = modulepath.joinpath('..', 'instance', "debug_info.json")) -> dict:
        """
        Retrieves a complete tree of UI elements from the window and returns a dictionary
        snapshot. Each element is assigned a unique 'address' that is simply a list of indices
        representing its position in the UI tree. For example, an element with address [0, 2, 1]
        is the first child of the root, the third child of that element, and the second child
        of the latter.

        If file_name is provided, the snapshot is saved to that JSON file.
        """
        # Connect to the window via its handle
        current_app = Application(backend='uia').connect(handle=self.hwnd)
        # dlg = current_app.top_window()
        dlg = current_app.window(handle=self.hwnd)

        def traverse(element, address):
            """
            Recursively builds a dictionary with key properties and children.
            The 'address' parameter is a list of indices uniquely identifying the element.
            """
            info = {
                "control_type": element.element_info.control_type,
                "name": element.element_info.name,
                "auto_id": element.element_info.automation_id,
                "class_name": element.element_info.class_name,
                "value": element.get_value() if element.element_info.control_type == "Edit" else None,
                "address": address,
                "children": [
                    traverse(child, address=[*address, [child.element_info.class_name, child.element_info.control_type, child.element_info.name, idx]]) for idx, child in enumerate(element.children())
                ]
            }
            return info

        debug_info = {
            "window_title": dlg.window_text(),
            "elements": traverse(dlg, [])
        }
        
        if file_name:
            with open(file_name, 'w') as f:
                json.dump(debug_info, f, indent=4)
            
        return debug_info
    # TODO: also add auto_id in the address...
    # @debug
    def get_ui_element_value_by_address_and_title(self, address: List[Tuple[str, str, str, int]], take_first_windos: bool = False) -> Optional[str]:
        """
        Given an address (a list of indices) corresponding to a UI element in the snapshot,
        this function traverses the current UI tree to locate and return that elements.get_value()
        """
        # Connect to the window via its handle
        current_app = Application(backend='uia').connect(handle=self.hwnd)
        
        # TODO THIS MAY HAVE ERROR ON POPUP etc
        # TODO Sign In with google popup error
        if take_first_windos:
            dlg = current_app.windows()[0]
        else:
            dlg = current_app.window(handle=self.hwnd) 
        
        current = dlg
        for class_name, control_type, name, idx in address:
            children = current.children()
            
            flag_found = False
            if idx < len(children):
                current = children[idx]
                flag_found = True
            
            if class_name != "" and current.element_info.class_name != class_name:
                flag_found = False
                for child in children:
                    if child.element_info.class_name == class_name:
                        current = child
                        flag_found = True
                        break
            # class_name == ""
            if not flag_found and current.element_info.control_type != control_type and current.element_info.name != name:
                flag_found = False
                for child in children:
                    if child.element_info.control_type == control_type and current.element_info.name == name:
                        current = child
                        flag_found = True
                        break
                
            if not flag_found:
                return None
        
        return current.get_value()#, dlg.window_text()
    
    @staticmethod
    def get_idle_duration()->int:
        """Get the idle time in seconds."""
        class LASTINPUTINFO(ctypes.Structure):
            _fields_ = [("cbSize", ctypes.c_uint), ("dwTime", ctypes.c_ulong)]

        lii = LASTINPUTINFO()
        lii.cbSize = ctypes.sizeof(LASTINPUTINFO)
        ctypes.windll.user32.GetLastInputInfo(ctypes.byref(lii))
        idle_time = (ctypes.windll.kernel32.GetTickCount() - lii.dwTime) / 1000.0 # curr_time - last_input_time
        return idle_time    

    def get_iEntry(self, active: bool, idleDuration: float, entry_duration: float) -> IActivityEntry:
        return IActivityEntry(
            AppId= self.app_id,
            Title= self.title,
            URL= self.url,
            IsActive= active,
            IdleDuration= idleDuration,
            Duration= entry_duration
        )
      
    def get_iApp(self) -> IApp:
        return IApp(
            AppId= self.app_id,
            ExeFileName= self.exe_file_name,
            ExeDirName= self.exe_dir_name,
            IsBrowser= self.is_browser,
            CompanyName= self.fileinfo.CompanyName if self.fileinfo else None,
            ProductName= self.fileinfo.ProductName if self.fileinfo else None,
            FileVersion= self.fileinfo.FileVersion if self.fileinfo else None,
            ProductVersion= self.fileinfo.ProductVersion if self.fileinfo else None,
            FileDescription= self.fileinfo.FileDescription if self.fileinfo else None,
            InternalName= self.fileinfo.InternalName if self.fileinfo else None,
            LegalCopyright= self.fileinfo.LegalCopyright if self.fileinfo else None,
            LegalTrademarks= self.fileinfo.LegalTrademarks if self.fileinfo else None,
            OriginalFilename= self.fileinfo.OriginalFilename if self.fileinfo else None,
            Comments= self.fileinfo.Comments if self.fileinfo else None,
            PrivateBuild= self.fileinfo.PrivateBuild if self.fileinfo else None,
            SpecialBuild= self.fileinfo.SpecialBuild if self.fileinfo else None,
            BlockId=None,
            Category=None
        )