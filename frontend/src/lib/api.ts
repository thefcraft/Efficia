import axios from 'axios';
import { API_BASE_URL } from './constants';

// Set config defaults when creating the instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
}); 


// #####################################################################################
// #                                   App                                             #
// #####################################################################################

export interface AppResponse{
    AppId: string
    ExeFileName: string
    ExeDirName: string
    IsBrowser: boolean
    CompanyName?: string
    ProductName?: string
    FileVersion?: string
    ProductVersion?: string
    FileDescription?: string
    InternalName?: string
    LegalCopyright?: string
    LegalTrademarks?: string
    OriginalFilename?: string
    Comments?: string
    PrivateBuild?: string
    SpecialBuild?: string
    BlockId?: number
    Category?: string
    Timestamp: string
    ICON: string
  }

export interface GetAppResponse{
    app: AppResponse;
    total_uses_this_week: number;
    total_uses_this_week_increase_percentage: number;
    avg_uses_this_week: number;
    avg_uses_this_week_increase_percentage: number;
    Mon: number;
    Tue: number;
    Wed: number;
    Thu: number;
    Fri: number;
    Sat: number;
    Sun: number;
    hour_0: number; hour_1: number; hour_2: number; hour_3: number; hour_4: number; hour_5: number;
    hour_6: number; hour_7: number; hour_8: number; hour_9: number; hour_10: number; hour_11: number;
    hour_12: number; hour_13: number; hour_14: number; hour_15: number; hour_16: number; hour_17: number;
    hour_18: number; hour_19: number; hour_20: number; hour_21: number; hour_22: number; hour_23: number;
}

// #####################################################################################
// #                                   BaseUrl                                         #
// #####################################################################################

export interface BaseUrlResponse{
    baseURL: string
    Title?: string
    Description?: string
    is_fetched: boolean
    icon_url?: string
    BlockId?: number
    Category?: string
    Timestamp: string
    visitCount?: number
    lastVisited?: string
}

export interface GetBaseUrlResponse{
    baseurl: BaseUrlResponse;
    total_uses_this_week: number;
    total_uses_this_week_increase_percentage: number;
    avg_uses_this_week: number;
    avg_uses_this_week_increase_percentage: number;
    Mon: number; Tue: number; Wed: number; Thu: number; Fri: number; Sat: number; Sun: number;
    hour_0: number; hour_1: number; hour_2: number; hour_3: number; hour_4: number; hour_5: number;
    hour_6: number; hour_7: number; hour_8: number; hour_9: number; hour_10: number; hour_11: number;
    hour_12: number; hour_13: number; hour_14: number; hour_15: number; hour_16: number; hour_17: number;
    hour_18: number; hour_19: number; hour_20: number; hour_21: number; hour_22: number; hour_23: number;
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
    URL_ICON?: string
}

export interface GetActivity{
    app: AppResponse
    activity: ActivityEntryResponse
}


// #####################################################################################
// #                               _TODO                                               #
// #####################################################################################

export interface TodoBackend {
    todo_id: number
    title: string
    duedate?: string
    parent_id?: number
    completed: boolean
    Timestamp: string
}
export type GetTodo = [TodoBackend, TodoBackend[]][];


// #####################################################################################
// #                               Category                                            #
// #####################################################################################

export interface Category {
    Category: string
    BlockId?: number
    Timestamp: string
    itemCount: number
}


export interface SimpleSuccessResponse {
    success: boolean;
    message?: string;
}

export interface DeleteResponse {
    success: boolean;
    id: number | string;
    message: string;
}

export interface TodoToggleResponse {
    todo_id: number;
    completed: boolean;
}

export default api;

