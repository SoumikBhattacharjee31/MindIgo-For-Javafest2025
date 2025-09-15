from datetime import datetime
from langgraph.graph import MessagesState
from typing import Literal, List, Optional
from pydantic import BaseModel

class State(MessagesState):
    user_id: int
    user_name: str
    session_id: str
    