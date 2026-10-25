import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortInfo } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Network, Circle } from "lucide-react";

interface PortScanCardProps {
  ports: PortInfo[];
}

export function PortScanCard({ ports }: PortScanCardProps) {
  const openPorts = ports.filter(p => p.state === "open");

  return (
    <Card className="border-card-border" data-testid="card-ports">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
        <div className="p-2 rounded-md bg-primary/10">
          <Network className="w-5 h-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-xl">Open Ports</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {openPorts.length} open ports detected
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {openPorts.map((port) => (
            <div
              key={port.port}
              className="p-4 rounded-md border border-border bg-card space-y-2"
              data-testid={`port-${port.port}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Circle className="w-2 h-2 fill-success text-success" />
                  <span className="text-2xl font-bold font-mono">{port.port}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {port.state}
                </Badge>
              </div>
              <div className="text-sm font-medium">{port.service}</div>
              {port.version && (
                <div className="text-xs text-muted-foreground font-mono">
                  {port.version}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
