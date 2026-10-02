from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Agent Research API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173", # Vite default
        "http://localhost:3000",
    ]

settings = Settings()
