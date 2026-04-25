from datetime import datetime
from typing import Optional, List

from pydantic import BaseModel, Field

from app.models.case import CaseStatus
from app.schemas.message import CaseMessageOut
from app.schemas.response import TeleconsultResponseOut
from app.schemas.followup import RegulatorFollowUpOut
from app.schemas.case_media import CaseMediaOut
from app.schemas.pathology_report import PathologyReportOut


class CaseCreate(BaseModel):
    patient_name: str
    patient_age: Optional[int] = None
    patient_sex: Optional[str] = None
    race_color: Optional[str] = None
    schooling: Optional[str] = None
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
    lymphadenopathy: Optional[str] = None
    lesion_description: Optional[str] = None
    diagnostic_hypothesis: Optional[str] = None

    specialist_status: Optional[List[str]] = Field(default_factory=list)
    specialties: Optional[List[str]] = Field(default_factory=list)
    objectives: Optional[List[str]] = Field(default_factory=list)
    skin_colors: Optional[List[str]] = Field(default_factory=list)
    anatomical_locations: Optional[List[str]] = Field(default_factory=list)
    fundamental_lesions: Optional[List[str]] = Field(default_factory=list)
    habits_and_addictions: Optional[List[str]] = Field(default_factory=list)
    lesion_sides: Optional[List[str]] = Field(default_factory=list)
    lesion_colors: Optional[List[str]] = Field(default_factory=list)
    lesion_insertions: Optional[List[str]] = Field(default_factory=list)
    lesion_sizes: Optional[List[str]] = Field(default_factory=list)
    lesion_surfaces: Optional[List[str]] = Field(default_factory=list)
    lesion_consistencies: Optional[List[str]] = Field(default_factory=list)
    lesion_symptomatologies: Optional[List[str]] = Field(default_factory=list)
    pre_existing_conditions: Optional[List[str]] = Field(default_factory=list)
    image_quality: Optional[List[str]] = Field(default_factory=list)
    care_units: Optional[List[str]] = Field(default_factory=list)


class CaseOut(BaseModel):
    id: int
    professional_id: int
    professional_name: Optional[str] = None
    assigned_teleconsultor_id: Optional[int] = None

    patient_name: str
    patient_age: Optional[int] = None
    patient_sex: Optional[str] = None
    race_color: Optional[str] = None
    schooling: Optional[str] = None
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
    lymphadenopathy: Optional[str] = None
    lesion_description: Optional[str] = None
    diagnostic_hypothesis: Optional[str] = None

    specialist_status: Optional[List[str]] = Field(default_factory=list)
    specialties: Optional[List[str]] = Field(default_factory=list)
    objectives: Optional[List[str]] = Field(default_factory=list)
    skin_colors: Optional[List[str]] = Field(default_factory=list)
    anatomical_locations: Optional[List[str]] = Field(default_factory=list)
    fundamental_lesions: Optional[List[str]] = Field(default_factory=list)
    habits_and_addictions: Optional[List[str]] = Field(default_factory=list)
    lesion_sides: Optional[List[str]] = Field(default_factory=list)
    lesion_colors: Optional[List[str]] = Field(default_factory=list)
    lesion_insertions: Optional[List[str]] = Field(default_factory=list)
    lesion_sizes: Optional[List[str]] = Field(default_factory=list)
    lesion_surfaces: Optional[List[str]] = Field(default_factory=list)
    lesion_consistencies: Optional[List[str]] = Field(default_factory=list)
    lesion_symptomatologies: Optional[List[str]] = Field(default_factory=list)
    pre_existing_conditions: Optional[List[str]] = Field(default_factory=list)
    image_quality: Optional[List[str]] = Field(default_factory=list)
    care_units: Optional[List[str]] = Field(default_factory=list)

    status: CaseStatus
    is_suspected: bool
    sent_to_regulator: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CaseDetailOut(BaseModel):
    case: CaseOut
    response: Optional[TeleconsultResponseOut] = None
    pathology_report: Optional[PathologyReportOut] = None
    media: List[CaseMediaOut] = Field(default_factory=list)
    messages: List[CaseMessageOut] = Field(default_factory=list)
    followups: List[RegulatorFollowUpOut] = Field(default_factory=list)
