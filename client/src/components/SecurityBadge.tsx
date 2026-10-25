import { Badge } from "@/components/ui/badge";
import { SeverityLevel } from "@shared/schema";
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, Info } from "lucide-react";

interface SecurityBadgeProps {
  severity: SeverityLevel;
  showIcon?: boolean;
  className?: string;
}

const severityConfig = {
  critical: {
    variant: "default" as const,
    className: "bg-critical text-critical-foreground border-critical-border",
    icon: ShieldAlert,
    label: "Critical",
  },
  high: {
    variant: "default" as const,
    className: "bg-high text-high-foreground border-high-border",
    icon: AlertTriangle,
    label: "High",
  },
  medium: {
    variant: "default" as const,
    className: "bg-medium text-medium-foreground border-medium-border",
    icon: AlertTriangle,
    label: "Medium",
  },
  low: {
    variant: "default" as const,
    className: "bg-low text-low-foreground border-low-border",
    icon: Info,
    label: "Low",
  },
  pass: {
    variant: "default" as const,
    className: "bg-success text-success-foreground border-success-border",
    icon: ShieldCheck,
    label: "Pass",
  },
};

export function SecurityBadge({ severity, showIcon = false, className = "" }: SecurityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} text-xs font-medium uppercase tracking-wide`}
      data-testid={`badge-severity-${severity}`}
    >
      {showIcon && <Icon className="w-3 h-3 mr-1" />}
      {config.label}
    </Badge>
  );
}
