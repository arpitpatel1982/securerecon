import type { Express } from "express";
import { createServer, type Server } from "http";
import http from "http";
import https from "https";
import { URL } from "url";
import { randomUUID } from "crypto";
import { scanRequestSchema, type ScanResult } from "@shared/schema";
import { analyzeSSL } from "./scanner/sslAnalyzer";
import { analyzeSecurityHeaders } from "./scanner/headerAnalyzer";
import { detectTechnologies } from "./scanner/technologyDetector";
import { findVulnerabilities } from "./scanner/vulnerabilityScanner";
import { calculateSecurityScore } from "./scanner/scoreCalculator";
import { checkDarkWebExposure } from "./scanner/darkWebChecker";
import { analyzeDNS } from "./scanner/dnsAnalyzer";
import { scanPorts } from "./scanner/portScanner";
import { analyzeWHOIS } from "./scanner/whoisAnalyzer";
import { analyzeIP } from "./scanner/ipAnalyzer";
import { analyzeEmailSecurity } from "./scanner/emailSecurityAnalyzer";
import { performDorking } from "./scanner/dorkingScanner";
import { enumerateSubdomains } from "./scanner/subdomainEnumerator";
import { analyzeNetworkTopology } from "./scanner/networkTopologyAnalyzer";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/scan", async (req, res) => {
    try {
      const validatedData = scanRequestSchema.parse(req.body);
      const targetURL = new URL(validatedData.url);
      const hostname = targetURL.hostname;

      // Fetch the website to analyze headers and HTML
      let fetchResponse: {
        headers: Record<string, string | string[] | undefined>;
        html: string;
      };

      try {
        fetchResponse = await new Promise<{
          headers: Record<string, string | string[] | undefined>;
          html: string;
        }>((resolve, reject) => {
          const makeRequest = (url: string, redirectCount = 0): void => {
            if (redirectCount > 5) {
              reject(new Error("Too many redirects"));
              return;
            }

            const parsedUrl = new URL(url);
            const requestProtocol = parsedUrl.protocol === "https:" ? https : http;
            
            const request = requestProtocol.get(url, {
              headers: {
                "User-Agent": "Mozilla/5.0 (compatible; SecureRecon-Scanner/1.0; +https://securerecon.example)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
              },
              timeout: 10000,
              rejectUnauthorized: false,
            }, (response: any) => {
              // Handle redirects
              if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                const redirectUrl = new URL(response.headers.location, url).toString();
                makeRequest(redirectUrl, redirectCount + 1);
                return;
              }

              let html = "";
              let settled = false;
              
              const dataHandler = (chunk: Buffer) => {
                const chunkStr = chunk.toString();
                if (html.length + chunkStr.length > 500000) {
                  // Add only what fits within the limit
                  html += chunkStr.substring(0, 500000 - html.length);
                  // Stop reading further chunks
                  response.removeListener("data", dataHandler);
                  response.pause();
                  response.resume(); // Drain remaining data without processing
                } else {
                  html += chunkStr;
                }
              };
              
              response.on("data", dataHandler);

              response.on("end", () => {
                if (!settled) {
                  settled = true;
                  resolve({
                    headers: response.headers,
                    html,
                  });
                }
              });
            });

            request.on("error", reject);
            request.on("timeout", () => {
              request.destroy();
              reject(new Error("Request timeout"));
            });
          };

          makeRequest(validatedData.url);
        });
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        // If the initial fetch fails (e.g., TLS handshake error), use synthetic data
        fetchResponse = {
          headers: {},
          html: "",
        };
      }

      // Run all security checks in parallel
      const [sslResult, dnsRecords, openPorts, whoisInfo, ipInfo, emailSecurity, dorkingResults, subdomainResults, networkTopology] = await Promise.all([
        targetURL.protocol === "https:" 
          ? analyzeSSL(hostname).catch(() => ({
              certificate: {
                valid: false,
                issuer: "Certificate Error",
                validFrom: new Date().toISOString(),
                validTo: new Date().toISOString(),
                daysRemaining: 0,
                protocol: "TLS Handshake Failed",
                cipher: "N/A",
              },
              issues: [{
                id: "ssl-handshake-failed",
                title: "SSL/TLS Handshake Failed",
                severity: "critical" as const,
                category: "SSL/TLS",
                description: "Unable to establish a secure connection. The certificate may be self-signed, expired, or invalid.",
                affectedComponent: "SSL Certificate",
                remediation: "Ensure a valid SSL/TLS certificate is properly installed and configured on the server.",
              }],
            }))
          : Promise.resolve({
              certificate: {
                valid: false,
                issuer: "N/A",
                validFrom: new Date().toISOString(),
                validTo: new Date().toISOString(),
                daysRemaining: 0,
                protocol: "HTTP (No SSL)",
                cipher: "N/A",
              },
              issues: [{
                id: "no-ssl",
                title: "No SSL/TLS Encryption",
                severity: "critical" as const,
                category: "SSL/TLS",
                description: "The website is not using HTTPS encryption.",
                affectedComponent: "HTTP Protocol",
                remediation: "Implement SSL/TLS certificate and redirect all HTTP traffic to HTTPS.",
              }],
            }),
        analyzeDNS(hostname).catch(() => [] as any[]),
        scanPorts(hostname).catch(() => [] as any[]),
        analyzeWHOIS(hostname).catch(() => null),
        analyzeIP(hostname).catch(() => null),
        analyzeEmailSecurity(hostname).catch(() => null),
        performDorking(validatedData.url).catch(() => null),
        enumerateSubdomains(hostname).catch(() => null),
        analyzeNetworkTopology(hostname).catch(() => null),
      ]);

      // Analyze security headers
      const securityHeaders = analyzeSecurityHeaders(fetchResponse.headers);

      // Detect technologies
      const technologies = detectTechnologies(fetchResponse.headers, fetchResponse.html);

      // Find vulnerabilities
      const vulnerabilities = findVulnerabilities(securityHeaders, technologies);
      const allVulnerabilities = [...sslResult.issues, ...vulnerabilities];

      // Check dark web exposure
      const darkWebExposures = checkDarkWebExposure(hostname);

      // Calculate security score
      const scoreData = calculateSecurityScore(
        sslResult.certificate,
        securityHeaders,
        allVulnerabilities
      );

      // Calculate risk summary
      const riskSummary = {
        critical: allVulnerabilities.filter(v => v.severity === "critical").length,
        high: allVulnerabilities.filter(v => v.severity === "high").length,
        medium: allVulnerabilities.filter(v => v.severity === "medium").length,
        low: allVulnerabilities.filter(v => v.severity === "low").length,
      };

      const scanResult: ScanResult = {
        url: validatedData.url,
        scanId: randomUUID(),
        timestamp: new Date().toISOString(),
        overallScore: scoreData.overallScore,
        letterGrade: scoreData.letterGrade,
        scoreBreakdown: scoreData.scoreBreakdown,
        ssl: {
          certificate: sslResult.certificate,
          issues: sslResult.issues,
        },
        headers: securityHeaders,
        vulnerabilities: allVulnerabilities,
        technologies,
        dns: dnsRecords,
        openPorts,
        darkWeb: darkWebExposures,
        whois: whoisInfo || undefined,
        ipInfo: ipInfo || undefined,
        emailSecurity: emailSecurity || undefined,
        dorking: dorkingResults || undefined,
        subdomains: subdomainResults || undefined,
        networkTopology: networkTopology || undefined,
        riskSummary,
      };

      // Save scan result to database
      await storage.createScan(scanResult);

      res.json(scanResult);
    } catch (error) {
      console.error("Scan error:", error);
      console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
      
      if (error instanceof Error) {
        res.status(400).json({ 
          message: error.message || "Failed to perform security scan",
        });
      } else {
        res.status(500).json({ 
          message: "An unexpected error occurred during the scan",
          error: String(error),
        });
      }
    }
  });

  // Get scan history
  app.get("/api/scans", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const scans = await storage.getAllScans(limit);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans:", error);
      res.status(500).json({ message: "Failed to fetch scan history" });
    }
  });

  // Get scans for a specific URL
  app.get("/api/scans/url/:encodedUrl", async (req, res) => {
    try {
      const url = decodeURIComponent(req.params.encodedUrl);
      const scans = await storage.getScansByUrl(url);
      res.json(scans);
    } catch (error) {
      console.error("Error fetching scans by URL:", error);
      res.status(500).json({ message: "Failed to fetch scans for URL" });
    }
  });

  // Get a specific scan by scanId
  app.get("/api/scans/:scanId", async (req, res) => {
    try {
      const scan = await storage.getScan(req.params.scanId);
      if (!scan) {
        res.status(404).json({ message: "Scan not found" });
        return;
      }
      res.json(scan);
    } catch (error) {
      console.error("Error fetching scan:", error);
      res.status(500).json({ message: "Failed to fetch scan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
