from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.teleconsultor import UNIVERSAL_TELECONSULTOR_EMAIL
from app.models.case import ClinicalCase, CaseStatus
from app.models.user import User, UserRole


def assign_case_to_teleconsultor(db: Session, case: ClinicalCase):
    case_state = (case.state or "").strip()

    teleconsultor = (
        db.query(User)
        .filter(
            User.role == UserRole.TELECONSULTOR,
            User.is_active == True,
            func.lower(func.trim(User.state)) == case_state.lower(),
        )
        .order_by(User.id.asc())
        .first()
    )

    if teleconsultor is None:
        teleconsultor = (
            db.query(User)
            .filter(
                func.lower(func.trim(User.email)) == UNIVERSAL_TELECONSULTOR_EMAIL,
                User.is_active == True,
            )
            .order_by(User.id.asc())
            .first()
        )

    if teleconsultor is None:
        return None

    case.assigned_teleconsultor_id = teleconsultor.id
    case.status = CaseStatus.ASSIGNED

    db.add(case)
    db.commit()
    db.refresh(case)

    return teleconsultor
