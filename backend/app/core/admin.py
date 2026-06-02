from typing import Optional


AUTHORIZED_ADMIN_EMAIL = "paulo.bonan@academico.ufpb.br"


def is_authorized_admin_email(email: Optional[str]) -> bool:
    return (email or "").strip().lower() == AUTHORIZED_ADMIN_EMAIL
