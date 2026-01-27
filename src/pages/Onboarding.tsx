import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Hotel, UtensilsCrossed, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBusiness } from "@/hooks/useBusiness";
import { useToast } from "@/hooks/use-toast";
import { BusinessType } from "@/types/database";
import { cn } from "@/lib/utils";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { createBusiness } = useBusiness();
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!businessName.trim() || !businessType) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await createBusiness(businessName, businessType);
    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create business. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome to FinTrack!",
        description: "Your business has been set up successfully.",
      });
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Set up your business</h1>
          <p className="text-muted-foreground mt-1">
            Let's get your financial tracking ready
          </p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-soft-lg">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  placeholder="My Restaurant"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="h-12"
                />
              </div>

              <Button
                className="w-full h-12"
                onClick={() => setStep(2)}
                disabled={!businessName.trim()}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-3">
                <Label>Business Type</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setBusinessType("HOTEL")}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                      businessType === "HOTEL"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center",
                        businessType === "HOTEL"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <Hotel className="h-6 w-6" />
                    </div>
                    <span className="font-medium">Hotel</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBusinessType("RESTAURANT")}
                    className={cn(
                      "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all",
                      businessType === "RESTAURANT"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center",
                        businessType === "RESTAURANT"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <UtensilsCrossed className="h-6 w-6" />
                    </div>
                    <span className="font-medium">Restaurant</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 h-12"
                  onClick={handleSubmit}
                  disabled={!businessType || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step indicator */}
          <div className="flex justify-center gap-2 mt-6">
            <div
              className={cn(
                "h-2 w-8 rounded-full transition-colors",
                step === 1 ? "bg-primary" : "bg-muted"
              )}
            />
            <div
              className={cn(
                "h-2 w-8 rounded-full transition-colors",
                step === 2 ? "bg-primary" : "bg-muted"
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
