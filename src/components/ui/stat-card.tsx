import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "profit" | "loss" | "cash" | "bank";
  className?: string;
}

const variantStyles = {
  default: {
    bg: "bg-card",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueSuffix: "",
  },
  profit: {
    bg: "bg-card",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    valueSuffix: "",
  },
  loss: {
    bg: "bg-card",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    valueSuffix: "",
  },
  cash: {
    bg: "bg-card",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    valueSuffix: "",
  },
  bank: {
    bg: "bg-card",
    iconBg: "bg-bank/10",
    iconColor: "text-bank",
    valueSuffix: "",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:shadow-soft-lg",
        styles.bg,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tabular-nums tracking-tight">
            {typeof value === "number"
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                }).format(value)
              : value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={cn("rounded-lg p-2.5", styles.iconBg)}>
          <Icon className={cn("h-5 w-5", styles.iconColor)} />
        </div>
      </div>
    </div>
  );
}
