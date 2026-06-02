from app.core.admin import AUTHORIZED_ADMIN_EMAIL
from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.user import User, UserRole


ADMIN_PASSWORD = "Bonanpr75!"


def main() -> None:
    db = SessionLocal()

    try:
        user = (
            db.query(User)
            .filter(User.email == AUTHORIZED_ADMIN_EMAIL)
            .first()
        )

        if user is None:
            user = User(
                full_name="Paulo Bonan",
                email=AUTHORIZED_ADMIN_EMAIL,
                password_hash=hash_password(ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                municipality="Joao Pessoa",
                state="PB",
                is_active=True,
            )
            db.add(user)
        else:
            user.full_name = user.full_name or "Paulo Bonan"
            user.password_hash = hash_password(ADMIN_PASSWORD)
            user.role = UserRole.ADMIN
            user.is_active = True

        db.commit()
        print(f"Administrador geral configurado: {AUTHORIZED_ADMIN_EMAIL}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
