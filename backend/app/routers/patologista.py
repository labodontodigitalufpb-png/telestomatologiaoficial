from pathlib import Path
from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.case import ClinicalCase, CaseStatus
from app.models.case_media import CaseMedia
from app.models.followup import RegulatorFollowUp
from app.models.message import CaseMessage
from app.models.pathology_report import PathologyReport
from app.models.response import TeleconsultResponse
from app.models.user import User, UserRole
from app.schemas.case import CaseDetailOut, CaseOut
from app.schemas.pathology_report import PathologyReportOut

router = APIRouter()

PATHOLOGY_UPLOAD_DIR = Path("uploads/pathology")
PATHOLOGY_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def get_case_for_pathologist(db: Session, case_id: int, current_user: User) -> ClinicalCase:
    case = (
        db.query(ClinicalCase)
        .filter(ClinicalCase.id == case_id)
        .first()
    )
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado para este patologista.",
        )
    return case


@router.get("/patologista/cases", response_model=List[CaseOut])
def list_pathologist_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.PATOLOGISTA:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas patologistas podem acessar esta rota.",
        )

    return (
        db.query(ClinicalCase)
        .order_by(ClinicalCase.created_at.desc())
        .all()
    )


@router.get("/patologista/cases/{case_id}/detail", response_model=CaseDetailOut)
def get_pathologist_case_detail(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.PATOLOGISTA:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas patologistas podem acessar esta rota.",
        )

    case = get_case_for_pathologist(db, case_id, current_user)

    response = (
        db.query(TeleconsultResponse)
        .filter(TeleconsultResponse.case_id == case_id)
        .first()
    )
    pathology_report = (
        db.query(PathologyReport)
        .filter(PathologyReport.case_id == case_id)
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
        "pathology_report": pathology_report,
        "media": media,
        "messages": messages,
        "followups": followups,
    }


@router.get("/patologista/cases/{case_id}/report", response_model=PathologyReportOut)
def get_pathology_report(
    case_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in [UserRole.PATOLOGISTA, UserRole.PROFESSIONAL, UserRole.TELECONSULTOR, UserRole.TELERREGULADOR, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar este laudo.",
        )

    report = db.query(PathologyReport).filter(PathologyReport.case_id == case_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laudo patológico ainda não registrado.",
        )
    case = db.query(ClinicalCase).filter(ClinicalCase.id == report.case_id).first()
    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado.",
        )

    allowed = False
    if current_user.role == UserRole.ADMIN:
        allowed = True
    elif current_user.role == UserRole.PROFESSIONAL and case.professional_id == current_user.id:
        allowed = True
    elif current_user.role == UserRole.TELECONSULTOR and case.assigned_teleconsultor_id == current_user.id:
        allowed = True
    elif current_user.role == UserRole.PATOLOGISTA:
        allowed = True
    elif (
        current_user.role == UserRole.TELERREGULADOR
        and case.is_suspected
        and case.sent_to_regulator
    ):
        allowed = True

    if not allowed:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso a este laudo.",
        )
    return report


@router.post("/patologista/cases/{case_id}/report", response_model=PathologyReportOut)
def upsert_pathology_report(
    case_id: int,
    diagnosis: str = Form(...),
    malignant_neoplasm: bool = Form(False),
    report_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.PATOLOGISTA:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas patologistas podem registrar laudo.",
        )

    case = get_case_for_pathologist(db, case_id, current_user)

    report = db.query(PathologyReport).filter(PathologyReport.case_id == case.id).first()
    if report is None:
        report = PathologyReport(
            case_id=case.id,
            pathologist_id=current_user.id,
            diagnosis=diagnosis.strip(),
            malignant_neoplasm=malignant_neoplasm,
        )
    else:
        report.pathologist_id = current_user.id
        report.diagnosis = diagnosis.strip()
        report.malignant_neoplasm = malignant_neoplasm

    if report_file is not None and report_file.filename:
        extension = Path(report_file.filename).suffix
        safe_name = f"{uuid4().hex}{extension}"
        destination = PATHOLOGY_UPLOAD_DIR / safe_name

        with destination.open("wb") as buffer:
            buffer.write(report_file.file.read())

        report.report_file_path = f"/uploads/pathology/{safe_name}"
        report.report_original_filename = report_file.filename

    db.add(report)
    if malignant_neoplasm:
        case.is_suspected = True
        case.sent_to_regulator = True
        case.status = CaseStatus.SUSPECTED
        db.add(case)
    db.commit()
    db.refresh(report)
    return report
