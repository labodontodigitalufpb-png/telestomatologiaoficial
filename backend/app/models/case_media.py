import enum

from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.sql import func

from app.core.database import Base


class CaseMediaType(str, enum.Enum):
    IMAGE = "IMAGE"
    EXAM = "EXAM"
    CONSENT = "CONSENT"
    AUDIO = "AUDIO"
    VIDEO = "VIDEO"


class CaseMedia(Base):
    __tablename__ = "case_media"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("clinical_cases.id"), nullable=False)

    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    media_type = Column(Enum(CaseMediaType), nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())