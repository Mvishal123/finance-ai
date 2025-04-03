from fastapi import APIRouter

router = APIRouter(
    prefix="/users",
    tags=["users"]
)


@router.get("/", tags=["users"])
async def read_users():
    return [{"username": "Rick"}, {"username": "Morty"}]