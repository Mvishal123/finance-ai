from sqlalchemy.orm import Session
from app.db.database import get_db, engine
from app.db.model import Base, Category

# List of default categories
DEFAULT_CATEGORIES = {
    "expense": [
        "Food & Dining",
        "Transportation",
        "Housing",
        "Utilities",
        "Healthcare",
        "Shopping",
        "Entertainment",
        "Education",
        "Insurance",
        "Savings",
        "Miscellaneous"
    ],
    "income": [
        "Salary",
        "Freelance",
        "Investments",
        "Rental Income",
        "Business",
        "Other Income"
    ]
}

def seed_categories(db: Session):
    # Check if categories already exist
    existing_categories = db.query(Category).all()
    if existing_categories:
        print("Categories already seeded. Skipping...")
        return

    # Add expense categories
    for category_name in DEFAULT_CATEGORIES["expense"]:
        category = Category(name=category_name)
        db.add(category)

    # Add income categories
    for category_name in DEFAULT_CATEGORIES["income"]:
        category = Category(name=category_name)
        db.add(category)

    db.commit()
    print("Categories seeded successfully!")

def main():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Get DB session
    db = next(get_db())
    
    try:
        # Seed categories
        seed_categories(db)
    finally:
        db.close()

if __name__ == "__main__":
    main()
