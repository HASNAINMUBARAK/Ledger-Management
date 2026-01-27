import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useBusiness } from "@/hooks/useBusiness";
import { Building2, TrendingUp, Receipt, PieChart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { business, loading: businessLoading } = useBusiness();

  useEffect(() => {
    if (!authLoading && !businessLoading) {
      if (user) {
        if (business) {
          navigate("/dashboard");
        } else {
          navigate("/onboarding");
        }
      }
    }
  }, [user, business, authLoading, businessLoading, navigate]);

  if (authLoading || businessLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">FinTrack</span>
            </div>
            <Button onClick={() => navigate("/auth")}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Simple Financial Tracking for{" "}
              <span className="text-primary">Hotels & Restaurants</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Track daily expenses, sales, and profits with ease. Built for
              small hospitality businesses who need clear financial visibility
              without accounting complexity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={() => navigate("/auth")}>
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Everything you need to manage your finances
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop juggling spreadsheets. FinTrack gives you real-time insights
              into your business performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border rounded-2xl p-6 hover:shadow-soft-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Sales Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Record daily sales instantly with cash or bank separation
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 hover:shadow-soft-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <Receipt className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-semibold mb-2">Expense Management</h3>
              <p className="text-sm text-muted-foreground">
                Categorize expenses and track where your money goes
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 hover:shadow-soft-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold mb-2">Balance Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Real-time cash and bank balance updates automatically
              </p>
            </div>

            <div className="bg-card border rounded-2xl p-6 hover:shadow-soft-lg transition-shadow">
              <div className="h-12 w-12 rounded-xl bg-bank/10 flex items-center justify-center mb-4">
                <PieChart className="h-6 w-6 text-bank" />
              </div>
              <h3 className="font-semibold mb-2">P&L Reports</h3>
              <p className="text-sm text-muted-foreground">
                Instant profit & loss reports with beautiful visualizations
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join hundreds of hotels and restaurants already using FinTrack to
            simplify their financial management.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")}>
            Get Started for Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">FinTrack</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 FinTrack. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
