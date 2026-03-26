from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def telerregulador_index():
    return {"message": "Telerregulador router ok"}