import { useEffect, useState } from "react";
import { format, startOfMonth, endOfMonth, subDays } from "date-fns";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Building,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/hooks/useBusiness";
import { useExpenses } from "@/hooks/useExpenses";
import { useSales } from "@/hooks/useSales";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const EXPENSE_COLORS = {
  FOOD: "#10b981",
  STAFF: "#3b82f6",
  ELECTRICITY: "#f59e0b",
  RENT: "#8b5cf6",
  MAINTENANCE: "#ec4899",
  OTHER: "#6b7280",
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { business } = useBusiness();
  const { expenses, fetchExpenses } = useExpenses();
  const { sales, fetchSales } = useSales();
  const [chartData, setChartData] = useState<any[]>([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState<any[]>([]);

  useEffect(() => {
    if (business) {
      const start = format(startOfMonth(new Date()), "yyyy-MM-dd");
      const end = format(endOfMonth(new Date()), "yyyy-MM-dd");
      fetchExpenses(start, end);
      fetchSales(start, end);
    }
  }, [business, fetchExpenses, fetchSales]);

  useEffect(() => {
    // Calculate chart data for last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const daySales = sales
        .filter((s) => s.date === dateStr)
        .reduce((sum, s) => sum + Number(s.amount), 0);
      const dayExpenses = expenses
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      return {
        date: format(date, "MMM dd"),
        sales: daySales,
        expenses: dayExpenses,
      };
    });
    setChartData(last7Days);

    // Calculate expense breakdown
    const breakdown = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(breakdown).map(([name, value]) => ({
      name,
      value,
      color: EXPENSE_COLORS[name as keyof typeof EXPENSE_COLORS],
    }));
    setExpenseBreakdown(pieData);
  }, [sales, expenses]);

  const totalSales = sales.reduce((sum, s) => sum + Number(s.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netProfit = totalSales - totalExpenses;

  const todaysSales = sales
    .filter((s) => s.date === format(new Date(), "yyyy-MM-dd"))
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const todaysExpenses = expenses
    .filter((e) => e.date === format(new Date(), "yyyy-MM-dd"))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              {format(new Date(), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate("/expenses")}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
            <Button onClick={() => navigate("/sales")} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Sale
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Cash Balance"
            value={Number(business?.cash_balance || 0)}
            icon={Wallet}
            variant="cash"
            subtitle="Available cash"
          />
          <StatCard
            title="Bank Balance"
            value={Number(business?.bank_balance || 0)}
            icon={Building}
            variant="bank"
            subtitle="In bank account"
          />
          <StatCard
            title="Today's Sales"
            value={todaysSales}
            icon={TrendingUp}
            variant="profit"
            subtitle={`${sales.filter((s) => s.date === format(new Date(), "yyyy-MM-dd")).length} transactions`}
          />
          <StatCard
            title="Today's Expenses"
            value={todaysExpenses}
            icon={TrendingDown}
            variant="loss"
            subtitle={`${expenses.filter((e) => e.date === format(new Date(), "yyyy-MM-dd")).length} transactions`}
          />
        </div>

        {/* Monthly Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Monthly Sales</span>
              <ArrowUpRight className="h-4 w-4 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalSales)}
            </p>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Monthly Expenses</span>
              <ArrowDownRight className="h-4 w-4 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalExpenses)}
            </p>
          </div>
          <div className="bg-card border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Net Profit</span>
              {netProfit >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-success" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              )}
            </div>
            <p
              className={`text-2xl font-bold ${
                netProfit >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(netProfit)}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Area Chart */}
          <div className="lg:col-span-2 bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Sales vs Expenses (Last 7 Days)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                    formatter={(value: number) =>
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(value)
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#salesGradient)"
                    name="Sales"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#expensesGradient)"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Expense Breakdown</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                      }).format(value)
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {expenseBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="capitalize">{item.name.toLowerCase()}</span>
                  </div>
                  <span className="font-medium">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
