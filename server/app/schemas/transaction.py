from pydantic import BaseModel, UUID4, confloat
from app.db.model import TransactionType
from typing import Optional

class CategoryResponse(BaseModel):
    id: UUID4
    name: str

    class Config:
        from_attributes = True

class TransactionCreate(BaseModel):
    amount: confloat(gt=0)  # Must be positive
    transaction_type: TransactionType
    category_id: UUID4
    description: Optional[str] = None

class TransactionResponse(BaseModel):
    id: UUID4
    amount: float
    transaction_type: TransactionType
    category_id: UUID4
    category: CategoryResponse
    description: Optional[str]
    user_id: UUID4

    class Config:
        from_attributes = True
