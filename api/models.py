from typing import Optional, Dict, List
from pydantic import BaseModel
from datetime import datetime, time



class GetActivitiesById(BaseModel):
    id: int | str

class BoolResponse(BaseModel):
    sucess: bool

class AddActivityResponse(BoolResponse):
    EntryId: int
    
class DateTime(BaseModel):
    datetime: str
    
#####################################################################################
#                                   App                                             #
#####################################################################################

class IApp(BaseModel):
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
class AppResponse(IApp):
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

    hour_0: float
    hour_1: float
    hour_2: float
    hour_3: float
    hour_4: float
    hour_5: float
    hour_6: float
    hour_7: float
    hour_8: float
    hour_9: float
    hour_10: float
    hour_11: float
    hour_12: float
    hour_13: float
    hour_14: float
    hour_15: float
    hour_16: float
    hour_17: float
    hour_18: float
    hour_19: float
    hour_20: float
    hour_21: float
    hour_22: float
    hour_23: float

#####################################################################################
#                                   BaseUrl                                         #
#####################################################################################

class BaseUrlResponse(BaseModel):
    baseURL: str
    Title: Optional[str] = None
    Description: Optional[str] = None
    is_fetched: bool
    icon_url: Optional[str] = None
    BlockId: Optional[int] = None
    Category: Optional[str] = None
    Timestamp: datetime
    visitCount: Optional[int] = None
    lastVisited: Optional[datetime] = None

class GetBaseUrlResponse(BaseModel):
    baseurl: BaseUrlResponse
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

    hour_0: float
    hour_1: float
    hour_2: float
    hour_3: float
    hour_4: float
    hour_5: float
    hour_6: float
    hour_7: float
    hour_8: float
    hour_9: float
    hour_10: float
    hour_11: float
    hour_12: float
    hour_13: float
    hour_14: float
    hour_15: float
    hour_16: float
    hour_17: float
    hour_18: float
    hour_19: float
    hour_20: float
    hour_21: float
    hour_22: float
    hour_23: float

#####################################################################################
#                              ActivityEntry                                        #
#####################################################################################

class IActivity(BaseModel):
    AppId: str
    Title: str
    URL: Optional[str] = None
    IsActive: bool
    IdleDuration: float
    Duration: float

class ActivityEntryResponse(IActivity):
    EntryId: int
    EndTime: datetime
    URL_ICON: Optional[str] = None

class GetActivity(BaseModel):
    app: AppResponse
    activity: ActivityEntryResponse

class CreateUpdateActivity(BaseModel):
    activity: IActivity
    EntryId: Optional[int] = None

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