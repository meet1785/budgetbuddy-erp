import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statCardVariants = cva(
  "rounded-lg p-6 bg-gradient-card shadow-card border transition-smooth hover:shadow-elevated",
  {
    variants: {
      variant: {
        default: "border-border",
        success: "border-success/20 bg-success-light/50",
        warning: "border-warning/20 bg-warning-light/50",
        accent: "border-accent/20 bg-accent-light/50",
        primary: "border-primary/20 bg-gradient-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface StatCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, variant, title, value, change, changeType, icon, ...props }, ref) => {
    return (
      <div
        className={cn(statCardVariants({ variant, className }))}
        ref={ref}
        {...props}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className={cn(
              "text-sm font-medium",
              variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {title}
            </p>
            <div className="flex items-baseline space-x-2">
              <h3 className={cn(
                "text-2xl font-bold tracking-tight",
                variant === "primary" ? "text-primary-foreground" : "text-foreground"
              )}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </h3>
              {change && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    changeType === "positive" && "text-success",
                    changeType === "negative" && "text-destructive",
                    changeType === "neutral" && "text-muted-foreground",
                    variant === "primary" && "text-primary-foreground/80"
                  )}
                >
                  {change}
                </span>
              )}
            </div>
          </div>
          {icon && (
            <div className={cn(
              "p-2 rounded-lg",
              variant === "primary" ? "bg-primary-foreground/10" : "bg-muted"
            )}>
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);
StatCard.displayName = "StatCard";

export { StatCard, statCardVariants };