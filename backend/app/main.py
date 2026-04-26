from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers.auth import router as auth_router
from app.routers.cases import router as cases_router
from app.routers.chat import router as chat_router
from app.routers.dashboard import router as dashboard_router
from app.routers.patologista import router as patologista_router
from app.routers.teleconsultor import router as teleconsultor_router
from app.routers.telerregulador import router as telerregulador_router

app = FastAPI(title="TeleEstomato API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(cases_router, prefix="/cases")
app.include_router(chat_router, prefix="/chat")
app.include_router(teleconsultor_router, prefix="/teleconsultor")
app.include_router(patologista_router)
app.include_router(telerregulador_router, prefix="/telerregulador")
app.include_router(dashboard_router, prefix="/dashboard")


@app.get("/")
def root():
    return {"message": "TeleEstomato API no ar"}
