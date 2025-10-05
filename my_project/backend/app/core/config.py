from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://test_user:password@localhost:5432/test_db"
    
    class Config:
        env_file = ".env"

settings = Settings()
