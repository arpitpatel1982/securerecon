import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { pgTable, varchar, integer, jsonb, timestamp, serial } from "drizzle-orm/pg-core";

// Security scan request schema
export const scanRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export type ScanRequest = z.infer<typeof scanRequestSchema>;

// Severity levels for security findings
export type SeverityLevel = "critical" | "high" | "medium" | "low" | "pass";

// SSL/TLS Certificate Information
export interface SSLCertificate {
  valid: boolean;
  issuer: string;
  validFrom: string;
  validTo: string;
  daysRemaining: number;
  protocol: string;
  cipher: string;
}

// Security Header Check
export interface SecurityHeader {
  name: string;
  present: boolean;
  value?: string;
  severity: SeverityLevel;
  description: string;
  recommendation?: string;
}

// Technology Detection
export interface Technology {
  name: string;
  category: string;
  version?: string;
  confidence: number;
  icon?: string;
  hasKnownVulnerabilities?: boolean;
}

// Vulnerability Finding
export interface Vulnerability {
  id: string;
  title: string;
  severity: SeverityLevel;
  category: string;
  description: string;
  affectedComponent: string;
  remediation: string;
  cvssScore?: number;
  cveId?: string;
}

// DNS Record
export interface DNSRecord {
  type: string;
  value: string;
}

// Open Port Information
export interface PortInfo {
  port: number;
  service: string;
  state: "open" | "closed" | "filtered";
  version?: string;
}

// Dark Web Exposure
export interface DarkWebExposure {
  source: string;
  breachDate: string;
  dataTypes: string[];
  recordsAffected: number;
  severity: SeverityLevel;
  description?: string;
  verified?: boolean;
}

// WHOIS Domain Information
export interface WHOISInfo {
  domainName: string;
  registrar: string;
  creationDate: string;
  expirationDate: string;
  lastUpdated: string;
  daysUntilExpiration: number;
  nameServers: string[];
  status: string[];
  registrantOrg?: string;
  registrantCountry?: string;
}

// IP/Geolocation Information
export interface IPInfo {
  ipAddress: string;
  hostname?: string;
  organization: string;
  isp: string;
  asn: string;
  country: string;
  region: string;
  city: string;
  riskScore?: number;
}

// Email Security Check
export interface EmailSecurity {
  hasSPF: boolean;
  hasDKIM: boolean;
  hasDMARC: boolean;
  spfRecord?: string;
  dmarcPolicy?: string;
  dmarcRecord?: string;
  score: number;
  issues: string[];
}

// Exposed Resource (from Dorking)
export interface ExposedResource {
  type: 'file' | 'directory' | 'endpoint' | 'config';
  path: string;
  url: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  found: boolean;
  statusCode?: number;
  contentSnippet?: string;
}

// Google Dorking Results
export interface DorkingResult {
  exposedFiles: ExposedResource[];
  interestingPaths: string[];
  findings: string[];
  totalExposed: number;
}

// Subdomain Enumeration
export interface Subdomain {
  subdomain: string;
  ipAddresses: string[];
  status: "active" | "inactive";
  source: "certificate_transparency" | "common_pattern";
  discoveredAt: string;
}

export interface SubdomainEnumerationResult {
  totalSubdomains: number;
  activeSubdomains: number;
  subdomains: Subdomain[];
  sources: {
    certificateTransparency: number;
    commonPatterns: number;
  };
}

// Network Topology (Nmap)
export interface NetworkPort {
  port: number;
  protocol: 'tcp' | 'udp';
  state: 'open' | 'closed' | 'filtered';
  service?: string;
  version?: string;
}

export interface NetworkHost {
  ip: string;
  hostname?: string;
  mac?: string;
  vendor?: string;
  osNmap?: string;
  openPorts: NetworkPort[];
  state: 'up' | 'down' | 'unknown';
}

export interface NetworkTopology {
  targetHost: string;
  scanDate: string;
  totalHosts: number;
  hostsUp: number;
  hostsDown: number;
  hosts: NetworkHost[];
  scanType: string;
  scanDuration?: number;
}

// Security Score Breakdown
export interface SecurityScoreBreakdown {
  category: string;
  score: number;
  maxScore: number;
  weight: number;
}

// Complete Scan Result
export interface ScanResult {
  url: string;
  scanId: string;
  timestamp: string;
  overallScore: number;
  letterGrade: "A" | "B" | "C" | "D" | "F";
  scoreBreakdown: SecurityScoreBreakdown[];
  ssl: {
    certificate: SSLCertificate;
    issues: Vulnerability[];
  };
  headers: SecurityHeader[];
  vulnerabilities: Vulnerability[];
  technologies: Technology[];
  dns: DNSRecord[];
  openPorts: PortInfo[];
  darkWeb: DarkWebExposure[];
  whois?: WHOISInfo;
  ipInfo?: IPInfo;
  emailSecurity?: EmailSecurity;
  dorking?: DorkingResult;
  subdomains?: SubdomainEnumerationResult;
  networkTopology?: NetworkTopology;
  riskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

// Scan status for loading states
export interface ScanStatus {
  phase: string;
  progress: number;
  message: string;
}

export type InsertScanRequest = z.infer<typeof scanRequestSchema>;

// Database Tables
export const scans = pgTable("scans", {
  id: serial("id").primaryKey(),
  scanId: varchar("scan_id", { length: 255 }).notNull().unique(),
  url: varchar("url", { length: 1000 }).notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  overallScore: integer("overall_score").notNull(),
  letterGrade: varchar("letter_grade", { length: 1 }).notNull(),
  scoreBreakdown: jsonb("score_breakdown").notNull().$type<SecurityScoreBreakdown[]>(),
  sslCertificate: jsonb("ssl_certificate").notNull().$type<SSLCertificate>(),
  sslIssues: jsonb("ssl_issues").notNull().$type<Vulnerability[]>(),
  headers: jsonb("headers").notNull().$type<SecurityHeader[]>(),
  vulnerabilities: jsonb("vulnerabilities").notNull().$type<Vulnerability[]>(),
  technologies: jsonb("technologies").notNull().$type<Technology[]>(),
  dns: jsonb("dns").notNull().$type<DNSRecord[]>(),
  openPorts: jsonb("open_ports").notNull().$type<PortInfo[]>(),
  darkWeb: jsonb("dark_web").notNull().$type<DarkWebExposure[]>(),
  whois: jsonb("whois").$type<WHOISInfo | null>(),
  ipInfo: jsonb("ip_info").$type<IPInfo | null>(),
  emailSecurity: jsonb("email_security").$type<EmailSecurity | null>(),
  dorking: jsonb("dorking").$type<DorkingResult | null>(),
  subdomains: jsonb("subdomains").$type<SubdomainEnumerationResult | null>(),
  networkTopology: jsonb("network_topology").$type<NetworkTopology | null>(),
  riskSummaryCritical: integer("risk_summary_critical").notNull().default(0),
  riskSummaryHigh: integer("risk_summary_high").notNull().default(0),
  riskSummaryMedium: integer("risk_summary_medium").notNull().default(0),
  riskSummaryLow: integer("risk_summary_low").notNull().default(0),
});

export type Scan = typeof scans.$inferSelect;
export type InsertScan = typeof scans.$inferInsert;

export const insertScanSchema = createInsertSchema(scans);
