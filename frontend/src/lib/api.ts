import axios from 'axios';
import { API_BASE_URL } from './constants';

// Set config defaults when creating the instance
const api = axios.create({
    baseURL: API_BASE_URL
}); 


// #####################################################################################
// #                                   App                                             #
// #####################################################################################

export interface AppResponse{
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

    hour_0: number
    hour_1: number
    hour_2: number
    hour_3: number
    hour_4: number
    hour_5: number
    hour_6: number
    hour_7: number
    hour_8: number
    hour_9: number
    hour_10: number
    hour_11: number
    hour_12: number
    hour_13: number
    hour_14: number
    hour_15: number
    hour_16: number
    hour_17: number
    hour_18: number
    hour_19: number
    hour_20: number
    hour_21: number
    hour_22: number
    hour_23: number
}

// #####################################################################################
// #                                   BaseUrl                                         #
// #####################################################################################

export interface BaseUrlResponse{
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

