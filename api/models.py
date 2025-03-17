from typing import Optional, Dict
from pydantic import BaseModel
from datetime import datetime, time


#####################################################################################
#                                   App                                             #
#####################################################################################

class AppResponse(BaseModel):
    id: str # @base64
    AppId: str
    ExeFileName: str
    ExeDirName: str
    IsBrowser: bool
    CompanyName: Optional[str] = None
    ProductName: Optional[str] = None
    FileVersion: Optional[str] = None
    ProductVersion: Optional[str] = None
    FileDescription: Optional[str] = None
    InternalName: Optional[str] = None
    LegalCopyright: Optional[str] = None
    LegalTrademarks: Optional[str] = None
    OriginalFilename: Optional[str] = None
    Comments: Optional[str] = None
    PrivateBuild: Optional[str] = None
    SpecialBuild: Optional[str] = None
    BlockId: Optional[int] = None
    Category: Optional[str] = None
    Timestamp: datetime
    ICON: str

class GetAppResponse(BaseModel):
    app: AppResponse
    total_uses_this_week: float
    total_uses_this_week_increase_percentage: float
    avg_uses_this_week: float
    avg_uses_this_week_increase_percentage: float

    Mon: float
    Tue: float
    Wed: float
    Thu: float
    Fri: float
    Sat: float
    Sun: float

#####################################################################################
#                                   BaseUrl                                         #
#####################################################################################

class BaseUrlResponse(BaseModel):
    id: str # @base64
    baseURL: str
    Title: Optional[str] = None
    Description: Optional[str] = None
    is_fetched: bool
    icon_url: Optional[str] = None
    BlockId: Optional[int] = None
    Category: Optional[str] = None
    Timestamp: datetime


#####################################################################################
#                              ActivityEntry                                        #
#####################################################################################

class ActivityEntryResponse(BaseModel):
    EntryId: int
    AppId: str
    Title: str
    URL: Optional[str] = None
    IsActive: bool
    IdleDuration: float
    Duration: float
    EndTime: datetime
    URL_ICON: Optional[str] = None

class GetActivity(BaseModel):
    app: AppResponse
    activity: ActivityEntryResponse

#####################################################################################
#                               _TODO                                               #
#####################################################################################


class TodoBase(BaseModel):
    title: str
    duedate: Optional[datetime] = None
    parent_id: Optional[int] = None

class TodoCreate(TodoBase):
    ...

class Todo(TodoBase):
    todo_id: int
    completed: bool
    Timestamp: datetime

 
#####################################################################################
#                               Category                                            #
#####################################################################################

class CategoryBase(BaseModel):
    Category: str
    BlockId: Optional[int] = None

class CategoryCreate(CategoryBase):
    ...

class Category(CategoryBase):
    Timestamp: datetime
    itemCount: int = 0

# AppCategory
class AppCategory(BaseModel):
    AppId: str
    Category: Optional[str] = None