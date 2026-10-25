import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Server, AlertTriangle } from "lucide-react";
import type { WHOISInfo } from "@shared/schema";

interface WHOISCardProps {
  whois: WHOISInfo;
}

export function WHOISCard({ whois }: WHOISCardProps) {
  if (!whois) {
    return (
      <Card data-testid="card-whois">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>WHOIS Information</CardTitle>
          </div>
          <CardDescription>Domain registration details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p data-testid="text-no-whois">No WHOIS data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const expirationWarning = whois.daysUntilExpiration < 30;

  return (
    <Card data-testid="card-whois">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>WHOIS Information</CardTitle>
          </div>
          {expirationWarning && (
            <Badge variant="default" className="bg-orange-600 dark:bg-orange-700" data-testid="badge-expiration-warning">
              Expiring Soon
            </Badge>
          )}
        </div>
        <CardDescription>Domain registration details for {whois.domainName}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Registration Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Domain Name</p>
            <p className="font-mono font-semibold" data-testid="whois-domain">
              {whois.domainName}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Registrar</p>
            <p className="font-medium" data-testid="whois-registrar">
              {whois.registrar}
            </p>
          </div>
        </div>

        {/* Organization Details */}
        {(whois.registrantOrg || whois.registrantCountry) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {whois.registrantOrg && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Registrant Organization</p>
                <p className="font-medium" data-testid="whois-org">
                  {whois.registrantOrg}
                </p>
              </div>
            )}
            {whois.registrantCountry && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Country</p>
                <p className="font-medium" data-testid="whois-country">
                  {whois.registrantCountry}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Important Dates */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Important Dates</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium" data-testid="whois-created">
                {formatDate(whois.creationDate)}
              </p>
            </div>
            <div className="border rounded-md p-3 space-y-1">
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm font-medium" data-testid="whois-updated">
                {formatDate(whois.lastUpdated)}
              </p>
            </div>
            <div className={`border rounded-md p-3 space-y-1 ${expirationWarning ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : ''}`}>
              <p className="text-xs text-muted-foreground">Expires</p>
              <p className="text-sm font-medium" data-testid="whois-expires">
                {formatDate(whois.expirationDate)}
              </p>
              <p className={`text-xs font-semibold ${expirationWarning ? 'text-orange-600 dark:text-orange-500' : 'text-muted-foreground'}`} data-testid="whois-days-until-expiration">
                {whois.daysUntilExpiration} days remaining
              </p>
            </div>
          </div>
        </div>

        {/* Name Servers */}
        {whois.nameServers.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Name Servers</h3>
              <Badge variant="outline" data-testid="badge-nameserver-count">
                {whois.nameServers.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {whois.nameServers.map((ns, index) => (
                <div
                  key={index}
                  className="border rounded-md p-2 font-mono text-sm"
                  data-testid={`nameserver-${index}`}
                >
                  {ns}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Domain Status */}
        {whois.status.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Domain Status</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {whois.status.map((status, index) => (
                <Badge key={index} variant="outline" data-testid={`domain-status-${index}`}>
                  {status}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
