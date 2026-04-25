from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func

from app.core.database import Base


class PathologyReport(Base):
    __tablename__ = "pathology_reports"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("clinical_cases.id"), nullable=False, unique=True)
    pathologist_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    diagnosis = Column(Text, nullable=False)
    malignant_neoplasm = Column(Boolean, default=False, nullable=False)
    report_file_path = Column(String, nullable=True)
    report_original_filename = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
