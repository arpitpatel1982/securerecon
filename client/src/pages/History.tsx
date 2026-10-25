import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, ExternalLink, Trash2 } from "lucide-react";
import type { Scan } from "@shared/schema";

export default function History() {
  const { data: scans, isLoading } = useQuery<Scan[]>({
    queryKey: ["/api/scans"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen" data-testid="loading-history">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Loading scan history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Scan History</h1>
          <p className="text-muted-foreground" data-testid="text-page-description">
            View and manage your previous security scans
          </p>
        </div>

        {!scans || scans.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="space-y-4">
                <Clock className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold mb-2" data-testid="text-no-scans-title">No scans yet</h3>
                  <p className="text-muted-foreground mb-4" data-testid="text-no-scans-description">
                    Start by performing your first security scan
                  </p>
                  <Link href="/">
                    <Button data-testid="button-start-scan">Start New Scan</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <Card key={scan.scanId} className="hover-elevate" data-testid={`card-scan-${scan.scanId}`}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <CardTitle className="text-lg break-all" data-testid={`text-scan-url-${scan.scanId}`}>
                          {scan.url}
                        </CardTitle>
                        <a
                          href={scan.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          data-testid={`link-external-${scan.scanId}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <CardDescription data-testid={`text-scan-date-${scan.scanId}`}>
                        Scanned on {format(new Date(scan.timestamp), "PPpp")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold" data-testid={`text-scan-score-${scan.scanId}`}>
                          {scan.overallScore}
                        </div>
                        <Badge
                          variant={
                            scan.letterGrade === "A"
                              ? "default"
                              : scan.letterGrade === "F"
                              ? "destructive"
                              : "secondary"
                          }
                          data-testid={`badge-grade-${scan.scanId}`}
                        >
                          Grade {scan.letterGrade}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Risks:</span>{" "}
                        <span className="font-medium" data-testid={`text-risks-${scan.scanId}`}>
                          {scan.riskSummaryCritical > 0 && (
                            <span className="text-critical">{scan.riskSummaryCritical} Critical</span>
                          )}
                          {scan.riskSummaryHigh > 0 && (
                            <>
                              {scan.riskSummaryCritical > 0 && ", "}
                              <span className="text-high">{scan.riskSummaryHigh} High</span>
                            </>
                          )}
                          {scan.riskSummaryMedium > 0 && (
                            <>
                              {(scan.riskSummaryCritical > 0 || scan.riskSummaryHigh > 0) && ", "}
                              <span className="text-medium">{scan.riskSummaryMedium} Medium</span>
                            </>
                          )}
                          {scan.riskSummaryLow > 0 && (
                            <>
                              {(scan.riskSummaryCritical > 0 || scan.riskSummaryHigh > 0 || scan.riskSummaryMedium > 0) && ", "}
                              <span className="text-low">{scan.riskSummaryLow} Low</span>
                            </>
                          )}
                          {scan.riskSummaryCritical === 0 &&
                            scan.riskSummaryHigh === 0 &&
                            scan.riskSummaryMedium === 0 &&
                            scan.riskSummaryLow === 0 && (
                              <span className="text-success">None</span>
                            )}
                        </span>
                      </div>
                      {scan.technologies && scan.technologies.length > 0 && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Technologies:</span>{" "}
                          <span className="font-medium" data-testid={`text-tech-count-${scan.scanId}`}>
                            {scan.technologies.length} detected
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/?scanId=${scan.scanId}`}>
                        <Button variant="outline" size="sm" data-testid={`button-view-details-${scan.scanId}`}>
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
