
from fastapi import APIRouter, Request, HTTPException, status
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from openai import AsyncOpenAI
import os
import logging
from json import decoder
import uuid
from datetime import datetime
from typing import Optional

from db.chatbot import get_database
from db.chatbot.helpers import change_time_to_local
from .models import BranchPickerRequest
from .utils import formate_assistant, formate_user
from ml.langchain_generate_title import generate_title

database = get_database()

os.environ["GROQ_API_KEY"] = "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"

# TODO/BUG/ERROR: [-15] may give some error on the chats whose depth is more then 15 so i have to see the code again and coprate offset there
# DUE TO load more feature which i am thing to add in the chats when scroll above 

groq_client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=os.getenv("GROQ_API_KEY")
)

app = APIRouter(prefix='/chatbot')

async def stream_chat_response(messages: list, chat_id: str, new_chat: bool):
        """Stream chat response from Groq"""
        is_add_user_message_id: Optional[int] = None
    # try:
        if new_chat:
            # Convert the 'messages' format to what Groq expects (flatten content)
            formatted_messages = []
            for msg in messages:
                for content_item in msg['content']:
                    if content_item['type'] == "text":
                        formatted_messages.append({
                            "role": msg['role'],
                            "content": content_item['text']
                        })
        elif len(messages) == 1:
            headId = database.get_current_active_child_id(chat_id=chat_id, message_id=None)
            first_active_msg = database.get_chat_message(chat_id=chat_id, message_id=headId)
            if first_active_msg['content'] == messages[0]['content'][0]['text']: # regenerating first message
                formatted_messages = [
                    {
                        "role": "user" if message['message_by'] == 'USER' else "assistant",
                        "content": message['content']
                    }
                    for message in reversed(database.get_chats_above(chat_id, headId, max_result=15))
                ]
                is_add_user_message_id = headId
            else:
                formatted_messages = []
                headId = None
                msg = messages[-1]
                assert msg['role'] == 'user', "Last Msg Must be User"
                for content_item in msg['content']:
                    if content_item['type'] == "text":
                        formatted_messages.append({
                            "role": msg['role'],
                            "content": content_item['text']
                        })
        else:
            # regenerating the message which is len(messages) # NOTE: len(messages) is used very much
            chatinfo = database.get_chat_info(chat_id=chat_id)
            if chatinfo['active_depth'] + 1 == len(messages):
                headId = chatinfo['leaf_node_id']
                formatted_messages = [
                    {
                        "role": "user" if message['message_by'] == 'USER' else "assistant",
                        "content": message['content']
                    }
                    for message in reversed(database.get_chats_above(chat_id, headId, max_result=15))
                ]
                msg = messages[-1]
                assert msg['role'] == 'user', "Last Msg Must be User"
                for content_item in msg['content']:
                    if content_item['type'] == "text":
                        formatted_messages.append({
                            "role": msg['role'],
                            "content": content_item['text']
                        })
            else:
                leaf_node_msg = database.get_chat_message(chat_id=chat_id, message_id=chatinfo['leaf_node_id'])
                leaf_node_parent_msg = database.get_chat_message(chat_id=chat_id, message_id=leaf_node_msg['parent_id'])
                if leaf_node_parent_msg['content'] == messages[-1]['content'][0]['text']: # regenerating some message other then first message
                    all_messages = database.get_chats_down(chat_id=chat_id, message_id=None, max_result=len(messages))
                    formatted_messages = [
                        {
                            "role": "user" if message['message_by'] == 'USER' else "assistant",
                            "content": message['content']
                        }
                        for message in all_messages[-15:]
                    ]
                    is_add_user_message_id = all_messages[-1]['MessageId']
                else: # edit some message other then first message 
                    all_messages = database.get_chats_down(chat_id=chat_id, message_id=None, max_result=len(messages))
                    formatted_messages = [
                        {
                            "role": "user" if message['message_by'] == 'USER' else "assistant",
                            "content": message['content']
                        }
                        for message in all_messages[-15:]
                    ]
                    headId = all_messages[-2]['MessageId']
                    msg = messages[-1]
                    assert msg['role'] == 'user', "Last Msg Must be User"
                    for content_item in msg['content']:
                        if content_item['type'] == "text":
                            formatted_messages.append({
                                "role": msg['role'],
                                "content": content_item['text']
                            })
            
        response = await groq_client.chat.completions.create(
            model="qwen-2.5-32b",
            messages=formatted_messages,
            stream=True
        )
        
        # Yield each chunk of the response as it streams
        async def generate_stream():
            first = await response.__anext__()
            messageId = first.to_dict().get('id')
            aiResponse = ""
            if messageId:
                yield f'f:{{"messageId":"{messageId.replace("chatcmpl-", "msg-")}"}}\n'
            async for data in response:
                chunk = data.to_dict()
                choices = chunk.get("choices")
                if choices and len(choices) != 0:
                    delta = choices[0].get("delta")
                    if delta:
                        content = delta.get('content')
                        if content: 
                            aiResponse += content
                            d = content.replace("\\", "\\\\").replace("\n", "\\n").replace("\t", "\\t").replace("\"", "\\\"")
                            yield f'0: "{d}"\n'
            yield 'e:{"finishReason":"stop","usage":{"promptTokens":null,"completionTokens":null},"isContinued":false}\n'
            yield 'd:{"finishReason":"stop","usage":{"promptTokens":null,"completionTokens":null}}\n'
            if new_chat:
                title = await generate_title(messages[0]['content'][0]['text'])
                database.update_chat_title(chat_id=chat_id, title=title)
                if is_add_user_message_id == None: 
                    user_message = database.new_message(chat_id, content=formatted_messages[0]['content'], message_by='USER', commit=False)
                else:
                    user_message = is_add_user_message_id
                database.new_message(chat_id, content=aiResponse, message_by='AI', parent_message_id=user_message, commit=True)
            else:
                if is_add_user_message_id == None: 
                    user_message = database.new_message(chat_id, content=formatted_messages[-1]['content'], message_by='USER', parent_message_id=headId, commit=False)
                else:
                    user_message = is_add_user_message_id
                database.new_message(chat_id, content=aiResponse, message_by='AI', parent_message_id=user_message, commit=True)

        return generate_stream
    
    # except Exception as e:
    #     logger.error(f"Error while streaming chat response: {e}")
    #     return None

