import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, FileWarning, AlertTriangle, ExternalLink } from "lucide-react";
import type { DorkingResult } from "@shared/schema";

interface DorkingCardProps {
  dorking: DorkingResult;
}

export function DorkingCard({ dorking }: DorkingCardProps) {
  if (!dorking) {
    return (
      <Card data-testid="card-dorking">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle>Exposed Resources</CardTitle>
          </div>
          <CardDescription>Google dorking scan for exposed files and directories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <p data-testid="text-no-dorking">No dorking data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const typeIcons = {
    file: FileWarning,
    directory: FileWarning,
    endpoint: FileWarning,
    config: AlertTriangle,
  };

  const getSeverityClass = (type: string) => {
    if (type === 'config') return 'border-red-500 bg-red-50 dark:bg-red-950';
    if (type === 'endpoint') return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
    return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950';
  };

  return (
    <Card data-testid="card-dorking">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <CardTitle>Exposed Resources</CardTitle>
          </div>
          {dorking.totalExposed > 0 && (
            <Badge variant="default" className="bg-orange-600 dark:bg-orange-700" data-testid="badge-exposed-count">
              {dorking.totalExposed} exposed
            </Badge>
          )}
        </div>
        <CardDescription>Sensitive files and directories accessible via search engines</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {dorking.totalExposed === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900">
                <Search className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold text-green-900 dark:text-green-100" data-testid="text-no-exposures">
                No Exposed Resources Found
              </p>
              <p className="text-sm text-muted-foreground">
                No sensitive files or directories were discovered via Google dorking
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Exposed</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-500" data-testid="stat-total-exposed">
                  {dorking.totalExposed}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Files</p>
                <p className="text-2xl font-bold" data-testid="stat-exposed-files">
                  {dorking.exposedFiles.filter(f => f.type === 'file').length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Directories</p>
                <p className="text-2xl font-bold" data-testid="stat-exposed-dirs">
                  {dorking.exposedFiles.filter(f => f.type === 'directory').length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Configs</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-500" data-testid="stat-exposed-configs">
                  {dorking.exposedFiles.filter(f => f.type === 'config').length}
                </p>
              </div>
            </div>

            {/* Exposed Resources */}
            {dorking.exposedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <FileWarning className="h-4 w-4 text-orange-600" />
                  <h3 className="font-semibold">Exposed Files & Directories</h3>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {dorking.exposedFiles.map((resource, index) => {
                    const Icon = typeIcons[resource.type];
                    return (
                      <div
                        key={index}
                        className={`border rounded-md p-3 space-y-2 ${getSeverityClass(resource.type)}`}
                        data-testid={`exposed-resource-${index}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0 flex-1">
                            <Icon className="h-4 w-4 flex-shrink-0 mt-0.5 text-orange-600 dark:text-orange-500" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <code className="font-mono text-sm font-semibold break-all" data-testid={`resource-path-${index}`}>
                                  {resource.path}
                                </code>
                                <Badge variant="outline" data-testid={`resource-type-${index}`}>
                                  {resource.type}
                                </Badge>
                              </div>
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 break-all"
                                data-testid={`resource-url-${index}`}
                              >
                                {resource.url}
                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Findings */}
            {dorking.findings.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <h3 className="font-semibold">Security Findings</h3>
                </div>
                <div className="space-y-2">
                  {dorking.findings.map((finding, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 border rounded-md p-3"
                      data-testid={`dorking-finding-${index}`}
                    >
                      <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interesting Paths */}
            {dorking.interestingPaths.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Interesting Paths Scanned</h3>
                <div className="flex flex-wrap gap-2">
                  {dorking.interestingPaths.slice(0, 10).map((path, index) => (
                    <Badge key={index} variant="outline" className="font-mono text-xs" data-testid={`interesting-path-${index}`}>
                      {path}
                    </Badge>
                  ))}
                  {dorking.interestingPaths.length > 10 && (
                    <Badge variant="outline">
                      +{dorking.interestingPaths.length - 10} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
