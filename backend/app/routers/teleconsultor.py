from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.case import ClinicalCase, CaseStatus
from app.models.response import TeleconsultResponse
from app.models.user import User, UserRole
from app.schemas.case import CaseOut
from app.schemas.response import TeleconsultResponseCreate, TeleconsultResponseOut

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


@router.post("/cases/{case_id}/response", response_model=TeleconsultResponseOut)
def respond_case(
    case_id: int,
    response_data: TeleconsultResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.TELECONSULTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas teleconsultores podem responder casos."
        )

    case = (
        db.query(ClinicalCase)
        .filter(
            ClinicalCase.id == case_id,
            ClinicalCase.assigned_teleconsultor_id == current_user.id
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado ou não atribuído a este teleconsultor."
        )

    existing_response = (
        db.query(TeleconsultResponse)
        .filter(TeleconsultResponse.case_id == case.id)
        .first()
    )

    if existing_response:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este caso já possui resposta registrada pelo teleconsultor. Use a rota de edição."
        )

    new_response = TeleconsultResponse(
        case_id=case.id,
        teleconsultor_id=current_user.id,
        clinical_description=response_data.clinical_description,
        justified_hypotheses=response_data.justified_hypotheses,
        conduct=response_data.conduct,
        care_coordination=response_data.care_coordination,
        references=response_data.references,
        marked_as_suspected=response_data.marked_as_suspected,
    )

    db.add(new_response)

    case.status = CaseStatus.ANSWERED
    case.is_suspected = False
    case.sent_to_regulator = False

    if response_data.marked_as_suspected:
        case.is_suspected = True
        case.sent_to_regulator = True
        case.status = CaseStatus.SUSPECTED

    db.add(case)
    db.commit()
    db.refresh(new_response)

    return new_response


@router.put("/responses/{response_id}", response_model=TeleconsultResponseOut)
def update_response(
    response_id: int,
    response_data: TeleconsultResponseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.TELECONSULTOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas teleconsultores podem editar respostas."
        )

    response = (
        db.query(TeleconsultResponse)
        .join(ClinicalCase, ClinicalCase.id == TeleconsultResponse.case_id)
        .filter(
            TeleconsultResponse.id == response_id,
            ClinicalCase.assigned_teleconsultor_id == current_user.id
        )
        .first()
    )

    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resposta não encontrada para este teleconsultor."
        )

    case = db.query(ClinicalCase).filter(ClinicalCase.id == response.case_id).first()

    response.clinical_description = response_data.clinical_description
    response.justified_hypotheses = response_data.justified_hypotheses
    response.conduct = response_data.conduct
    response.care_coordination = response_data.care_coordination
    response.references = response_data.references
    response.marked_as_suspected = response_data.marked_as_suspected

    case.status = CaseStatus.ANSWERED
    case.is_suspected = False
    case.sent_to_regulator = False

    if response_data.marked_as_suspected:
        case.is_suspected = True
        case.sent_to_regulator = True
        case.status = CaseStatus.SUSPECTED

    db.add(response)
    db.add(case)
    db.commit()
    db.refresh(response)

    return response


@router.get("/cases/{case_id}/response", response_model=TeleconsultResponseOut)
def get_case_response(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.TELECONSULTOR, UserRole.PROFESSIONAL, UserRole.TELERREGULADOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar esta resposta."
        )

    case = db.query(ClinicalCase).filter(ClinicalCase.id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado."
        )

    if current_user.role == UserRole.TELECONSULTOR and case.assigned_teleconsultor_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso a esta resposta."
        )

    if current_user.role == UserRole.PROFESSIONAL and case.professional_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso a esta resposta."
        )

    if (
        current_user.role == UserRole.TELERREGULADOR
        and not (case.is_suspected and case.sent_to_regulator and case.state == current_user.state)
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso a esta resposta."
        )

    response = (
        db.query(TeleconsultResponse)
        .filter(TeleconsultResponse.case_id == case_id)
        .first()
    )

    if not response:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resposta não encontrada para este caso."
        )

    return response