@app.post("/generate")
async def generate(req: Request):
    # TODO: use messages: list for mapping edit or regenerate etc...
    # Extract the message content from the request body
    request_data = await req.json()
    messages = request_data.get("messages", None)

    chat_id = req.headers.get('chatid')
    new_chat = chat_id is None
    if chat_id is None:
        db_chat_id = database.new_chat(title='New Chat', commit=False)
    
    try:

        if not messages:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Messages content is required")

        # Get the stream of chat response
        stream = await stream_chat_response(messages, db_chat_id if new_chat else chat_id, new_chat)

        if not stream:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Error getting response from Groq API")

    
        # Expose the 'chatid' header in CORS
        return StreamingResponse(stream(), media_type="text/plain", headers={
            'chatid': f"{db_chat_id}" if new_chat else chat_id,
            "Access-Control-Expose-Headers": "chatid"
        })
    
    except decoder.JSONDecodeError: 
        raise HTTPException(status_code=status.HTTP_406_NOT_ACCEPTABLE, detail="Request must be ")
    except HTTPException as e:
        raise e
    # except Exception as e:
    #     logger.error(f"Error in API request: {str(e)}")
    #     raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal Server Error")


@app.get("/chat/{chatId}")
async def get_chat(chatId: str):    
    if chatId == '':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="chatId was not given")
    try:
        chatinfo = database.get_chat_info(chat_id=chatId)
        db_messages = database.get_lazy_chat_messages(chat_id=chatId)
    except AssertionError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="chat Not found")
    messages = [
        {
            "message": formate_user(message) if message['message_by'] == "USER" else formate_assistant(message),
            "parentId": str(message['parent_id']) if message['parent_id'] else None
        }
        for message in db_messages
    ]
    return {
            "headId": str(chatinfo['leaf_node_id']),
            "messages": messages
        }

@app.post("/chat/{chatId}/branch_picker")
async def branch_picker(chatId: str, request: BranchPickerRequest):
    if chatId == '':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="chatId was not given")
    # print(chatId, request.message_pos, request.action) 1 1
    message_id = database.get_chats_down(chat_id=chatId, message_id=None, max_result=request.message_pos)[-1]['MessageId']
    if request.action == 'NEXT':
        head_id = database.next_message(chat_id=int(chatId), message_id=message_id, return_type='next_message_leaf_id', commit=True)
    else: # request.action == 'PREVIOUS'
        head_id = database.prev_message(chat_id=int(chatId), message_id=message_id, return_type='prev_message_leaf_id', commit=True)
    
    db_messages = database.get_lazy_chat_messages(chat_id=chatId)
    messages = [
        {
            "message": formate_user(message) if message['message_by'] == "USER" else formate_assistant(message),
            "parentId": str(message['parent_id']) if message['parent_id'] else None
        }
        for message in db_messages
    ]

    return {
        "chatId": chatId,
        "action": request.action,
        "headId": str(head_id),
        "messages": messages
    }

@app.get("/chats")
async def get_chats():
    chats = [
        {
            'ChatId': chat['ChatId'],
            'title': chat['title'],
            'Timestamp': change_time_to_local(chat['Timestamp'])
        }
        for chat in database.get_all_chats()
    ]
    return chats