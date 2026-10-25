import { type ScanResult, type Scan, type InsertScan, scans } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Scan operations
  createScan(scanResult: ScanResult): Promise<Scan>;
  getScan(scanId: string): Promise<Scan | undefined>;
  getScansByUrl(url: string): Promise<Scan[]>;
  getAllScans(limit?: number): Promise<Scan[]>;
  deleteScan(scanId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createScan(scanResult: ScanResult): Promise<Scan> {
    const insertData: InsertScan = {
      scanId: scanResult.scanId,
      url: scanResult.url,
      timestamp: new Date(scanResult.timestamp),
      overallScore: scanResult.overallScore,
      letterGrade: scanResult.letterGrade,
      scoreBreakdown: scanResult.scoreBreakdown,
      sslCertificate: scanResult.ssl.certificate,
      sslIssues: scanResult.ssl.issues,
      headers: scanResult.headers,
      vulnerabilities: scanResult.vulnerabilities,
      technologies: scanResult.technologies,
      dns: scanResult.dns,
      openPorts: scanResult.openPorts,
      darkWeb: scanResult.darkWeb,
      whois: scanResult.whois || null,
      ipInfo: scanResult.ipInfo || null,
      emailSecurity: scanResult.emailSecurity || null,
      dorking: scanResult.dorking || null,
      subdomains: scanResult.subdomains || null,
      networkTopology: scanResult.networkTopology || null,
      riskSummaryCritical: scanResult.riskSummary.critical,
      riskSummaryHigh: scanResult.riskSummary.high,
      riskSummaryMedium: scanResult.riskSummary.medium,
      riskSummaryLow: scanResult.riskSummary.low,
    };

    const [scan] = await db.insert(scans).values(insertData).returning();
    return scan;
  }

  async getScan(scanId: string): Promise<Scan | undefined> {
    const [scan] = await db.select().from(scans).where(eq(scans.scanId, scanId));
    return scan || undefined;
  }

  async getScansByUrl(url: string): Promise<Scan[]> {
    return await db
      .select()
      .from(scans)
      .where(eq(scans.url, url))
      .orderBy(desc(scans.timestamp));
  }

  async getAllScans(limit: number = 100): Promise<Scan[]> {
    return await db
      .select()
      .from(scans)
      .orderBy(desc(scans.timestamp))
      .limit(limit);
  }

  async deleteScan(scanId: string): Promise<void> {
    await db.delete(scans).where(eq(scans.scanId, scanId));
  }
}

export const storage = new DatabaseStorage();
