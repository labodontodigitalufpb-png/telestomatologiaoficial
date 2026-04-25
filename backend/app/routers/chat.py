from typing import List
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.case import ClinicalCase
from app.models.message import CaseMessage, MessageType
from app.models.user import User, UserRole
from app.schemas.message import CaseMessageCreate, CaseMessageOut

router = APIRouter()

CHAT_UPLOAD_DIR = Path("uploads/chat")
CHAT_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def user_can_access_case(current_user: User, case: ClinicalCase) -> bool:
    if current_user.role == UserRole.ADMIN:
        return True

    if current_user.role == UserRole.PROFESSIONAL and case.professional_id == current_user.id:
        return True

    if current_user.role == UserRole.TELECONSULTOR and case.assigned_teleconsultor_id == current_user.id:
        return True

    if (
        current_user.role == UserRole.TELERREGULADOR
        and case.is_suspected
        and case.sent_to_regulator
    ):
        return True

    if current_user.role == UserRole.PATOLOGISTA:
        return True

    return False


@router.get("/cases/{case_id}/messages", response_model=List[CaseMessageOut])
def list_case_messages(
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

    if not user_can_access_case(current_user, case):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem acesso a este chat."
        )

    messages = (
        db.query(CaseMessage)
        .filter(CaseMessage.case_id == case_id)
        .order_by(CaseMessage.created_at.asc())
        .all()
    )

    return messages


@router.post("/cases/{case_id}/messages", response_model=CaseMessageOut)
def create_case_message(
    case_id: int,
    message_data: CaseMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(ClinicalCase).filter(ClinicalCase.id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado."
        )

    if not user_can_access_case(current_user, case):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para enviar mensagens neste caso."
        )

    if message_data.message_type != MessageType.TEXT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Use a rota de upload para imagem, áudio ou vídeo."
        )

    if not message_data.content or not message_data.content.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A mensagem não pode estar vazia."
        )

    new_message = CaseMessage(
        case_id=case.id,
        sender_id=current_user.id,
        message_type=MessageType.TEXT,
        content=message_data.content.strip(),
        file_path=None,
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message


@router.post("/cases/{case_id}/messages/upload", response_model=CaseMessageOut)
def upload_case_message_file(
    case_id: int,
    message_type: MessageType = Form(...),
    file: UploadFile = File(...),
    content: str = Form(""),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    case = db.query(ClinicalCase).filter(ClinicalCase.id == case_id).first()

    if not case:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caso não encontrado."
        )

    if not user_can_access_case(current_user, case):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para enviar arquivos neste caso."
        )

    if message_type == MessageType.TEXT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Para mensagens de texto, use a rota /messages."
        )

    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo inválido."
        )

    extension = Path(file.filename).suffix
    safe_name = f"{uuid4().hex}{extension}"
    destination = CHAT_UPLOAD_DIR / safe_name

    with destination.open("wb") as buffer:
        buffer.write(file.file.read())

    new_message = CaseMessage(
        case_id=case.id,
        sender_id=current_user.id,
        message_type=message_type,
        content=content.strip() if content else None,
       file_path=f"/uploads/chat/{safe_name}",
    )

    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    return new_message
