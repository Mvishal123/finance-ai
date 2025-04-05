import os
import json
from typing import List, Dict
from dotenv import load_dotenv
import google.generativeai as genai
from app.db.model import Transaction

import re

def extract_json(text: str) -> str:
    # Removes triple backticks and anything before/after them
    match = re.search(r"```(?:json)?\s*({.*?})\s*```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text.strip()  # fallback

# Load API Key from environment variable
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError(" ERROR: GEMINI_API_KEY is missing in .env file!")

# Initialize Gemini
genai.configure(api_key=API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

def analyze_transactions(transactions: List[Transaction], initial_balance: float) -> Dict:
    print(" Starting transaction analysis...")

    # Prepare transaction data
    transaction_data = {
        "initial_balance": initial_balance,
        "transactions": [
            {
                "amount": t.amount,
                "type": t.transaction_type.value,
                "category": t.category.name,
                "description": t.description,
                "date": t.created_at.isoformat() if t.created_at else None
            }
            for t in transactions
        ]
    }

    # Compute financial metrics
    total_income = sum(t.amount for t in transactions if t.transaction_type.value == 'income')
    total_expenses = sum(t.amount for t in transactions if t.transaction_type.value == 'expense')
    current_balance = initial_balance + total_income - total_expenses

    # Expenses grouped by category
    expense_by_category = {}
    for t in transactions:
        if t.transaction_type.value == 'expense':
            cat = t.category.name
            expense_by_category[cat] = expense_by_category.get(cat, 0) + t.amount

    # Monthly financial trends
    monthly_data = {}
    for t in transactions:
        if t.created_at:
            month_key = t.created_at.strftime("%Y-%m")
            monthly_data.setdefault(month_key, {"income": 0, "expenses": 0})
            if t.transaction_type.value == 'income':
                monthly_data[month_key]["income"] += t.amount
            else:
                monthly_data[month_key]["expenses"] += t.amount

    # Format amounts in Indian Rupees
    def format_inr(amount: float) -> str:
        return f"₹{amount:,.2f}"

    # Income Analysis Prompt
    income_prompt = f"""As a financial advisor, analyze this data and provide insights:
    - Total Income: {format_inr(total_income)}
    - Balance: {format_inr(current_balance)}
    - Monthly Trends: {json.dumps(monthly_data, indent=2)}
    
    Provide a detailed analysis focusing on income patterns, growth opportunities, and specific actionable recommendations.
    Format your response strictly as a JSON with this structure:
    {{"analysis": "detailed income analysis", "recommendations": ["rec1", "rec2"], "opportunities": ["opp1", "opp2"]}}
    
    Return only valid JSON. Do not include markdown, backticks, or explanation!!!
    """

    # Expense Analysis Prompt
    expense_prompt = f"""As a financial advisor, analyze these spending patterns:
    - Total Expenses: {format_inr(total_expenses)}
    - Expenses By Category: {json.dumps(expense_by_category, indent=2)}
    - Monthly Trends: {json.dumps(monthly_data, indent=2)}
    
    Provide detailed spending analysis, identify patterns, and suggest optimization strategies.
    Format your response strictly as a JSON with this structure:
    {{"analysis": "detailed expense analysis", "optimization": ["opt1", "opt2"], "savings_opportunities": ["save1", "save2"]}}
    
    Return only valid JSON. Do not include markdown, backticks, or explanation!!!
    """

    # Investment Strategy Prompt
    investment_prompt = f"""As a financial advisor, suggest investment strategies based on:
    - Current Balance: {format_inr(current_balance)}
    - Monthly Income: {format_inr(total_income)}
    - Monthly Expenses: {format_inr(total_expenses)}
    - Savings Rate: {((total_income - total_expenses) / total_income * 100) if total_income > 0 else 0}%
    
    Provide detailed investment strategy considering risk tolerance and market conditions.
    Format your response strictly as a JSON with this structure:
    {{"strategy": "detailed strategy", "recommendations": ["rec1", "rec2"], "allocation": {{"stocks": "percent", "bonds": "percent", "cash": "percent"}}}}
    
    Return only valid JSON. Do not include markdown, backticks, or explanation!!!
    """

    try:
        # Generate AI responses
        income_response = model.generate_content(income_prompt)
        expense_response = model.generate_content(expense_prompt)
        investment_response = model.generate_content(investment_prompt)
        
        print("Income Response Text:\n", income_response.text)
        print("Expense Response Text:\n", expense_response.text)
        print("Investment Response Text:\n", investment_response.text)

        # Parse JSON responses
        income_insights = json.loads(extract_json(income_response.text))
        expense_insights = json.loads(extract_json(expense_response.text))
        investment_insights = json.loads(extract_json(investment_response.text))

        # Combine all insights
        return {
            "income_insights": income_insights,
            "expense_insights": expense_insights,
            "investment_insights": investment_insights,
            "metrics": {
                "total_income": total_income,
                "total_expenses": total_expenses,
                "current_balance": current_balance,
                "expense_by_category": expense_by_category,
                "monthly_trends": monthly_data
            }
        }

    except Exception as e:
        print(f" Error generating insights: {str(e)}")
        return {
            "error": "Failed to generate insights",
            "message": str(e),
            "metrics": {
                "total_income": total_income,
                "total_expenses": total_expenses,
                "current_balance": current_balance,
                "expense_by_category": expense_by_category,
                "monthly_trends": monthly_data
            }
        }
