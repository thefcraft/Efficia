# from db import get_database, logger
from db.models import IUrl, IApp, IActivityEntry, IBaseUrl
from db.helpers import logger
import sqlite3
from typing import List
import json
import os
import time
from typing import Optional, List, Literal, Dict
from pydantic.v1 import BaseModel, Field
from langchain_groq import ChatGroq

# database = get_database()


model = ChatGroq(
    api_key=os.environ["GROQ_API_KEY"],
    model="llama-3.3-70b-versatile"
)

def filter_app_info(app_info: Dict, removed_keys: List[str]) -> dict:
    return {k: v for k, v in app_info.items() if k not in removed_keys}

def get_current_category(cursor: sqlite3.Cursor) -> List[str]:
    cursor.execute("SELECT * FROM Categories")
    category_records = cursor.fetchall()
    return [category_record['Category'] for category_record in category_records]

def add_new_category(cursor: sqlite3.Cursor, conn: sqlite3.Connection, category: str, commit: bool = True):
    cursor.execute("""--sql
        INSERT OR IGNORE INTO Categories (Category, BlockId) 
        VALUES (?, NULL)
        """, (category, )
    )

    if commit: conn.commit()

def classify_new_app(cursor: sqlite3.Cursor, conn: sqlite3.Connection, iApp: IApp, commit: bool = True) -> str:
    cursor.execute("""--sql
        SELECT Category FROM Apps WHERE AppId = ?
        """, (iApp['AppId'], )
    )
    exists = cursor.fetchone()
    if exists and exists['Category']:
        return exists['Category']

    categories: List[str] = get_current_category(cursor=cursor)
    class Category(BaseModel):
        """Category Model to classify the App."""
        Category: str = Field(description=f"Classify the App in the following list [{' | '.join(categories)}], you can create a new category also if no sutable category founds.")
    
    structured_llm = model.with_structured_output(Category, method="json_mode")
    app_info = {
            "AppId": iApp['AppId'],
            "ExeFileName": iApp['ExeFileName'],
            "ExeDirName": iApp['ExeDirName'],
            "IsBrowser": iApp['IsBrowser'],
            "CompanyName": iApp['CompanyName'],
            "ProductName": iApp['ProductName'],
            "FileVersion": iApp['FileVersion'],
            "ProductVersion": iApp['ProductVersion'],
            "FileDescription": iApp['FileDescription'],
            "InternalName": iApp['InternalName'],
            "LegalCopyright": iApp['LegalCopyright'],
            "LegalTrademarks": iApp['LegalTrademarks'],
            "OriginalFilename": iApp['OriginalFilename'],
            "Comments": iApp['Comments'],
            "PrivateBuild": iApp['PrivateBuild'],
            "SpecialBuild": iApp['SpecialBuild']
    }
    response: Category = structured_llm.invoke(
        f"""
        Based on the following metadata extracted from an app, classify it into one of the following categories: [{' | '.join(categories)}]. 
        If none of the existing categories fit, feel free to create a new one. do not provide any brief explanation of why you chose this category. Here's the app's metadata:

        {app_info}

        For example, if the app is a project management tool, you might categorize it as "Productivity" or create a new subcategory if necessary. If the app is related to entertainment, consider categories like "Games" or "Media."

        If you cannot find a suitable category, suggest one and do not explain anything just respond in the given json formate.
        {{
            Category: str
        }}
        """,
    )
    logger.debug(f"App Classification GROQ: {response}")
    if response.Category not in categories:
        add_new_category(cursor, conn, response.Category, commit=False)
    
    cursor.execute("""--sql
        UPDATE Apps 
        SET Category = ?
        WHERE AppId = ?
        """, (response.Category, iApp['AppId'])
    )
    if commit: conn.commit()
    return response.Category

def clssify_new_url(cursor: sqlite3.Cursor, conn: sqlite3.Connection, baseURL: str, Title: Optional[str] = None, Description: Optional[str] = None, commit: bool = True) -> str:
    cursor.execute("""--sql
        SELECT Category FROM baseUrls WHERE baseURL = ?
        """, (baseURL, )
    )
    exists = cursor.fetchone()
    if exists and exists['Category']:
        return exists['Category']

    categories: List[str] = get_current_category(cursor=cursor)
    class Category(BaseModel):
        """Category Model to classify the URL."""
        Category: str = Field(description=f"Classify the URL in one of the following categories [{' | '.join(categories)}]. If none fits, feel free to create a new category and explain why.")

    structured_llm = model.with_structured_output(Category, method="json_mode")
    
    response: Category = structured_llm.invoke(
        f"""
        Based on the following metadata extracted from a URL, classify it into one of the following categories: [{' | '.join(categories)}]. 
        If none of the existing categories fit, feel free to create a new one. do not provide any brief explanation of why you chose this category.
        Here's the URL metadata:

        URL: {baseURL}
        Title: {Title}
        Description: {Description}

        For example, if the URL is about a blog post on productivity, you might categorize it as "Productivity" or create a new subcategory if necessary. 
        If it's an article related to tech news, consider categories like "Technology" or "News."

        If you cannot find a suitable category, suggest one and do not explain anything just respond in the given json formate.
        {{
            Category: str
        }}
        """,
    )
    logger.debug(f"Url Classification GROQ: {response}")
    if response.Category not in categories:
        add_new_category(cursor, conn, response.Category, commit=False)
    
    cursor.execute("""--sql
        UPDATE baseUrls 
        SET Category = ?
        WHERE baseURL = ?
        """, (response.Category, baseURL)
    )
    if commit: conn.commit()
    return response.Category