from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.case import ClinicalCase
from app.models.user import User, UserRole
from app.schemas.case import CaseOut

router = APIRouter()


@router.get("/my-cases", response_model=List[CaseOut])
def list_my_assigned_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.TELECONSULTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas teleconsultores podem acessar esta rota."
        )

    cases = (
        db.query(ClinicalCase)
        .filter(ClinicalCase.assigned_teleconsultor_id == current_user.id)
        .order_by(ClinicalCase.created_at.desc())
        .all()
    )

    return cases