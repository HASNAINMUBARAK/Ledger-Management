import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Search, Trash2, TrendingUp, Loader2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSales } from "@/hooks/useSales";
import { useBusiness } from "@/hooks/useBusiness";
import { useToast } from "@/hooks/use-toast";
import { PaymentMethod } from "@/types/database";
import { cn } from "@/lib/utils";

export default function Sales() {
  const { business } = useBusiness();
  const { sales, loading, fetchSales, addSale, deleteSale } = useSales();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  // Form state
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (business) {
      fetchSales();
    }
  }, [business, fetchSales]);

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    const { error } = await addSale(
      date,
      Number(amount),
      paymentMethod,
      description || undefined
    );
    setSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add sale",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sale added",
        description: "Your sale has been recorded",
      });
      setIsOpen(false);
      resetForm();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await deleteSale(deleteId);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete sale",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Sale deleted",
        description: "The sale has been removed",
      });
    }
    setDeleteId(null);
  };

  const resetForm = () => {
    setDate(format(new Date(), "yyyy-MM-dd"));
    setAmount("");
    setPaymentMethod("CASH");
    setDescription("");
  };

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = sale.description
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesPayment =
      paymentFilter === "all" || sale.payment_method === paymentFilter;
    return (searchQuery === "" || matchesSearch) && matchesPayment;
  });

  const totalFiltered = filteredSales.reduce(
    (sum, s) => sum + Number(s.amount),
    0
  );

  const cashTotal = filteredSales
    .filter((s) => s.payment_method === "CASH")
    .reduce((sum, s) => sum + Number(s.amount), 0);

  const bankTotal = filteredSales
    .filter((s) => s.payment_method === "BANK")
    .reduce((sum, s) => sum + Number(s.amount), 0);

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Sales</h1>
            <p className="text-muted-foreground">
              Track and manage your daily sales
            </p>
          </div>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Sale
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Sale</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={paymentMethod === "CASH" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("CASH")}
                      className="h-12"
                    >
                      💵 Cash
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === "BANK" ? "default" : "outline"}
                      onClick={() => setPaymentMethod("BANK")}
                      className="h-12"
                    >
                      🏦 Bank
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description (Optional)</Label>
                  <Textarea
                    placeholder="Add a description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Sale"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sales..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="BANK">Bank</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border rounded-xl p-4">
            <span className="text-sm text-muted-foreground">Total Sales</span>
            <p className="text-xl font-bold text-success">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalFiltered)}
            </p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <span className="text-sm text-muted-foreground">Cash Sales</span>
            <p className="text-xl font-bold text-warning">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(cashTotal)}
            </p>
          </div>
          <div className="bg-card border rounded-xl p-4">
            <span className="text-sm text-muted-foreground">Bank Sales</span>
            <p className="text-xl font-bold text-bank">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(bankTotal)}
            </p>
          </div>
        </div>

        {/* Sales List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-1">No sales found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || paymentFilter !== "all"
                ? "Try adjusting your filters"
                : "Add your first sale to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSales.map((sale) => (
              <div
                key={sale.id}
                className="bg-card border rounded-xl p-4 flex items-center justify-between hover:shadow-soft-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Sale</span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full",
                          sale.payment_method === "CASH"
                            ? "bg-warning/10 text-warning"
                            : "bg-bank/10 text-bank"
                        )}
                      >
                        {sale.payment_method}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(sale.date), "MMM d, yyyy")}
                      {sale.description && ` • ${sale.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-success">
                    +
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(Number(sale.amount))}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(sale.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Sale</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this sale? This action cannot be
                undone and will update your balance.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
