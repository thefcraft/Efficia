from pydantic.v1 import BaseModel, Field
from langchain_groq import ChatGroq
from langchain.prompts import PromptTemplate
from langchain.chains.llm import LLMChain

model = ChatGroq(
    api_key="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",
    model="mixtral-8x7b-32768"
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
