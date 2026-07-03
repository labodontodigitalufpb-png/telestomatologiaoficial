from typing import Optional


UNIVERSAL_TELECONSULTOR_EMAIL = "paulo.bonan@academico.ufpb.br"


def normalize_email(email: Optional[str]) -> str:
    return (email or "").strip().lower()


def is_universal_teleconsultor_email(email: Optional[str]) -> bool:
    return normalize_email(email) == UNIVERSAL_TELECONSULTOR_EMAIL
