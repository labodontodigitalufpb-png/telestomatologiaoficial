from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.case import ClinicalCase
from app.models.user import User, UserRole
from app.schemas.case import CaseOut

router = APIRouter()


@router.get("/cases", response_model=List[CaseOut])
def list_municipal_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.ACOMPANHADOR_MUNICIPAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas acompanhadores municipais podem acessar esta rota.",
        )

    municipality = (current_user.municipality or "").strip()
    if not municipality:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seu cadastro precisa ter um município definido.",
        )

    query = db.query(ClinicalCase).filter(
        func.lower(ClinicalCase.municipality) == municipality.lower()
    )

    state = (current_user.state or "").strip()
    if state:
        query = query.filter(func.lower(ClinicalCase.state) == state.lower())

    return query.order_by(ClinicalCase.created_at.desc()).all()
