import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle, XCircle, Search } from "lucide-react";
import type { SubdomainEnumerationResult } from "@shared/schema";

interface SubdomainCardProps {
  subdomains: SubdomainEnumerationResult;
}

export function SubdomainCard({ subdomains }: SubdomainCardProps) {
  if (!subdomains || subdomains.subdomains.length === 0) {
    return (
      <Card data-testid="card-subdomains">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Subdomain Discovery</CardTitle>
          </div>
          <CardDescription>Subdomain enumeration via CT logs & DNS brute-force</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p data-testid="text-no-subdomains">No subdomains discovered</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const sourceLabels = {
    certificate_transparency: "CT Logs",
    common_pattern: "DNS Brute-Force"
  };

  return (
    <Card data-testid="card-subdomains">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            <CardTitle>Subdomain Discovery</CardTitle>
          </div>
          <Badge variant="outline" data-testid="badge-subdomain-count">
            {subdomains.totalSubdomains} discovered
          </Badge>
        </div>
        <CardDescription>
          Subdomain enumeration via Certificate Transparency logs and DNS patterns
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Subdomains</p>
            <p className="text-2xl font-bold" data-testid="stat-total-subdomains">
              {subdomains.totalSubdomains}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-500" data-testid="stat-active-subdomains">
              {subdomains.activeSubdomains}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">CT Logs</p>
            <p className="text-2xl font-bold" data-testid="stat-ct-subdomains">
              {subdomains.sources.certificateTransparency}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">DNS Patterns</p>
            <p className="text-2xl font-bold" data-testid="stat-dns-subdomains">
              {subdomains.sources.commonPatterns}
            </p>
          </div>
        </div>

        {/* Subdomain List */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Discovered Subdomains</h3>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {subdomains.subdomains.map((subdomain, index) => (
              <div
                key={index}
                className="border rounded-md p-3 space-y-2 hover-elevate"
                data-testid={`subdomain-item-${index}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {subdomain.status === "active" ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <code className="font-mono text-sm break-all" data-testid={`subdomain-name-${index}`}>
                      {subdomain.subdomain}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="default"
                      className={subdomain.status === "active" ? "bg-green-600 dark:bg-green-700" : ""}
                      data-testid={`subdomain-status-${index}`}
                    >
                      {subdomain.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" data-testid={`subdomain-source-${index}`}>
                      {sourceLabels[subdomain.source]}
                    </Badge>
                  </div>
                </div>

                {/* IP Addresses */}
                {subdomain.ipAddresses.length > 0 && (
                  <div className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground flex-shrink-0">IP:</span>
                    <div className="flex flex-wrap gap-1">
                      {subdomain.ipAddresses.map((ip, ipIndex) => (
                        <code
                          key={ipIndex}
                          className="px-1.5 py-0.5 bg-muted rounded font-mono"
                          data-testid={`subdomain-ip-${index}-${ipIndex}`}
                        >
                          {ip}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
