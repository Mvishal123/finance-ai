import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

interface Category {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'expense' | 'income';
  description: string;
  category: Category;
}

export default function AddTransactionPage() {
  const [formData, setFormData] = useState({
    amount: "",
    transaction_type: "expense",
    category_id: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showInitialBalanceForm, setShowInitialBalanceForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch all data in parallel
        const [categoriesRes, statusRes, transactionsRes] = await Promise.all([
          axios.get("http://localhost:8000/transactions/categories", { headers }),
          axios.get("http://localhost:8000/transactions/status", { headers }),
          axios.get("http://localhost:8000/transactions", { headers })
        ]);

        setCategories(categoriesRes.data);
        if (categoriesRes.data.length > 0) {
          setFormData(prev => ({ ...prev, category_id: categoriesRes.data[0].id }));
        }

        setShowInitialBalanceForm(!statusRes.data.has_transactions && statusRes.data.initial_balance === null);
        setTransactions(transactionsRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load data");
      }
    };

    fetchData();
  }, []);

  const handleInitialBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/transactions/initial-balance",
        { balance: parseFloat(formData.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowInitialBalanceForm(false);
      setFormData(prev => ({ ...prev, amount: "" }));
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to set initial balance");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:8000/transactions",
        {
          ...formData,
          amount: parseFloat(formData.amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add new transaction to list and reset form
      setTransactions(prev => [response.data, ...prev]);
      setFormData(prev => ({
        ...prev,
        amount: "",
        description: ""
      }));
      setError("");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to add transaction");
    }
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (showInitialBalanceForm) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Set Initial Balance</CardTitle>
          <CardDescription>Before adding transactions, please set your current balance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInitialBalance} className="space-y-4">
            {error && <div className="text-sm text-red-500 text-center">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="amount">Current Balance</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter your current balance"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Set Balance
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
          <CardDescription>Record a new transaction</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-sm text-red-500 text-center">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.transaction_type}
                onValueChange={(value) => handleChange("transaction_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleChange("category_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange("description", e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              Add Transaction
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className={`p-4 rounded-lg border ${transaction.transaction_type === 'income' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{transaction.category.name}</p>
                      {transaction.description && (
                        <p className="text-sm text-gray-600">{transaction.description}</p>
                      )}
                    </div>
                    <p className={`font-bold ${transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.transaction_type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
