import { useState } from "react";
import { Building2, User, CreditCard, LogOut, Loader2 } from "lucide-react";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BusinessType } from "@/types/database";

export default function Settings() {
  const { business, refreshBusiness } = useBusiness();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [businessName, setBusinessName] = useState(business?.name || "");
  const [businessType, setBusinessType] = useState<BusinessType>(
    business?.type || "RESTAURANT"
  );
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    if (!business) return;

    setSaving(true);
    const { error } = await supabase
      .from("businesses")
      .update({
        name: businessName,
        type: businessType,
      })
      .eq("id", business.id);

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Settings saved",
        description: "Your business settings have been updated",
      });
      refreshBusiness();
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and business settings
          </p>
        </div>

        {/* Account Section */}
        <div className="bg-card border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Account</h2>
              <p className="text-sm text-muted-foreground">
                Your personal information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="bg-muted" />
            </div>
          </div>
        </div>

        {/* Business Section */}
        <div className="bg-card border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Business</h2>
              <p className="text-sm text-muted-foreground">
                Your business information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter business name"
              />
            </div>

            <div className="space-y-2">
              <Label>Business Type</Label>
              <Select
                value={businessType}
                onValueChange={(v) => setBusinessType(v as BusinessType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOTEL">Hotel</SelectItem>
                  <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSaveSettings} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>

        {/* Subscription Section */}
        <div className="bg-card border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">Subscription</h2>
              <p className="text-sm text-muted-foreground">
                Manage your subscription plan
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-accent/50 border border-accent">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Trial Plan</p>
                <p className="text-sm text-muted-foreground">
                  You're currently on the free trial
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                Active
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Stripe payment integration coming soon. For now, enjoy full access
            to all features during your trial period.
          </p>
        </div>

        {/* Danger Zone */}
        <div className="bg-card border border-destructive/20 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
              <LogOut className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h2 className="font-semibold">Sign Out</h2>
              <p className="text-sm text-muted-foreground">
                Sign out of your account
              </p>
            </div>
          </div>

          <Button variant="destructive" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
