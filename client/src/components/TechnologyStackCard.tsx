import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Technology } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Code2, AlertTriangle, Package } from "lucide-react";

interface TechnologyStackCardProps {
  technologies: Technology[];
}

export function TechnologyStackCard({ technologies }: TechnologyStackCardProps) {
  const groupedTech = technologies.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<string, Technology[]>);

  return (
    <Card className="border-card-border" data-testid="card-technologies">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-md bg-primary/10">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Technology Stack</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {technologies.length} technologies detected
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedTech).map(([category, techs]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {category}
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {techs.map((tech, index) => (
                <div
                  key={`${tech.name}-${index}`}
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${
                    tech.hasKnownVulnerabilities
                      ? 'bg-high/10 border-high/30'
                      : 'bg-muted border-border'
                  }`}
                  data-testid={`tech-${tech.name}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{tech.name}</span>
                    {tech.version && (
                      <span className="text-xs font-mono text-muted-foreground">
                        v{tech.version}
                      </span>
                    )}
                  </div>
                  {tech.hasKnownVulnerabilities && (
                    <AlertTriangle className="w-3 h-3 text-high" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
