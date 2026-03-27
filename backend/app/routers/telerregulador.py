from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.case import ClinicalCase, CaseStatus
from app.models.followup import RegulatorFollowUp
from app.models.user import User, UserRole
from app.schemas.case import CaseOut
from app.schemas.followup import RegulatorFollowUpCreate, RegulatorFollowUpOut

router = APIRouter()


@router.get("/cases", response_model=List[CaseOut])
def list_suspected_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.TELERREGULADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas telerreguladores podem acessar esta rota."
        )

    cases = (
        db.query(ClinicalCase)
        .filter(
            ClinicalCase.is_suspected == True,
            ClinicalCase.sent_to_regulator == True,
            ClinicalCase.state == current_user.state
        )
        .order_by(ClinicalCase.created_at.desc())
        .all()
    )

    return cases


@router.post("/cases/{case_id}/followup", response_model=RegulatorFollowUpOut)
def create_followup(
    case_id: int,
    followup_data: RegulatorFollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.TELERREGULADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas telerreguladores podem registrar seguimento."
        )

    case = (
        db.query(ClinicalCase)
        .filter(
            ClinicalCase.id == case_id,
            ClinicalCase.is_suspected == True,
            ClinicalCase.sent_to_regulator == True,
            ClinicalCase.state == current_user.state
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso suspeito não encontrado para este telerregulador."
        )

    followup = RegulatorFollowUp(
        case_id=case.id,
        regulator_id=current_user.id,
        microscopic_report_date=followup_data.microscopic_report_date,
        head_neck_or_oncology_visit_date=followup_data.head_neck_or_oncology_visit_date,
        treatment_start_date=followup_data.treatment_start_date,
        followup_3m_date=followup_data.followup_3m_date,
        followup_6m_date=followup_data.followup_6m_date,
        treatments_done=followup_data.treatments_done,
        clinical_status=followup_data.clinical_status,
        notes=followup_data.notes,
    )

    db.add(followup)

    case.status = CaseStatus.IN_FOLLOWUP
    db.add(case)

    db.commit()
    db.refresh(followup)

    return followup


@router.put("/followups/{followup_id}", response_model=RegulatorFollowUpOut)
def update_followup(
    followup_id: int,
    followup_data: RegulatorFollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.TELERREGULADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas telerreguladores podem editar seguimentos."
        )

    followup = (
        db.query(RegulatorFollowUp)
        .join(ClinicalCase, ClinicalCase.id == RegulatorFollowUp.case_id)
        .filter(
            RegulatorFollowUp.id == followup_id,
            ClinicalCase.state == current_user.state
        )
        .first()
    )

    if not followup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seguimento não encontrado para este telerregulador."
        )

    followup.microscopic_report_date = followup_data.microscopic_report_date
    followup.head_neck_or_oncology_visit_date = followup_data.head_neck_or_oncology_visit_date
    followup.treatment_start_date = followup_data.treatment_start_date
    followup.followup_3m_date = followup_data.followup_3m_date
    followup.followup_6m_date = followup_data.followup_6m_date
    followup.treatments_done = followup_data.treatments_done
    followup.clinical_status = followup_data.clinical_status
    followup.notes = followup_data.notes

    db.add(followup)
    db.commit()
    db.refresh(followup)

    return followup


@router.get("/cases/{case_id}/followups", response_model=List[RegulatorFollowUpOut])
def list_followups(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.TELERREGULADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas telerreguladores podem acessar os seguimentos."
        )

    case = (
        db.query(ClinicalCase)
        .filter(
            ClinicalCase.id == case_id,
            ClinicalCase.state == current_user.state
        )
        .first()
    )

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado."
        )

    followups = (
        db.query(RegulatorFollowUp)
        .filter(RegulatorFollowUp.case_id == case_id)
        .order_by(RegulatorFollowUp.created_at.desc())
        .all()
    )

    return followups