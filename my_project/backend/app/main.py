from fastapi import FastAPI
from app.core.database import Base, engine
from app.routers import users

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Test Project API")
app.include_router(users.router)
