import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import api from '@/lib/axios';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatCurrency } from '@/lib/currency';

interface Insights {
  income_insights: {
    analysis: string;
    recommendations: string[];
    opportunities: string[];
  };
  expense_insights: {
    analysis: string;
    optimization: string[];
    savings_opportunities: string[];
  };
  investment_insights: {
    strategy: string;
    recommendations: string[];
    allocation: Record<string, string>;
  };
  metrics: {
    total_income: number;
    total_expenses: number;
    current_balance: number;
    expense_by_category: Record<string, number>;
    monthly_trends: Record<string, { income: number; expenses: number }>;
  };
}

const InsightsPage = () => {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/transactions/insights');
        setInsights(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch insights:', err);
        setError('Failed to fetch insights. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  // Transform expense by category data for chart
  const expenseChartData = Object.entries(insights?.metrics?.expense_by_category || {}).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  // Transform monthly trends data for chart
  const monthlyChartData = Object.entries(insights?.metrics?.monthly_trends || {}).map(([month, data]) => ({
    name: month,
    income: data.income,
    expenses: data.expenses,
    savings: data.income - data.expenses,
  }));

  // Transform investment allocation data for chart
  const allocationChartData = Object.entries(insights?.investment_insights?.allocation || {}).map(([asset, percentage]) => ({
    name: asset,
    value: parseFloat(percentage),
  }));

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Financial Insights</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <p className="text-2xl font-bold">{formatCurrency(insights?.metrics?.current_balance || 0)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <p className="text-2xl font-bold text-green-600">{formatCurrency(insights?.metrics?.total_income || 0)}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <p className="text-2xl font-bold text-red-600">{formatCurrency(insights?.metrics?.total_expenses || 0)}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Tabs defaultValue="income" className="space-y-4">
          <TabsList>
            <TabsTrigger value="income">Income Analysis</TabsTrigger>
            <TabsTrigger value="expenses">Expense Analysis</TabsTrigger>
            <TabsTrigger value="investment">Investment Strategy</TabsTrigger>
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Income Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : (
                  <>
                    <p className="text-gray-700">{insights?.income_insights?.analysis || 'No analysis available'}</p>
                    <div>
                      <h3 className="font-semibold mb-2">Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {insights?.income_insights?.recommendations?.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        )) || <li>No recommendations available</li>}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Opportunities</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {insights?.income_insights?.opportunities?.map((opp, i) => (
                          <li key={i}>{opp}</li>
                        )) || <li>No opportunities identified</li>}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle>Expense Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={expenseChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-gray-700">{insights?.expense_insights?.analysis || 'No analysis available'}</p>
                    <div>
                      <h3 className="font-semibold mb-2">Optimization Suggestions</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {insights?.expense_insights?.optimization?.map((opt, i) => (
                          <li key={i}>{opt}</li>
                        )) || <li>No optimization suggestions available</li>}
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Savings Opportunities</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {insights?.expense_insights?.savings_opportunities?.map((save, i) => (
                          <li key={i}>{save}</li>
                        )) || <li>No savings opportunities identified</li>}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="investment">
            <Card>
              <CardHeader>
                <CardTitle>Investment Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={allocationChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-gray-700">{insights?.investment_insights?.strategy || 'No strategy available'}</p>
                    <div>
                      <h3 className="font-semibold mb-2">Investment Recommendations</h3>
                      <ul className="list-disc pl-5 space-y-1">
                        {insights?.investment_insights?.recommendations?.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        )) || <li>No recommendations available</li>}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="income" stroke="#8884d8" />
                        <Line type="monotone" dataKey="expenses" stroke="#82ca9d" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default InsightsPage;
