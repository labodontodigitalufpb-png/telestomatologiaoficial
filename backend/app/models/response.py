from sqlalchemy import Column, Integer, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func

from app.core.database import Base


class TeleconsultResponse(Base):
    __tablename__ = "teleconsult_responses"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("clinical_cases.id"), nullable=False)
    teleconsultor_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    clinical_description = Column(Text, nullable=True)
    justified_hypotheses = Column(Text, nullable=True)
    conduct = Column(Text, nullable=True)
    care_coordination = Column(Text, nullable=True)
    references = Column(Text, nullable=True)

    marked_as_suspected = Column(Boolean, default=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now())