import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/currency";

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'expense' | 'income';
  description: string;
  category: {
    id: string;
    name: string;
  };
}

interface CategoryTotal {
  category: string;
  total: number;
  percentage: number;
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [initialBalance, setInitialBalance] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, statusRes] = await Promise.all([
          axios.get("http://localhost:8000/transactions", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:8000/transactions/status", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setTransactions(transactionsRes.data);
        setInitialBalance(statusRes.data.initial_balance || 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Calculate KPIs
  useEffect(() => {
    const totalIncome = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentBalance = (initialBalance || 0) + totalIncome - totalExpenses;

    setTotalIncome(totalIncome);
    setTotalExpenses(totalExpenses);
    setCurrentBalance(currentBalance);
  }, [transactions, initialBalance]);

  // Calculate category totals for expenses
  const expensesByCategory: CategoryTotal[] = Object.values(
    transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((acc, t) => {
        const cat = t.category.name;
        if (!acc[cat]) acc[cat] = { category: cat, total: 0, percentage: 0 };
        acc[cat].total += t.amount;
        return acc;
      }, {} as Record<string, CategoryTotal>)
  ).map(cat => ({
    ...cat,
    percentage: (cat.total / totalExpenses) * 100
  })).sort((a, b) => b.total - a.total);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-8 p-8">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
            <Progress className="mt-2" value={Math.max(0, Math.min(100, (currentBalance / (initialBalance || 1)) * 100))} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">{transactions.filter(t => t.transaction_type === 'income').length} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">{transactions.filter(t => t.transaction_type === 'expense').length} transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
          <CardDescription>Your spending by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expensesByCategory.map(({ category, total, percentage }) => (
              <div key={category}>
                <div className="flex items-center justify-between mb-1">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{category}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(total)}</p>
                  </div>
                  <p className="text-sm font-medium">{percentage.toFixed(1)}%</p>
                </div>
                <Progress value={percentage} />
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest financial activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.slice(0, 5).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{transaction.category.name}</p>
                  <p className="text-xs text-muted-foreground">{transaction.description || 'No description'}</p>
                </div>
                <p className={`text-sm font-medium ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.transaction_type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
