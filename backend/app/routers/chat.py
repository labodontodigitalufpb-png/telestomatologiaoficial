from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def chat_index():
    return {"message": "Chat router ok"}