from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.db.model import Transaction, TransactionType, Category, User
from app.auth.jwt import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionResponse, CategoryResponse
from uuid import UUID

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"]
)

@router.post("", response_model=TransactionResponse)
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    # Get user from database
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify category exists
    category = db.query(Category).filter(Category.id == transaction.category_id).first()
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )

    # Create transaction
    db_transaction = Transaction(
        amount=transaction.amount,
        transaction_type=transaction.transaction_type,
        category_id=transaction.category_id,
        description=transaction.description,
        user_id=user.id
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    # Re-query to get the transaction with category
    return db.query(Transaction).join(Transaction.category).filter(Transaction.id == db_transaction.id).first()

@router.get("/categories", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    transactions = db.query(Transaction).join(Transaction.category).filter(Transaction.user_id == user.id).all()
    return transactions

@router.get("/status")
def get_transaction_status(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user has any transactions
    has_transactions = db.query(Transaction).filter(Transaction.user_id == user.id).first() is not None
    
    return {
        "has_transactions": has_transactions,
        "initial_balance": user.initial_balance
    }

from pydantic import BaseModel

class InitialBalanceRequest(BaseModel):
    balance: float

@router.post("/initial-balance")
def set_initial_balance(
    request: InitialBalanceRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    user = db.query(User).filter(User.username == current_user).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.initial_balance = request.balance
    db.commit()
    
    return {"message": "Initial balance set successfully"}
