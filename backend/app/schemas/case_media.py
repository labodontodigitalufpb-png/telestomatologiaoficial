from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CaseMediaBase(BaseModel):
    media_type: str
    file_path: str
    filename: Optional[str] = None
    original_filename: Optional[str] = None
    caption: Optional[str] = None


class CaseMediaCreate(CaseMediaBase):
    case_id: int


class CaseMediaOut(CaseMediaBase):
    id: int
    case_id: int
    created_at: datetime

    class Config:
        from_attributes = True
