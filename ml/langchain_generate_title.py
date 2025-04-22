from pydantic.v1 import BaseModel, Field
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains.llm import LLMChain
import os

model = ChatGroq(
    api_key=os.environ["GROQ_API_KEY"],
    model="llama-3.3-70b-versatile"
)

class TitleResponse(BaseModel):
    title: str = Field(..., description="A short, concise and catchy title for the user query")


# Initialize the LLMChain with the model and the prompt template
structured_llm = model.with_structured_output(TitleResponse, method="json_mode")

# Function to generate the title using LangChain
async def generate_title(user_query: str) -> str:
    # Get the title from the model
    response: TitleResponse = await structured_llm.ainvoke(
        f"""
        Generate a short, concise and catchy title for the following query:
        {user_query}

        Respond in a JSON format like this:
        {{
            "title": str
        }}
        """
    )
    return response.title
