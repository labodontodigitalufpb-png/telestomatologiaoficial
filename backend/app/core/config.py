from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "TeleEstomato API"
    database_url: str = "postgresql://postgres:postgres@localhost:5432/teleestomato"
    secret_key: str = "troque-essa-chave-em-producao"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()