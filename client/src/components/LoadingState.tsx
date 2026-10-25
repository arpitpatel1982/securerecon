import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Search, Lock, Globe, Database, Eye } from "lucide-react";

const scanPhases = [
  { icon: Search, label: "Analyzing URL", delay: 0 },
  { icon: Lock, label: "Checking SSL/TLS", delay: 200 },
  { icon: Shield, label: "Scanning Headers", delay: 400 },
  { icon: Globe, label: "DNS Enumeration", delay: 600 },
  { icon: Database, label: "Technology Detection", delay: 800 },
  { icon: Eye, label: "Dark Web Check", delay: 1000 },
];

export function LoadingState() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md border-card-border" data-testid="card-loading">
        <CardContent className="pt-6 pb-8">
          <div className="text-center mb-6">
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
              <Shield className="w-12 h-12 text-primary animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Security Scan in Progress</h3>
            <p className="text-sm text-muted-foreground">
              Analyzing your target for vulnerabilities and security issues
            </p>
          </div>

          <Progress value={33} className="mb-6" />

          <div className="space-y-3">
            {scanPhases.map((phase, index) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.label}
                  className="flex items-center gap-3 text-sm"
                  style={{ 
                    animation: `fadeIn 0.3s ease-in forwards`,
                    animationDelay: `${phase.delay}ms`,
                    opacity: 0,
                  }}
                >
                  <div className="p-1.5 rounded bg-muted">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <span className="text-muted-foreground">{phase.label}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <style>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
