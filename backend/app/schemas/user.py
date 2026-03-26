from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from app.models.user import UserRole


class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)

    role: UserRole

    age: Optional[int] = None
    sex: Optional[str] = None
    municipality: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    health_unit: Optional[str] = None
    specialty: Optional[str] = None
    professional_council: Optional[str] = None
    academic_background: Optional[str] = None


class UserOut(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    age: Optional[int] = None
    sex: Optional[str] = None
    municipality: Optional[str] = None
    state: Optional[str] = None
    address: Optional[str] = None
    health_unit: Optional[str] = None
    specialty: Optional[str] = None
    professional_council: Optional[str] = None
    academic_background: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True