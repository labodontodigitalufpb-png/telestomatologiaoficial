from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.core.database import Base


class RegulatorFollowUp(Base):
    __tablename__ = "regulator_followups"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("clinical_cases.id"), nullable=False)
    regulator_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    microscopic_report_date = Column(Date, nullable=True)
    head_neck_or_oncology_visit_date = Column(Date, nullable=True)
    treatment_start_date = Column(Date, nullable=True)
    followup_3m_date = Column(Date, nullable=True)
    followup_6m_date = Column(Date, nullable=True)

    treatments_done = Column(Text, nullable=True)
    clinical_status = Column(String, nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())