from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def dashboard_index():
    return {"message": "Dashboard router ok"}