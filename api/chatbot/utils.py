from db.chatbot import GetMessages
from db.chatbot.helpers import format_timestamp

def formate_user(message: GetMessages) -> dict:
    return {
                "id": str(message['MessageId']),
                "createdAt": format_timestamp(message['Timestamp']),
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": message['content']
                    }
                ],
                "attachments": [],
                "metadata": {
                    "custom": {}
                }
            }

def formate_assistant(message: GetMessages) -> dict:
    return {
                "id": str(message['MessageId']),
                "role": "assistant",
                "status": {
                    "type": "complete",
                    "reason": "stop"
                },
                "content": [
                    {
                        "type": "text",
                        "text": message['content']
                    }
                ],
                "metadata": {
                    "unstable_annotations": [],
                    "unstable_data": [],
                    "steps": [
                        {
                            "usage": {
                                "promptTokens": None,
                                "completionTokens": None
                            }
                        },
                        {
                            "usage": {
                                "promptTokens": None,
                                "completionTokens": None
                            }
                        }
                    ],
                    "custom": {}
                },
                "createdAt": format_timestamp(message['Timestamp'])
            }
