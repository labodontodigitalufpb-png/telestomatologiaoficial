from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.case import ClinicalCase
from app.models.followup import RegulatorFollowUp
from app.models.message import CaseMessage
from app.models.pathology_report import PathologyReport
from app.models.response import TeleconsultResponse
from app.models.user import User, UserRole
from app.schemas.user import UserOut, UserStatusUpdate

router = APIRouter()


def require_admin(current_user: User):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas administradores podem gerenciar usuários.",
        )


def get_user_or_404(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado.",
        )
    return user


def user_has_clinical_links(user_id: int, db: Session) -> bool:
    case_link = (
        db.query(ClinicalCase.id)
        .filter(
            or_(
                ClinicalCase.professional_id == user_id,
                ClinicalCase.assigned_teleconsultor_id == user_id,
            )
        )
        .first()
    )
    if case_link:
        return True

    linked_models = [
        (CaseMessage, CaseMessage.sender_id),
        (TeleconsultResponse, TeleconsultResponse.teleconsultor_id),
        (RegulatorFollowUp, RegulatorFollowUp.regulator_id),
        (PathologyReport, PathologyReport.pathologist_id),
    ]

    return any(db.query(model.id).filter(column == user_id).first() for model, column in linked_models)


@router.get("/", response_model=List[UserOut])
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)

    return db.query(User).order_by(User.created_at.desc(), User.id.desc()).all()


@router.patch("/{user_id}/status", response_model=UserOut)
def update_user_status(
    user_id: int,
    status_data: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)
    user = get_user_or_404(user_id, db)

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode bloquear o próprio usuário administrador.",
        )

    user.is_active = status_data.is_active
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_admin(current_user)
    user = get_user_or_404(user_id, db)

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Você não pode remover o próprio usuário administrador.",
        )

    if user_has_clinical_links(user.id, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este usuário possui vínculos clínicos. Bloqueie o acesso em vez de remover para preservar o histórico.",
        )

    db.delete(user)
    db.commit()
    return {"message": "Usuário removido com sucesso."}
