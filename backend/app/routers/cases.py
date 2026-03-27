from typing import List
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.case import ClinicalCase, CaseStatus
from app.models.case_media import CaseMedia, CaseMediaType
from app.models.message import CaseMessage
from app.models.response import TeleconsultResponse
from app.models.followup import RegulatorFollowUp
from app.models.user import User, UserRole
from app.schemas.case import CaseCreate, CaseOut, CaseDetailOut
from app.schemas.case_media import CaseMediaOut
from app.services.case_distribution import assign_case_to_teleconsultor

router = APIRouter()

UPLOAD_DIR = Path("uploads/cases")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


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
        is_suspected=False,
        sent_to_regulator=False,
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

    allowed = False

    if current_user.role == UserRole.ADMIN:
        allowed = True
    elif current_user.role == UserRole.PROFESSIONAL and case.professional_id == current_user.id:
        allowed = True
    elif current_user.role == UserRole.TELECONSULTOR and case.assigned_teleconsultor_id == current_user.id:
        allowed = True
    elif (
        current_user.role == UserRole.TELERREGULADOR
        and case.is_suspected
        and case.sent_to_regulator
        and case.state == current_user.state
    ):
        allowed = True

    if not allowed:
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

    if not case.state:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O caso precisa ter um estado definido para ser distribuído."
        )

    case.status = CaseStatus.SUBMITTED
    db.add(case)
    db.commit()
    db.refresh(case)

    teleconsultor = assign_case_to_teleconsultor(db, case)

    if teleconsultor is None:
        case.status = CaseStatus.SUBMITTED
        case.assigned_teleconsultor_id = None
        db.add(case)
        db.commit()
        db.refresh(case)

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Nenhum teleconsultor ativo foi encontrado para o estado {case.state}."
        )

    db.refresh(case)
    return case


@router.post("/{case_id}/media", response_model=CaseMediaOut)
def upload_case_media(
    case_id: int,
    media_type: CaseMediaType = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.PROFESSIONAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas profissionais podem enviar arquivos do caso."
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

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo inválido."
        )

    extension = Path(file.filename).suffix
    safe_name = f"{uuid4().hex}{extension}"
    destination = UPLOAD_DIR / safe_name

    with destination.open("wb") as buffer:
        buffer.write(file.file.read())

    media = CaseMedia(
        case_id=case.id,
        filename=safe_name,
        original_filename=file.filename,
        file_path=f"/uploads/cases/{safe_name}",
        media_type=media_type,
    )

    db.add(media)
    db.commit()
    db.refresh(media)

    return media


@router.get("/{case_id}/media", response_model=List[CaseMediaOut])
def list_case_media(
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

    allowed = False

    if current_user.role == UserRole.ADMIN:
        allowed = True
    elif current_user.role == UserRole.PROFESSIONAL and case.professional_id == current_user.id:
        allowed = True
    elif current_user.role == UserRole.TELECONSULTOR and case.assigned_teleconsultor_id == current_user.id:
        allowed = True
    elif (
        current_user.role == UserRole.TELERREGULADOR
        and case.is_suspected
        and case.sent_to_regulator
        and case.state == current_user.state
    ):
        allowed = True

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso aos arquivos deste caso."
        )

    media_files = (
        db.query(CaseMedia)
        .filter(CaseMedia.case_id == case_id)
        .order_by(CaseMedia.created_at.desc())
        .all()
    )

    return media_files


@router.get("/{case_id}/detail", response_model=CaseDetailOut)
def get_case_detail(
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

    allowed = False

    if current_user.role == UserRole.ADMIN:
        allowed = True
    elif current_user.role == UserRole.PROFESSIONAL and case.professional_id == current_user.id:
        allowed = True
    elif current_user.role == UserRole.TELECONSULTOR and case.assigned_teleconsultor_id == current_user.id:
        allowed = True
    elif (
        current_user.role == UserRole.TELERREGULADOR
        and case.is_suspected
        and case.sent_to_regulator
        and case.state == current_user.state
    ):
        allowed = True

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso a este caso."
        )

    response = (
        db.query(TeleconsultResponse)
        .filter(TeleconsultResponse.case_id == case_id)
        .first()
    )

    media = (
        db.query(CaseMedia)
        .filter(CaseMedia.case_id == case_id)
        .order_by(CaseMedia.created_at.desc())
        .all()
    )

    messages = (
        db.query(CaseMessage)
        .filter(CaseMessage.case_id == case_id)
        .order_by(CaseMessage.created_at.asc())
        .all()
    )

    followups = (
        db.query(RegulatorFollowUp)
        .filter(RegulatorFollowUp.case_id == case_id)
        .order_by(RegulatorFollowUp.created_at.desc())
        .all()
    )

    return {
        "case": case,
        "response": response,
        "media": media,
        "messages": messages,
        "followups": followups,
    }