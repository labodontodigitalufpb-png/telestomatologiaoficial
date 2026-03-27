from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.message import MessageType


class CaseMessageCreate(BaseModel):
    content: str
    message_type: MessageType = MessageType.TEXT


class CaseMessageOut(BaseModel):
    id: int
    case_id: int
    sender_id: int
    message_type: MessageType
    content: Optional[str] = None
    file_path: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True