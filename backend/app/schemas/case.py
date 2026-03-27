from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.case import CaseStatus
from app.schemas.message import CaseMessageOut
from app.schemas.response import TeleconsultResponseOut
from app.schemas.followup import RegulatorFollowUpOut
from app.schemas.case_media import CaseMediaOut


class CaseCreate(BaseModel):
    patient_name: str
    patient_age: Optional[int] = None
    patient_sex: Optional[str] = None
    patient_phone: Optional[str] = None
    sus_card: Optional[str] = None

    health_unit: Optional[str] = None
    municipality: Optional[str] = None
    state: str

    chief_complaint: Optional[str] = None
    history_present_illness: Optional[str] = None
    medical_history: Optional[str] = None
    dental_history: Optional[str] = None
    medications: Optional[str] = None
    extraoral_exam: Optional[str] = None
    lesion_description: Optional[str] = None
    diagnostic_hypothesis: Optional[str] = None


class CaseOut(BaseModel):
    id: int
    professional_id: int
    assigned_teleconsultor_id: Optional[int] = None

    patient_name: str
    patient_age: Optional[int] = None
    patient_sex: Optional[str] = None
    patient_phone: Optional[str] = None
    sus_card: Optional[str] = None

    health_unit: Optional[str] = None
    municipality: Optional[str] = None
    state: str

    chief_complaint: Optional[str] = None
    history_present_illness: Optional[str] = None
    medical_history: Optional[str] = None
    dental_history: Optional[str] = None
    medications: Optional[str] = None
    extraoral_exam: Optional[str] = None
    lesion_description: Optional[str] = None
    diagnostic_hypothesis: Optional[str] = None

    status: CaseStatus
    is_suspected: bool
    sent_to_regulator: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CaseDetailOut(BaseModel):
    case: CaseOut
    response: Optional[TeleconsultResponseOut] = None
    media: List[CaseMediaOut] = Field(default_factory=list)
    messages: List[CaseMessageOut] = Field(default_factory=list)
    followups: List[RegulatorFollowUpOut] = Field(default_factory=list)