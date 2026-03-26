from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    PROFESSIONAL = "PROFESSIONAL"
    TELECONSULTOR = "TELECONSULTOR"
    TELERREGULADOR = "TELERREGULADOR"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)

    role = Column(Enum(UserRole), nullable=False)

    age = Column(Integer, nullable=True)
    sex = Column(String, nullable=True)
    municipality = Column(String, nullable=True)
    state = Column(String, nullable=True)
    address = Column(String, nullable=True)
    health_unit = Column(String, nullable=True)
    specialty = Column(String, nullable=True)
    professional_council = Column(String, nullable=True)
    academic_background = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())