import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearch } from "wouter";
import { ScanInputForm } from "@/components/ScanInputForm";
import { LoadingState } from "@/components/LoadingState";
import { SecurityScoreDashboard } from "@/components/SecurityScoreDashboard";
import { SSLAnalysisCard } from "@/components/SSLAnalysisCard";
import { SecurityHeadersCard } from "@/components/SecurityHeadersCard";
import { VulnerabilitiesCard } from "@/components/VulnerabilitiesCard";
import { TechnologyStackCard } from "@/components/TechnologyStackCard";
import { DarkWebCard } from "@/components/DarkWebCard";
import { DNSRecordsCard } from "@/components/DNSRecordsCard";
import { PortScanCard } from "@/components/PortScanCard";
import { NetworkTopologyCard } from "@/components/NetworkTopologyCard";
import { SubdomainCard } from "@/components/SubdomainCard";
import { WHOISCard } from "@/components/WHOISCard";
import { EmailSecurityCard } from "@/components/EmailSecurityCard";
import { IPInfoCard } from "@/components/IPInfoCard";
import { DorkingCard } from "@/components/DorkingCard";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ScanRequest, ScanResult, type Scan } from "@shared/schema";
import { Download, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

function scanToScanResult(scan: Scan): ScanResult {
  return {
    url: scan.url,
    scanId: scan.scanId,
    timestamp: typeof scan.timestamp === 'string' ? scan.timestamp : scan.timestamp.toISOString(),
    overallScore: scan.overallScore,
    letterGrade: scan.letterGrade as "A" | "B" | "C" | "D" | "F",
    scoreBreakdown: scan.scoreBreakdown,
    ssl: {
      certificate: scan.sslCertificate,
      issues: scan.sslIssues,
    },
    headers: scan.headers,
    vulnerabilities: scan.vulnerabilities,
    technologies: scan.technologies,
    dns: scan.dns,
    openPorts: scan.openPorts,
    darkWeb: scan.darkWeb,
    whois: scan.whois || undefined,
    ipInfo: scan.ipInfo || undefined,
    emailSecurity: scan.emailSecurity || undefined,
    dorking: scan.dorking || undefined,
    subdomains: scan.subdomains || undefined,
    networkTopology: scan.networkTopology || undefined,
    riskSummary: {
      critical: scan.riskSummaryCritical,
      high: scan.riskSummaryHigh,
      medium: scan.riskSummaryMedium,
      low: scan.riskSummaryLow,
    },
  };
}

export default function Dashboard() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const { toast } = useToast();
  const searchString = useSearch();
  
  const urlParams = new URLSearchParams(searchString);
  const scanId = urlParams.get('scanId');

  const { data: historicalScan, isLoading: isLoadingHistory } = useQuery<Scan>({
    queryKey: [`/api/scans/${scanId}`],
    enabled: !!scanId,
  });

  useEffect(() => {
    if (historicalScan && scanId) {
      setScanResult(scanToScanResult(historicalScan));
    } else if (!scanId) {
      setScanResult(null);
    }
  }, [historicalScan, scanId]);

  const scanMutation = useMutation({
    mutationFn: async (data: ScanRequest) => {
      const response = await apiRequest("POST", "/api/scan", data);
      const result = await response.json() as ScanResult;
      console.log("Scan result received:", result);
      console.log("SSL data:", result?.ssl);
      return result;
    },
    onSuccess: (data) => {
      console.log("Setting scan result:", data);
      setScanResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/scans"] });
      toast({
        title: "Scan Complete",
        description: `Security analysis finished for ${data?.url || "target"}`,
      });
    },
    onError: (error: Error) => {
      console.error("Scan error:", error);
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScan = (data: ScanRequest) => {
    scanMutation.mutate(data);
  };

  const handleExport = () => {
    if (!scanResult) return;
    
    const dataStr = JSON.stringify(scanResult, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `security-scan-${scanResult.scanId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Exported",
      description: "Security scan report downloaded successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {(scanMutation.isPending || isLoadingHistory) && <LoadingState />}

      <main className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <ScanInputForm onScan={handleScan} isScanning={scanMutation.isPending} />

          {scanResult && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">Scan Results</h2>
                  <p className="text-muted-foreground mt-1 font-mono text-sm">
                    {scanResult.url}
                  </p>
                </div>
                <Button onClick={handleExport} variant="outline" data-testid="button-export">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>

              <SecurityScoreDashboard
                score={scanResult.overallScore}
                letterGrade={scanResult.letterGrade}
                scoreBreakdown={scanResult.scoreBreakdown}
                timestamp={scanResult.timestamp}
                riskSummary={scanResult.riskSummary}
              />

              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                  <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
                  <TabsTrigger value="infrastructure" data-testid="tab-infrastructure">Infrastructure</TabsTrigger>
                  <TabsTrigger value="exposure" data-testid="tab-exposure">Exposure</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  {scanResult?.ssl && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <SSLAnalysisCard
                        certificate={scanResult.ssl.certificate}
                        issues={scanResult.ssl.issues}
                      />
                      {scanResult.headers && <SecurityHeadersCard headers={scanResult.headers} />}
                    </div>
                  )}
                  {scanResult?.vulnerabilities && <VulnerabilitiesCard vulnerabilities={scanResult.vulnerabilities} />}
                </TabsContent>

                <TabsContent value="security" className="space-y-6 mt-6">
                  {scanResult?.ssl && (
                    <SSLAnalysisCard
                      certificate={scanResult.ssl.certificate}
                      issues={scanResult.ssl.issues}
                    />
                  )}
                  {scanResult?.headers && <SecurityHeadersCard headers={scanResult.headers} />}
                  {scanResult?.vulnerabilities && <VulnerabilitiesCard vulnerabilities={scanResult.vulnerabilities} />}
                </TabsContent>

                <TabsContent value="infrastructure" className="space-y-6 mt-6">
                  {scanResult?.technologies && <TechnologyStackCard technologies={scanResult.technologies} />}
                  
                  {/* Domain & Network Information */}
                  {(scanResult?.whois || scanResult?.ipInfo || scanResult?.emailSecurity) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {scanResult.whois && <WHOISCard whois={scanResult.whois} />}
                      {scanResult.ipInfo && <IPInfoCard ipInfo={scanResult.ipInfo} />}
                      {scanResult.emailSecurity && <EmailSecurityCard emailSecurity={scanResult.emailSecurity} />}
                    </div>
                  )}
                  
                  {scanResult?.subdomains && <SubdomainCard subdomains={scanResult.subdomains} />}
                  {scanResult && <NetworkTopologyCard topology={scanResult.networkTopology || { targetHost: '', scanDate: '', totalHosts: 0, hostsUp: 0, hostsDown: 0, hosts: [], scanType: '' }} />}
                  
                  {(scanResult?.dns || scanResult?.openPorts) && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {scanResult.dns && <DNSRecordsCard records={scanResult.dns} />}
                      {scanResult.openPorts && <PortScanCard ports={scanResult.openPorts} />}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="exposure" className="space-y-6 mt-6">
                  {scanResult?.dorking && <DorkingCard dorking={scanResult.dorking} />}
                  {scanResult?.darkWeb && <DarkWebCard exposures={scanResult.darkWeb} />}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {!scanResult && (
            <div className="text-center py-16">
              <div className="inline-flex p-6 rounded-full bg-primary/10 mb-4">
                <Shield className="w-16 h-16 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Ready to Scan</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a website URL above to begin comprehensive security analysis.
                We'll check SSL certificates, security headers, vulnerabilities, and more.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-muted-foreground">
            SecureRecon - Professional Security Intelligence Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
