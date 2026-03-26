import enum
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class CaseStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    ASSIGNED = "ASSIGNED"
    ANSWERED = "ANSWERED"
    SUSPECTED = "SUSPECTED"
    IN_FOLLOWUP = "IN_FOLLOWUP"
    CLOSED = "CLOSED"


class ClinicalCase(Base):
    __tablename__ = "clinical_cases"

    id = Column(Integer, primary_key=True, index=True)

    professional_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_teleconsultor_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    patient_name = Column(String, nullable=False)
    patient_age = Column(Integer, nullable=True)
    patient_sex = Column(String, nullable=True)
    patient_phone = Column(String, nullable=True)
    sus_card = Column(String, nullable=True)

    health_unit = Column(String, nullable=True)
    municipality = Column(String, nullable=True)
    state = Column(String, nullable=False)

    chief_complaint = Column(Text, nullable=True)
    history_present_illness = Column(Text, nullable=True)
    medical_history = Column(Text, nullable=True)
    dental_history = Column(Text, nullable=True)
    medications = Column(Text, nullable=True)
    extraoral_exam = Column(Text, nullable=True)
    lesion_description = Column(Text, nullable=True)
    diagnostic_hypothesis = Column(Text, nullable=True)

    status = Column(Enum(CaseStatus), default=CaseStatus.DRAFT, nullable=False)
    is_suspected = Column(Boolean, default=False)
    sent_to_regulator = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())