import { useState, useEffect } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
} from "date-fns";
import { Calendar, Download, Filter } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusiness } from "@/hooks/useBusiness";
import { useExpenses } from "@/hooks/useExpenses";
import { useSales } from "@/hooks/useSales";
import { PnLReport, ExpenseCategory } from "@/types/database";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const EXPENSE_COLORS: Record<ExpenseCategory, string> = {
  FOOD: "#10b981",
  STAFF: "#3b82f6",
  ELECTRICITY: "#f59e0b",
  RENT: "#8b5cf6",
  MAINTENANCE: "#ec4899",
  OTHER: "#6b7280",
};

type DateRange = "today" | "week" | "month" | "custom";

export default function Reports() {
  const { business } = useBusiness();
  const { expenses, fetchExpenses } = useExpenses();
  const { sales, fetchSales } = useSales();

  const [dateRange, setDateRange] = useState<DateRange>("month");
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), "yyyy-MM-dd")
  );
  const [report, setReport] = useState<PnLReport | null>(null);

  useEffect(() => {
    let start: Date;
    let end: Date;

    switch (dateRange) {
      case "today":
        start = startOfDay(new Date());
        end = endOfDay(new Date());
        break;
      case "week":
        start = startOfWeek(new Date(), { weekStartsOn: 1 });
        end = endOfWeek(new Date(), { weekStartsOn: 1 });
        break;
      case "month":
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
        break;
      case "custom":
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start = startOfMonth(new Date());
        end = endOfMonth(new Date());
    }

    if (dateRange !== "custom") {
      setStartDate(format(start, "yyyy-MM-dd"));
      setEndDate(format(end, "yyyy-MM-dd"));
    }
  }, [dateRange]);

  useEffect(() => {
    if (business) {
      fetchExpenses(startDate, endDate);
      fetchSales(startDate, endDate);
    }
  }, [business, startDate, endDate, fetchExpenses, fetchSales]);

  useEffect(() => {
    const totalSales = sales.reduce((sum, s) => sum + Number(s.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalSales - totalExpenses;

    const salesByMethod = {
      cash: sales
        .filter((s) => s.payment_method === "CASH")
        .reduce((sum, s) => sum + Number(s.amount), 0),
      bank: sales
        .filter((s) => s.payment_method === "BANK")
        .reduce((sum, s) => sum + Number(s.amount), 0),
    };

    const expensesByMethod = {
      cash: expenses
        .filter((e) => e.payment_method === "CASH")
        .reduce((sum, e) => sum + Number(e.amount), 0),
      bank: expenses
        .filter((e) => e.payment_method === "BANK")
        .reduce((sum, e) => sum + Number(e.amount), 0),
    };

    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] =
        (acc[expense.category] || 0) + Number(expense.amount);
      return acc;
    }, {} as Record<ExpenseCategory, number>);

    setReport({
      totalSales,
      totalExpenses,
      netProfit,
      salesByMethod,
      expensesByMethod,
      expensesByCategory,
    });
  }, [sales, expenses]);

  const barChartData = [
    {
      name: "Cash",
      sales: report?.salesByMethod.cash || 0,
      expenses: report?.expensesByMethod.cash || 0,
    },
    {
      name: "Bank",
      sales: report?.salesByMethod.bank || 0,
      expenses: report?.expensesByMethod.bank || 0,
    },
  ];

  const pieChartData = Object.entries(report?.expensesByCategory || {}).map(
    ([name, value]) => ({
      name,
      value,
      color: EXPENSE_COLORS[name as ExpenseCategory],
    })
  );

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Profit & Loss Report</h1>
            <p className="text-muted-foreground">
              View your financial performance
            </p>
          </div>
        </div>

        {/* Date Filters */}
        <div className="bg-card border rounded-xl p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label>Period</Label>
              <Select
                value={dateRange}
                onValueChange={(v) => setDateRange(v as DateRange)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Sales</span>
              <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                <span className="text-success font-bold">+</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-success">
              {formatCurrency(report?.totalSales || 0)}
            </p>
            <div className="mt-3 flex gap-4 text-sm">
              <span className="text-muted-foreground">
                Cash:{" "}
                <span className="text-warning font-medium">
                  {formatCurrency(report?.salesByMethod.cash || 0)}
                </span>
              </span>
              <span className="text-muted-foreground">
                Bank:{" "}
                <span className="text-bank font-medium">
                  {formatCurrency(report?.salesByMethod.bank || 0)}
                </span>
              </span>
            </div>
          </div>

          <div className="bg-card border rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Total Expenses
              </span>
              <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive font-bold">-</span>
              </div>
            </div>
            <p className="text-3xl font-bold text-destructive">
              {formatCurrency(report?.totalExpenses || 0)}
            </p>
            <div className="mt-3 flex gap-4 text-sm">
              <span className="text-muted-foreground">
                Cash:{" "}
                <span className="text-warning font-medium">
                  {formatCurrency(report?.expensesByMethod.cash || 0)}
                </span>
              </span>
              <span className="text-muted-foreground">
                Bank:{" "}
                <span className="text-bank font-medium">
                  {formatCurrency(report?.expensesByMethod.bank || 0)}
                </span>
              </span>
            </div>
          </div>

          <div
            className={cn(
              "border rounded-xl p-6",
              (report?.netProfit || 0) >= 0
                ? "bg-success/5 border-success/20"
                : "bg-destructive/5 border-destructive/20"
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Net Profit</span>
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  (report?.netProfit || 0) >= 0
                    ? "bg-success/20"
                    : "bg-destructive/20"
                )}
              >
                <span
                  className={cn(
                    "font-bold",
                    (report?.netProfit || 0) >= 0
                      ? "text-success"
                      : "text-destructive"
                  )}
                >
                  {(report?.netProfit || 0) >= 0 ? "↑" : "↓"}
                </span>
              </div>
            </div>
            <p
              className={cn(
                "text-3xl font-bold",
                (report?.netProfit || 0) >= 0 ? "text-success" : "text-destructive"
              )}
            >
              {formatCurrency(report?.netProfit || 0)}
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              {(report?.netProfit || 0) >= 0
                ? "You're making profit! 🎉"
                : "Expenses exceed sales this period"}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Cash vs Bank Comparison</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar
                    dataKey="sales"
                    name="Sales"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="expenses"
                    name="Expenses"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className="font-semibold mb-4">Expense Breakdown by Category</h3>
            {pieChartData.length > 0 ? (
              <>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {pieChartData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="capitalize">
                          {item.name.toLowerCase()}
                        </span>
                      </div>
                      <span className="font-medium">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No expense data for this period
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
