import axios from 'axios';
import { API_BASE_URL } from '../constants';

// Set config defaults when creating the instance
const api = axios.create({
    baseURL: `${API_BASE_URL}/chatbot`
}); 

// #####################################################################################
// #                                 Chats                                             #
// #####################################################################################

export interface ChatResponse{
    ChatId: number,
    title: string,
    Timestamp: string
}

export default api;