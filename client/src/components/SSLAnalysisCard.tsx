import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SSLCertificate, Vulnerability } from "@shared/schema";
import { SecurityBadge } from "./SecurityBadge";
import { Lock, Calendar, Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface SSLAnalysisCardProps {
  certificate: SSLCertificate;
  issues: Vulnerability[];
}

export function SSLAnalysisCard({ certificate, issues }: SSLAnalysisCardProps) {
  const isExpiringSoon = certificate.daysRemaining < 30;
  const isValid = certificate.valid && certificate.daysRemaining > 0;

  return (
    <Card className="border-card-border" data-testid="card-ssl-analysis">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${isValid ? 'bg-success/10' : 'bg-critical/10'}`}>
            <Lock className={`w-5 h-5 ${isValid ? 'text-success' : 'text-critical'}`} />
          </div>
          <CardTitle className="text-xl">SSL/TLS Certificate</CardTitle>
        </div>
        <SecurityBadge severity={isValid ? "pass" : "critical"} />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Issuer</div>
            <div className="text-sm font-medium font-mono" data-testid="text-issuer">
              {certificate.issuer}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Protocol</div>
            <div className="text-sm font-medium" data-testid="text-protocol">
              {certificate.protocol}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Valid From</div>
            <div className="text-sm font-medium">
              {format(new Date(certificate.validFrom), "PPP")}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Valid To</div>
            <div className="text-sm font-medium flex items-center gap-2">
              {format(new Date(certificate.validTo), "PPP")}
              {isExpiringSoon && (
                <AlertTriangle className="w-4 h-4 text-high" />
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Days Remaining</div>
            <div className={`text-2xl font-bold ${isExpiringSoon ? 'text-high' : 'text-success'}`} data-testid="text-days-remaining">
              {certificate.daysRemaining}
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Cipher Suite</div>
            <div className="text-sm font-medium font-mono">
              {certificate.cipher}
            </div>
          </div>
        </div>

        {issues.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-high" />
              SSL/TLS Issues
            </h4>
            <div className="space-y-2">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-3 rounded-md bg-muted/50 text-sm"
                  data-testid={`issue-${issue.id}`}
                >
                  <div className="flex items-start gap-2">
                    <SecurityBadge severity={issue.severity} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="font-medium">{issue.title}</div>
                      <div className="text-muted-foreground text-xs mt-1">
                        {issue.description}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
