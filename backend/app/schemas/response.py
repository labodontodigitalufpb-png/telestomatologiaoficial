from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TeleconsultResponseCreate(BaseModel):
    clinical_description: Optional[str] = None
    justified_hypotheses: Optional[str] = None
    conduct: Optional[str] = None
    care_coordination: Optional[str] = None
    references: Optional[str] = None
    marked_as_suspected: bool = False


class TeleconsultResponseOut(BaseModel):
    id: int
    case_id: int
    teleconsultor_id: int
    clinical_description: Optional[str] = None
    justified_hypotheses: Optional[str] = None
    conduct: Optional[str] = None
    care_coordination: Optional[str] = None
    references: Optional[str] = None
    marked_as_suspected: bool
    created_at: datetime

    class Config:
        from_attributes = True