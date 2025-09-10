from typing import Any
from pydantic import BaseModel

class APIResponseClass(BaseModel):
    success: bool
    message: str
    data: Any | None = None
    errorCode: str | None = None
