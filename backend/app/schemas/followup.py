from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, Field


class RegulatorFollowUpCreate(BaseModel):
    microscopic_report_date: Optional[date] = None
    head_neck_or_oncology_visit_date: Optional[date] = None
    treatment_start_date: Optional[date] = None
    followup_1m_date: Optional[date] = None
    followup_3m_date: Optional[date] = None
    followup_6m_date: Optional[date] = None
    followup_12m_date: Optional[date] = None
    followup_1m_actions: Optional[List[str]] = Field(default_factory=list)
    followup_3m_actions: Optional[List[str]] = Field(default_factory=list)
    followup_6m_actions: Optional[List[str]] = Field(default_factory=list)
    followup_12m_actions: Optional[List[str]] = Field(default_factory=list)
    followup_1m_barriers: Optional[List[str]] = Field(default_factory=list)
    followup_3m_barriers: Optional[List[str]] = Field(default_factory=list)
    followup_6m_barriers: Optional[List[str]] = Field(default_factory=list)
    followup_12m_barriers: Optional[List[str]] = Field(default_factory=list)
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
    followup_1m_date: Optional[date] = None
    followup_3m_date: Optional[date] = None
    followup_6m_date: Optional[date] = None
    followup_12m_date: Optional[date] = None
    followup_1m_actions: Optional[List[str]] = Field(default_factory=list)
    followup_3m_actions: Optional[List[str]] = Field(default_factory=list)
    followup_6m_actions: Optional[List[str]] = Field(default_factory=list)
    followup_12m_actions: Optional[List[str]] = Field(default_factory=list)
    followup_1m_barriers: Optional[List[str]] = Field(default_factory=list)
    followup_3m_barriers: Optional[List[str]] = Field(default_factory=list)
    followup_6m_barriers: Optional[List[str]] = Field(default_factory=list)
    followup_12m_barriers: Optional[List[str]] = Field(default_factory=list)
    treatments_done: Optional[str] = None
    clinical_status: Optional[str] = None
    notes: Optional[str] = None

    created_at: datetime

    class Config:
        from_attributes = True
