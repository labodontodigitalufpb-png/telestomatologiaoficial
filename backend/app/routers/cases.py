from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.case import ClinicalCase, CaseStatus
from app.models.user import User, UserRole
from app.schemas.case import CaseCreate, CaseOut
from app.services.case_distribution import assign_case_to_teleconsultor

router = APIRouter()


@router.post("/", response_model=CaseOut)
def create_case(
    case_data: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.PROFESSIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas profissionais podem criar casos."
        )

    new_case = ClinicalCase(
        professional_id=current_user.id,
        patient_name=case_data.patient_name,
        patient_age=case_data.patient_age,
        patient_sex=case_data.patient_sex,
        patient_phone=case_data.patient_phone,
        sus_card=case_data.sus_card,
        health_unit=case_data.health_unit,
        municipality=case_data.municipality,
        state=case_data.state,
        chief_complaint=case_data.chief_complaint,
        history_present_illness=case_data.history_present_illness,
        medical_history=case_data.medical_history,
        dental_history=case_data.dental_history,
        medications=case_data.medications,
        extraoral_exam=case_data.extraoral_exam,
        lesion_description=case_data.lesion_description,
        diagnostic_hypothesis=case_data.diagnostic_hypothesis,
        status=CaseStatus.DRAFT,
    )

    db.add(new_case)
    db.commit()
    db.refresh(new_case)

    return new_case


@router.get("/mine", response_model=List[CaseOut])
def list_my_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.PROFESSIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas profissionais podem visualizar seus casos."
        )

    cases = (
        db.query(ClinicalCase)
        .filter(ClinicalCase.professional_id == current_user.id)
        .order_by(ClinicalCase.created_at.desc())
        .all()
    )

    return cases


@router.get("/{case_id}", response_model=CaseOut)
def get_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(ClinicalCase).filter(ClinicalCase.id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado."
        )

    if current_user.role == UserRole.PROFESSIONAL and case.professional_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso a este caso."
        )

    return case


@router.post("/{case_id}/submit", response_model=CaseOut)
def submit_case(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.PROFESSIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas profissionais podem submeter casos."
        )

    case = (
        db.query(ClinicalCase)
        .filter(
            ClinicalCase.id == case_id,
            ClinicalCase.professional_id == current_user.id
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado."
        )

    if case.status != CaseStatus.DRAFT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Somente casos em rascunho podem ser submetidos."
        )

    case.status = CaseStatus.SUBMITTED
    db.add(case)
    db.commit()
    db.refresh(case)

    teleconsultor = assign_case_to_teleconsultor(db, case)

    if teleconsultor is None:
        case.status = CaseStatus.SUBMITTED
        db.add(case)
        db.commit()
        db.refresh(case)

    return case