import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DarkWebExposure } from "@shared/schema";
import { SecurityBadge } from "./SecurityBadge";
import { Eye, Calendar, Database, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

interface DarkWebCardProps {
  exposures: DarkWebExposure[];
}

export function DarkWebCard({ exposures }: DarkWebCardProps) {
  const sortedExposures = [...exposures].sort(
    (a, b) => new Date(b.breachDate).getTime() - new Date(a.breachDate).getTime()
  );

  const totalRecords = exposures.reduce((sum, exp) => sum + exp.recordsAffected, 0);

  return (
    <Card className="border-card-border" data-testid="card-darkweb">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-md ${exposures.length > 0 ? 'bg-critical/10' : 'bg-success/10'}`}>
            <Eye className={`w-5 h-5 ${exposures.length > 0 ? 'text-critical' : 'text-success'}`} />
          </div>
          <div>
            <CardTitle className="text-xl">Dark Web Exposure</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {exposures.length === 0 
                ? "No known data breaches detected"
                : `${exposures.length} breaches found affecting ${totalRecords.toLocaleString()} records`
              }
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {exposures.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex p-4 rounded-full bg-success/10 mb-3">
              <ShieldAlert className="w-8 h-8 text-success" />
            </div>
            <p className="text-sm text-muted-foreground">
              No data breaches detected in our databases
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedExposures.map((exposure, index) => (
              <div
                key={`${exposure.source}-${index}`}
                className="p-4 rounded-md border border-border bg-card space-y-3"
                data-testid={`exposure-${index}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-base">{exposure.source}</h4>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(exposure.breachDate), "PPP")}
                    </div>
                  </div>
                  <SecurityBadge severity={exposure.severity} />
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Database className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {exposure.recordsAffected.toLocaleString()} records affected
                  </span>
                </div>

                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                    Data Types Exposed
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {exposure.dataTypes.map((dataType) => (
                      <span
                        key={dataType}
                        className="px-2 py-1 rounded text-xs bg-muted font-medium"
                      >
                        {dataType}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
