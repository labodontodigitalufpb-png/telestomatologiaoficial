from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.case import ClinicalCase, CaseStatus
from app.models.response import TeleconsultResponse
from app.models.followup import RegulatorFollowUp


def get_dashboard_summary(db: Session):
    total_cases = db.query(func.count(ClinicalCase.id)).scalar() or 0

    total_answered = (
        db.query(func.count(ClinicalCase.id))
        .filter(
            ClinicalCase.status.in_(
                [CaseStatus.ANSWERED, CaseStatus.SUSPECTED, CaseStatus.IN_FOLLOWUP, CaseStatus.CLOSED]
            )
        )
        .scalar()
        or 0
    )

    total_suspected = (
        db.query(func.count(ClinicalCase.id))
        .filter(ClinicalCase.is_suspected == True)
        .scalar()
        or 0
    )

    total_followup = (
        db.query(func.count(RegulatorFollowUp.id))
        .scalar()
        or 0
    )

    states_active = (
        db.query(func.count(func.distinct(ClinicalCase.state)))
        .scalar()
        or 0
    )

    avg_response_seconds = (
        db.query(
            func.avg(
                func.extract("epoch", TeleconsultResponse.created_at - ClinicalCase.created_at)
            )
        )
        .join(ClinicalCase, ClinicalCase.id == TeleconsultResponse.case_id)
        .scalar()
    )

    avg_response_days = round((avg_response_seconds or 0) / 86400, 2)

    return {
        "total_cases": total_cases,
        "total_teleconsultorias": total_answered,
        "total_suspected_cases": total_suspected,
        "total_followups": total_followup,
        "states_active": states_active,
        "avg_response_days": avg_response_days,
    }


def get_cases_by_state(db: Session):
    rows = (
        db.query(
            ClinicalCase.state,
            func.count(ClinicalCase.id).label("total")
        )
        .group_by(ClinicalCase.state)
        .order_by(func.count(ClinicalCase.id).desc())
        .all()
    )

    return [{"state": row[0], "total": row[1]} for row in rows]


def get_suspected_cases_by_state(db: Session):
    rows = (
        db.query(
            ClinicalCase.state,
            func.count(ClinicalCase.id).label("total")
        )
        .filter(ClinicalCase.is_suspected == True)
        .group_by(ClinicalCase.state)
        .order_by(func.count(ClinicalCase.id).desc())
        .all()
    )

    return [{"state": row[0], "total": row[1]} for row in rows]


def get_followup_cases_by_state(db: Session):
    rows = (
        db.query(
            ClinicalCase.state,
            func.count(func.distinct(RegulatorFollowUp.case_id)).label("total")
        )
        .join(RegulatorFollowUp, RegulatorFollowUp.case_id == ClinicalCase.id)
        .group_by(ClinicalCase.state)
        .order_by(func.count(func.distinct(RegulatorFollowUp.case_id)).desc())
        .all()
    )

    return [{"state": row[0], "total": row[1]} for row in rows]


def get_response_time_distribution(db: Session):
    rows = (
        db.query(
            ClinicalCase.id,
            ClinicalCase.created_at,
            TeleconsultResponse.created_at
        )
        .join(TeleconsultResponse, TeleconsultResponse.case_id == ClinicalCase.id)
        .all()
    )

    data = []
    for case_id, created_at, response_created_at in rows:
        if created_at and response_created_at:
            diff_days = round((response_created_at - created_at).total_seconds() / 86400, 2)
            data.append({
                "case_id": case_id,
                "response_time_days": diff_days
            })

    return data