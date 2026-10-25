import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Server, Network, HardDrive, Shield, Clock } from "lucide-react";
import type { NetworkTopology } from "@shared/schema";

interface NetworkTopologyCardProps {
  topology: NetworkTopology;
}

export function NetworkTopologyCard({ topology }: NetworkTopologyCardProps) {
  if (!topology || topology.hosts.length === 0) {
    return (
      <Card data-testid="card-network-topology">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>Network Topology</CardTitle>
          </div>
          <CardDescription>Network mapping via Nmap scan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p data-testid="text-no-topology">No network topology data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <Card data-testid="card-network-topology">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            <CardTitle>Network Topology</CardTitle>
          </div>
          <Badge variant="outline" data-testid="badge-scan-type">
            {topology.scanType}
          </Badge>
        </div>
        <CardDescription>
          Network mapping of {topology.targetHost}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1" data-testid="stat-total-hosts">
            <p className="text-sm text-muted-foreground">Total Hosts</p>
            <p className="text-2xl font-bold">{topology.totalHosts}</p>
          </div>
          <div className="space-y-1" data-testid="stat-hosts-up">
            <p className="text-sm text-muted-foreground">Hosts Up</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {topology.hostsUp}
            </p>
          </div>
          <div className="space-y-1" data-testid="stat-hosts-down">
            <p className="text-sm text-muted-foreground">Hosts Down</p>
            <p className="text-2xl font-bold text-muted-foreground">
              {topology.hostsDown}
            </p>
          </div>
          <div className="space-y-1" data-testid="stat-scan-duration">
            <p className="text-sm text-muted-foreground">Scan Duration</p>
            <p className="text-2xl font-bold">{formatDuration(topology.scanDuration)}</p>
          </div>
        </div>

        {/* Host Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Server className="h-4 w-4" />
            Discovered Hosts
          </h3>
          
          <div className="space-y-4">
            {topology.hosts.map((host, index) => (
              <Card key={index} className="border" data-testid={`host-card-${index}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-primary" />
                      <CardTitle className="text-base font-mono" data-testid={`host-ip-${index}`}>
                        {host.ip}
                      </CardTitle>
                      {host.state === 'up' && (
                        <Badge variant="default" className="bg-green-600 dark:bg-green-700" data-testid={`host-status-${index}`}>
                          Online
                        </Badge>
                      )}
                      {host.state === 'down' && (
                        <Badge variant="default" className="bg-red-600 dark:bg-red-700" data-testid={`host-status-${index}`}>
                          Offline
                        </Badge>
                      )}
                      {host.state === 'unknown' && (
                        <Badge variant="default" className="bg-yellow-600 dark:bg-yellow-700" data-testid={`host-status-${index}`}>
                          Unknown
                        </Badge>
                      )}
                    </div>
                    {host.hostname && (
                      <span className="text-sm text-muted-foreground" data-testid={`host-hostname-${index}`}>
                        {host.hostname}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Host Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {host.osNmap && (
                      <div className="flex items-center gap-2" data-testid={`host-os-${index}`}>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">OS:</span>
                        <span className="font-medium">{host.osNmap}</span>
                      </div>
                    )}
                    {host.mac && (
                      <div className="flex items-center gap-2" data-testid={`host-mac-${index}`}>
                        <Network className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">MAC:</span>
                        <span className="font-mono text-sm">{host.mac}</span>
                      </div>
                    )}
                    {host.vendor && (
                      <div className="col-span-full" data-testid={`host-vendor-${index}`}>
                        <span className="text-muted-foreground">Vendor:</span>{' '}
                        <span className="font-medium">{host.vendor}</span>
                      </div>
                    )}
                  </div>

                  {/* Open Ports */}
                  {host.openPorts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Shield className="h-3 w-3" />
                        Open Ports ({host.openPorts.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {host.openPorts.map((port, portIndex) => (
                          <div
                            key={portIndex}
                            className="flex items-center justify-between p-2 bg-muted/50 rounded border"
                            data-testid={`port-${index}-${portIndex}`}
                          >
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-semibold" data-testid={`port-number-${index}-${portIndex}`}>
                                {port.port}/{port.protocol}
                              </span>
                              {port.service && (
                                <span className="text-xs text-muted-foreground" data-testid={`port-service-${index}-${portIndex}`}>
                                  {port.service}
                                  {port.version && ` ${port.version}`}
                                </span>
                              )}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={
                                port.state === 'open' 
                                  ? 'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                  : port.state === 'filtered'
                                  ? 'bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                                  : 'bg-muted'
                              }
                              data-testid={`port-state-${index}-${portIndex}`}
                            >
                              {port.state}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {host.openPorts.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      No open ports detected
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Scan Metadata */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Clock className="h-3 w-3" />
          <span>Scanned: {new Date(topology.scanDate).toLocaleString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
