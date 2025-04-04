from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.auth.jwt import get_current_user
from app.routers.users import router as AuthRouter
from app.routers.transactions import router as TransactionRouter

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(AuthRouter)
app.include_router(TransactionRouter)

@app.get("/protected")
def protected_route(user: str = Depends(get_current_user)):
    return {"message": f"Hello {user}, you are authenticated!"}

@app.get("/")
def read_root():
    return {"message": "Welcome to FinAI API"}