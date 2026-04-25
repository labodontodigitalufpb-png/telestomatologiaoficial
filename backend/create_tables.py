from app.core.database import Base, engine
from app.models import User, ClinicalCase
from sqlalchemy import text

CASE_VALUATION_COLUMNS = [
    "specialist_status",
    "specialties",
    "objectives",
    "skin_colors",
    "anatomical_locations",
    "fundamental_lesions",
    "habits_and_addictions",
    "lesion_sides",
    "lesion_colors",
    "lesion_insertions",
    "lesion_sizes",
    "lesion_surfaces",
    "lesion_consistencies",
    "lesion_symptomatologies",
    "pre_existing_conditions",
    "image_quality",
    "care_units",
]

CASE_TEXT_COLUMNS = [
    "race_color",
    "schooling",
    "lymphadenopathy",
]

USER_REGISTRATION_COLUMNS = [
    "race_color",
    "schooling",
    "patient_phone",
    "sus_card",
]

FOLLOWUP_DATE_COLUMNS = [
    "followup_1m_date",
    "followup_12m_date",
]

FOLLOWUP_ACTION_COLUMNS = [
    "followup_1m_actions",
    "followup_3m_actions",
    "followup_6m_actions",
    "followup_12m_actions",
    "followup_1m_barriers",
    "followup_3m_barriers",
    "followup_6m_barriers",
    "followup_12m_barriers",
]

PATHOLOGY_REPORT_BOOLEAN_COLUMNS = [
    "malignant_neoplasm",
]

print("Criando tabelas...")
Base.metadata.create_all(bind=engine)

if engine.dialect.name == "postgresql":
    with engine.begin() as connection:
        for column in CASE_VALUATION_COLUMNS:
            connection.execute(
                text(f"ALTER TABLE clinical_cases ADD COLUMN IF NOT EXISTS {column} JSON")
            )
        for column in CASE_TEXT_COLUMNS:
            connection.execute(
                text(f"ALTER TABLE clinical_cases ADD COLUMN IF NOT EXISTS {column} TEXT")
            )
        for column in USER_REGISTRATION_COLUMNS:
            connection.execute(
                text(f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {column} VARCHAR")
            )
        for column in FOLLOWUP_DATE_COLUMNS:
            connection.execute(
                text(f"ALTER TABLE regulator_followups ADD COLUMN IF NOT EXISTS {column} DATE")
            )
        for column in FOLLOWUP_ACTION_COLUMNS:
            connection.execute(
                text(f"ALTER TABLE regulator_followups ADD COLUMN IF NOT EXISTS {column} JSON")
            )
        for column in PATHOLOGY_REPORT_BOOLEAN_COLUMNS:
            connection.execute(
                text(f"ALTER TABLE pathology_reports ADD COLUMN IF NOT EXISTS {column} BOOLEAN DEFAULT FALSE NOT NULL")
            )

print("Tabelas criadas com sucesso.")
