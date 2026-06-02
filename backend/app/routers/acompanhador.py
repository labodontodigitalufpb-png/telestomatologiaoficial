from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.case import ClinicalCase
from app.models.user import User, UserRole
from app.routers.cases import query_accessible_cases
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

    return (
        query_accessible_cases(db, current_user)
        .order_by(ClinicalCase.created_at.desc())
        .all()
    )
