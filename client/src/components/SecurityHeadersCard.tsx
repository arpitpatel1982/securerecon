import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SecurityHeader } from "@shared/schema";
import { SecurityBadge } from "./SecurityBadge";
import { Shield, CheckCircle2, XCircle, Info } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SecurityHeadersCardProps {
  headers: SecurityHeader[];
}

export function SecurityHeadersCard({ headers }: SecurityHeadersCardProps) {
  const presentCount = headers.filter(h => h.present).length;
  const totalCount = headers.length;
  const percentage = Math.round((presentCount / totalCount) * 100);

  return (
    <Card className="border-card-border" data-testid="card-security-headers">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Security Headers</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {presentCount} of {totalCount} headers present ({percentage}%)
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {headers.map((header, index) => (
            <AccordionItem value={`header-${index}`} key={header.name} data-testid={`header-${header.name}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3 w-full pr-4">
                  {header.present ? (
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-critical flex-shrink-0" />
                  )}
                  <span className="font-mono text-sm flex-1 text-left">{header.name}</span>
                  <SecurityBadge severity={header.severity} />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pl-7 pr-4 pt-2 space-y-3">
                  <p className="text-sm text-muted-foreground">{header.description}</p>
                  
                  {header.present && header.value && (
                    <div className="p-3 rounded-md bg-muted">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Current Value
                      </div>
                      <code className="text-xs font-mono break-all">{header.value}</code>
                    </div>
                  )}

                  {header.recommendation && (
                    <div className="p-3 rounded-md bg-low/10 border border-low/20">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-low mt-0.5 flex-shrink-0" />
                        <div className="text-xs">
                          <div className="font-medium mb-1">Recommendation</div>
                          <div className="text-muted-foreground">{header.recommendation}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
