from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "TeleEstomato API"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/teleestomato"
    secret_key: str = "troque-essa-chave-em-producao"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    frontend_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:3000,"
        "http://127.0.0.1:5500,"
        "http://localhost:5500,"
        "https://labodontodigitalufpb-png.github.io"
    )

    @property
    def cors_origins(self) -> list[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.frontend_origins.split(",")
            if origin.strip()
        ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
