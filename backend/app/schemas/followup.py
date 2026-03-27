from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class RegulatorFollowUpCreate(BaseModel):
    microscopic_report_date: Optional[date] = None
    head_neck_or_oncology_visit_date: Optional[date] = None
    treatment_start_date: Optional[date] = None
    followup_3m_date: Optional[date] = None
    followup_6m_date: Optional[date] = None
    treatments_done: Optional[str] = None
    clinical_status: Optional[str] = None
    notes: Optional[str] = None


class RegulatorFollowUpOut(BaseModel):
    id: int
    case_id: int
    regulator_id: int

    microscopic_report_date: Optional[date] = None
    head_neck_or_oncology_visit_date: Optional[date] = None
    treatment_start_date: Optional[date] = None
    followup_3m_date: Optional[date] = None
    followup_6m_date: Optional[date] = None
    treatments_done: Optional[str] = None
    clinical_status: Optional[str] = None
    notes: Optional[str] = None

    created_at: datetime

    class Config:
        from_attributes = True