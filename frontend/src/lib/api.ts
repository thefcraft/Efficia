import axios from 'axios';

// Set config defaults when creating the instance
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000'
}); 


// #####################################################################################
// #                                   App                                             #
// #####################################################################################

export interface AppResponse{
    id: string // @base64
    AppId: string
    ExeFileName: string
    ExeDirName: string
    IsBrowser: boolean
    CompanyName: string | null
    ProductName: string | null
    FileVersion: string | null
    ProductVersion: string | null
    FileDescription: string | null
    InternalName: string | null
    LegalCopyright: string | null
    LegalTrademarks: string | null
    OriginalFilename: string | null
    Comments: string | null
    PrivateBuild: string | null
    SpecialBuild: string | null
    BlockId: string | null
    Category: string | null
    Timestamp: string // datetime
    ICON: string
}

export interface GetAppResponse{
    app: AppResponse
    total_uses_this_week: number
    total_uses_this_week_increase_percentage: number
    avg_uses_this_week: number
    avg_uses_this_week_increase_percentage: number

    Mon: number
    Tue: number
    Wed: number
    Thu: number
    Fri: number
    Sat: number
    Sun: number
}

// #####################################################################################
// #                                   BaseUrl                                         #
// #####################################################################################

export interface BaseUrlResponse{
    id: string // @base64
    baseURL: string
    Title: string | null
    Description: string | null
    is_fetched: boolean
    icon_url: string | null
    BlockId: number | null
    Category: string | null
    Timestamp: string
}

// #####################################################################################
// #                              ActivityEntry                                        #
// #####################################################################################

export interface ActivityEntryResponse{
    EntryId: number
    AppId: string
    Title: string
    URL: string | null
    IsActive: boolean
    IdleDuration: number
    Duration: number
    EndTime: string //datetime
    // URL_ICON: string | null
}

export interface GetActivity{
    app: AppResponse
    activity: ActivityEntryResponse
}


// #####################################################################################
// #                               _TODO                                               #
// #####################################################################################

export interface Todo{
    todo_id: number
    title: string
    duedate: string | null
    parent_id: number | null    
    completed: boolean
    Timestamp: string
}
export type GetTodo = [Todo, Todo[]][];



// #####################################################################################
// #                               Category                                            #
// #####################################################################################

export interface Category{
    Category: string
    BlockId: number | null
    Timestamp: string
    itemCount: number
}

export default api;

