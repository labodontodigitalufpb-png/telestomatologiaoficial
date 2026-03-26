from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from app.models.case import CaseStatus


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