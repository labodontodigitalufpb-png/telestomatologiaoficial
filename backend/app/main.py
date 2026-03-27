from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.cases import router as cases_router
from app.routers.chat import router as chat_router
from app.routers.dashboard import router as dashboard_router
from app.routers.teleconsultor import router as teleconsultor_router
from app.routers.telerregulador import router as telerregulador_router

app = FastAPI(title="TeleEstomato API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(cases_router)
app.include_router(chat_router)
app.include_router(teleconsultor_router)
app.include_router(telerregulador_router)
app.include_router(dashboard_router)


@app.get("/")
def root():
    return {"message": "TeleEstomato API no ar"}