from typing import Optional, Literal
from pydantic import BaseModel

# Define a model for the request body
class BranchPickerRequest(BaseModel):
    action: Literal["NEXT", "PREVIOUS"]
    message_pos: int