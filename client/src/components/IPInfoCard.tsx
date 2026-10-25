import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, MapPin, Building, Server, AlertTriangle } from "lucide-react";
import type { IPInfo } from "@shared/schema";

interface IPInfoCardProps {
  ipInfo: IPInfo;
}

export function IPInfoCard({ ipInfo }: IPInfoCardProps) {
  if (!ipInfo) {
    return (
      <Card data-testid="card-ip-info">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>IP & Geolocation</CardTitle>
          </div>
          <CardDescription>IP address and network information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p data-testid="text-no-ip-info">No IP information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRiskBadge = (riskScore?: number) => {
    if (!riskScore) return null;
    if (riskScore >= 70) return { variant: "default" as const, className: "bg-red-600 dark:bg-red-700", label: "High Risk" };
    if (riskScore >= 40) return { variant: "default" as const, className: "bg-orange-600 dark:bg-orange-700", label: "Medium Risk" };
    return { variant: "default" as const, className: "bg-green-600 dark:bg-green-700", label: "Low Risk" };
  };

  const riskBadge = getRiskBadge(ipInfo.riskScore);

  return (
    <Card data-testid="card-ip-info">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>IP & Geolocation</CardTitle>
          </div>
          {riskBadge && (
            <Badge variant={riskBadge.variant} className={riskBadge.className} data-testid="badge-risk-score">
              {riskBadge.label}: {ipInfo.riskScore}/100
            </Badge>
          )}
        </div>
        <CardDescription>IP address and network information</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* IP Address */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Network Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">IP Address</p>
              <p className="font-mono font-semibold text-lg" data-testid="ip-address">
                {ipInfo.ipAddress}
              </p>
            </div>
            {ipInfo.hostname && (
              <div className="border rounded-md p-3 space-y-1">
                <p className="text-xs text-muted-foreground">Hostname</p>
                <p className="font-mono text-sm" data-testid="ip-hostname">
                  {ipInfo.hostname}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">ASN</p>
              <p className="font-mono font-medium" data-testid="ip-asn">
                {ipInfo.asn}
              </p>
            </div>
            <div className="border rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">ISP</p>
              <p className="font-medium" data-testid="ip-isp">
                {ipInfo.isp}
              </p>
            </div>
          </div>
        </div>

        {/* Organization */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Organization</h3>
          </div>
          <div className="border rounded-md p-3">
            <p className="font-medium" data-testid="ip-organization">
              {ipInfo.organization}
            </p>
          </div>
        </div>

        {/* Geolocation */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Geographic Location</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Country</p>
              <p className="font-medium" data-testid="ip-country">
                {ipInfo.country}
              </p>
            </div>
            <div className="border rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Region/State</p>
              <p className="font-medium" data-testid="ip-region">
                {ipInfo.region}
              </p>
            </div>
            <div className="border rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">City</p>
              <p className="font-medium" data-testid="ip-city">
                {ipInfo.city}
              </p>
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        {ipInfo.riskScore && ipInfo.riskScore >= 70 && (
          <div className="border rounded-md p-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">High Risk IP Address</p>
                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                  This IP address has been flagged as potentially risky. Exercise caution when interacting with this server.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
