from typing import Optional, Literal, Union
from pydantic import BaseModel

# Define a model for the request body
class BranchPickerRequest(BaseModel):
    action: Literal["NEXT", "PREVIOUS"]
    message_pos: int
    

class DeleteResponse(BaseModel):
    success: bool
    id: Union[int, str]
    message: str
