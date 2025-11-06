"""
Application configuration using Pydantic Settings.
Loads configuration from environment variables and .env file.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    app_name: str = "KOL-BD-Tool"
    debug: bool = False

    # Database
    database_url: str = "sqlite:///./kol_bd_tool.db"

    # Security
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080  # 7 days

    # CORS
    allowed_origins: str = "http://localhost:5173"

    # AI APIs (optional)
    openai_api_key: str | None = None
    anthropic_api_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

    @property
    def origins_list(self) -> List[str]:
        """Convert comma-separated origins string to list."""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


# Global settings instance
settings = Settings()
