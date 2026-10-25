import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle, XCircle, Shield, AlertTriangle } from "lucide-react";
import type { EmailSecurity } from "@shared/schema";

interface EmailSecurityCardProps {
  emailSecurity: EmailSecurity;
}

export function EmailSecurityCard({ emailSecurity }: EmailSecurityCardProps) {
  if (!emailSecurity) {
    return (
      <Card data-testid="card-email-security">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Email Security</CardTitle>
          </div>
          <CardDescription>SPF, DKIM, and DMARC configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p data-testid="text-no-email-security">No email security data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { variant: "default" as const, className: "bg-green-600 dark:bg-green-700", label: "Good" };
    if (score >= 50) return { variant: "default" as const, className: "bg-yellow-600 dark:bg-yellow-700", label: "Fair" };
    return { variant: "default" as const, className: "bg-red-600 dark:bg-red-700", label: "Poor" };
  };

  const scoreBadge = getScoreBadge(emailSecurity.score);

  return (
    <Card data-testid="card-email-security">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>Email Security</CardTitle>
          </div>
          <Badge variant={scoreBadge.variant} className={scoreBadge.className} data-testid="badge-email-score">
            Score: {emailSecurity.score}/100 - {scoreBadge.label}
          </Badge>
        </div>
        <CardDescription>Email authentication and anti-spoofing configuration</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Security Protocols Check */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Security Protocols</h3>
          </div>

          <div className="space-y-2">
            {/* SPF */}
            <div className="flex items-center justify-between border rounded-md p-3" data-testid="protocol-spf">
              <div className="flex items-center gap-3">
                {emailSecurity.hasSPF ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                )}
                <div>
                  <p className="font-semibold">SPF (Sender Policy Framework)</p>
                  <p className="text-xs text-muted-foreground">Prevents email spoofing</p>
                </div>
              </div>
              <Badge variant={emailSecurity.hasSPF ? "default" : "outline"} className={emailSecurity.hasSPF ? "bg-green-600 dark:bg-green-700" : ""}>
                {emailSecurity.hasSPF ? "Configured" : "Missing"}
              </Badge>
            </div>

            {/* DKIM */}
            <div className="flex items-center justify-between border rounded-md p-3" data-testid="protocol-dkim">
              <div className="flex items-center gap-3">
                {emailSecurity.hasDKIM ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                )}
                <div>
                  <p className="font-semibold">DKIM (DomainKeys Identified Mail)</p>
                  <p className="text-xs text-muted-foreground">Verifies email authenticity</p>
                </div>
              </div>
              <Badge variant={emailSecurity.hasDKIM ? "default" : "outline"} className={emailSecurity.hasDKIM ? "bg-green-600 dark:bg-green-700" : ""}>
                {emailSecurity.hasDKIM ? "Configured" : "Missing"}
              </Badge>
            </div>

            {/* DMARC */}
            <div className="flex items-center justify-between border rounded-md p-3" data-testid="protocol-dmarc">
              <div className="flex items-center gap-3">
                {emailSecurity.hasDMARC ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
                )}
                <div>
                  <p className="font-semibold">DMARC (Domain-based Message Authentication)</p>
                  <p className="text-xs text-muted-foreground">Enforces email policies</p>
                </div>
              </div>
              <Badge variant={emailSecurity.hasDMARC ? "default" : "outline"} className={emailSecurity.hasDMARC ? "bg-green-600 dark:bg-green-700" : ""}>
                {emailSecurity.hasDMARC ? "Configured" : "Missing"}
              </Badge>
            </div>
          </div>
        </div>

        {/* SPF Record */}
        {emailSecurity.spfRecord && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">SPF Record</p>
            <div className="border rounded-md p-3 bg-muted">
              <code className="text-xs font-mono break-all" data-testid="spf-record">
                {emailSecurity.spfRecord}
              </code>
            </div>
          </div>
        )}

        {/* DMARC Policy */}
        {emailSecurity.dmarcPolicy && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">DMARC Policy</p>
            <div className="border rounded-md p-3">
              <code className="text-sm font-mono" data-testid="dmarc-policy">
                {emailSecurity.dmarcPolicy}
              </code>
            </div>
          </div>
        )}

        {/* DMARC Record */}
        {emailSecurity.dmarcRecord && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">DMARC Record</p>
            <div className="border rounded-md p-3 bg-muted">
              <code className="text-xs font-mono break-all" data-testid="dmarc-record">
                {emailSecurity.dmarcRecord}
              </code>
            </div>
          </div>
        )}

        {/* Issues */}
        {emailSecurity.issues.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <h3 className="font-semibold">Security Issues</h3>
            </div>
            <div className="space-y-2">
              {emailSecurity.issues.map((issue, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 border rounded-md p-3 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
                  data-testid={`email-issue-${index}`}
                >
                  <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm">{issue}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
