import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Vulnerability } from "@shared/schema";
import { SecurityBadge } from "./SecurityBadge";
import { AlertTriangle, Shield } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface VulnerabilitiesCardProps {
  vulnerabilities: Vulnerability[];
}

export function VulnerabilitiesCard({ vulnerabilities }: VulnerabilitiesCardProps) {
  const sortedVulns = [...vulnerabilities].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, pass: 4 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <Card className="border-card-border" data-testid="card-vulnerabilities">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-critical/10">
            <AlertTriangle className="w-5 h-5 text-critical" />
          </div>
          <div>
            <CardTitle className="text-xl">Vulnerabilities</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {vulnerabilities.length} issues found
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {vulnerabilities.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex p-4 rounded-full bg-success/10 mb-3">
              <Shield className="w-8 h-8 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">
              No vulnerabilities detected
            </p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {sortedVulns.map((vuln) => (
              <AccordionItem value={vuln.id} key={vuln.id} data-testid={`vulnerability-${vuln.id}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 w-full pr-4">
                    <SecurityBadge severity={vuln.severity} />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{vuln.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {vuln.category} • {vuln.affectedComponent}
                      </div>
                    </div>
                    {vuln.cvssScore && (
                      <div className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        CVSS {vuln.cvssScore}
                      </div>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 pr-4 pt-2 space-y-4">
                    <div>
                      <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Description
                      </h4>
                      <p className="text-sm">{vuln.description}</p>
                    </div>

                    <div className="p-4 rounded-md bg-success/5 border border-success/20">
                      <h4 className="text-xs text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        Remediation
                      </h4>
                      <p className="text-sm">{vuln.remediation}</p>
                    </div>

                    {vuln.cveId && (
                      <div className="text-xs">
                        <span className="text-muted-foreground">CVE ID: </span>
                        <span className="font-mono">{vuln.cveId}</span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}
