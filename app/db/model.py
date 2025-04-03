from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from uuid import uuid4

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=uuid4)
    username = Column(String, unique=True, index=True, nullable=False)
    transactions = relationship("Transaction", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, index=True, default=uuid4)
    name = Column(String, unique=True, index=True, nullable=False)
    transactions = relationship("Transaction", back_populates="category")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True, default=uuid4)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="transactions")
    amount = Column(Float, nullable=False)
    category_id = Column(String, ForeignKey("categories.id"), nullable=False)
    category = relationship("Category", back_populates="transactions")
    description = Column(String)