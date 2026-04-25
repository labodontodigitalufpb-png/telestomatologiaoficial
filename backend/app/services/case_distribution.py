from sqlalchemy.orm import Session

from app.models.case import ClinicalCase, CaseStatus
from app.models.user import User, UserRole


def assign_case_to_teleconsultor(db: Session, case: ClinicalCase):
    teleconsultor = (
        db.query(User)
        .filter(
            User.role == UserRole.TELECONSULTOR,
            User.is_active == True
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
