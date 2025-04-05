import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from uuid import UUID
from app.db.model import Transaction, TransactionType, Category
from app.db.database import SessionLocal

# Replace with your actual user_id
USER_ID = UUID("7159fa8f-0eb6-4267-adac-07fdf01ea6ed")

# Target months (last 5 including current)
NUM_MONTHS = 5
TODAY = datetime.now()


def get_date_within_month(year: int, month: int) -> datetime:
    """Return a random date within the given year/month."""
    start = datetime(year, month, 1)
    # handle December edge case
    if month == 12:
        end = datetime(year + 1, 1, 1)
    else:
        end = datetime(year, month + 1, 1)
    delta = end - start
    random_days = random.randint(0, delta.days - 1)
    return start + timedelta(days=random_days)


def seed_mock_transactions(db: Session):
    print("🌱 Seeding mock transactions...")

    categories = db.query(Category).all()
    if not categories:
        print("⚠️ No categories found in DB. Add categories before seeding transactions.")
        return

    income_cats = [c for c in categories if "salary" in c.name.lower() or "income" in c.name.lower()]
    expense_cats = [c for c in categories if c not in income_cats]

    for i in range(NUM_MONTHS):
        # Target month
        month_date = TODAY - timedelta(days=i * 30)
        year, month = month_date.year, month_date.month

        # Add 1–2 income transactions
        for _ in range(random.randint(1, 2)):
            date = get_date_within_month(year, month)
            income_cat = random.choice(income_cats)
            txn = Transaction(
                user_id=USER_ID,
                amount=round(random.uniform(4000, 7000), 2),
                transaction_type=TransactionType.INCOME,
                category_id=income_cat.id,
                description="Monthly salary or freelance income",
                created_at=date
            )
            db.add(txn)

        # Add 5–8 expense transactions
        for _ in range(random.randint(5, 8)):
            date = get_date_within_month(year, month)
            expense_cat = random.choice(expense_cats)
            txn = Transaction(
                user_id=USER_ID,
                amount=round(random.uniform(100, 1500), 2),
                transaction_type=TransactionType.EXPENSE,
                category_id=expense_cat.id,
                description="Monthly expense",
                created_at=date
            )
            db.add(txn)

    db.commit()
    print("✅ Seed completed successfully!")


if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_mock_transactions(db)
    finally:
        db.close()
