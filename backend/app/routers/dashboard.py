from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, UserRole
from app.services.dashboard_service import (
    get_dashboard_summary,
    get_cases_by_state,
    get_suspected_cases_by_state,
    get_followup_cases_by_state,
    get_response_time_distribution,
)

router = APIRouter()


def ensure_dashboard_access(current_user: User):
    if current_user.role not in [
        UserRole.ADMIN,
        UserRole.TELECONSULTOR,
        UserRole.PATOLOGISTA,
        UserRole.TELERREGULADOR,
        UserRole.PROFESSIONAL,
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar o dashboard."
        )


@router.get("/summary")
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ensure_dashboard_access(current_user)
    return get_dashboard_summary(db)


@router.get("/cases-by-state")
def dashboard_cases_by_state(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ensure_dashboard_access(current_user)
    return get_cases_by_state(db)


@router.get("/suspected-by-state")
def dashboard_suspected_by_state(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ensure_dashboard_access(current_user)
    return get_suspected_cases_by_state(db)


@router.get("/followup-by-state")
def dashboard_followup_by_state(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ensure_dashboard_access(current_user)
    return get_followup_cases_by_state(db)


@router.get("/response-time")
def dashboard_response_time(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ensure_dashboard_access(current_user)
    return get_response_time_distribution(db)
