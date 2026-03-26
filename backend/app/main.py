from fastapi import FastAPI
from app.routers import auth, cases, teleconsultor, telerregulador, chat, dashboard

app = FastAPI(
    title="TeleEstomato API",
    description="API para teleconsultoria em estomatologia",
    version="0.1.0"
)

app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(cases.router, prefix="/cases", tags=["Cases"])
app.include_router(teleconsultor.router, prefix="/teleconsultor", tags=["Teleconsultor"])
app.include_router(telerregulador.router, prefix="/telerregulador", tags=["Telerregulador"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])


@app.get("/")
def root():
    return {"message": "TeleEstomato API online"}


@app.get("/health")
def health():
    return {"status": "ok"}