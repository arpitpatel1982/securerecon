import axios from "axios";
import { promises as dns } from "dns";
import * as psl from "psl";

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

// Common subdomain patterns to check
const COMMON_SUBDOMAINS = [
  "www", "mail", "ftp", "localhost", "webmail", "smtp", "pop", "ns1", "webdisk",
  "ns2", "cpanel", "whm", "autodiscover", "autoconfig", "m", "imap", "test",
  "ns", "blog", "pop3", "dev", "www2", "admin", "forum", "news", "vpn",
  "ns3", "mail2", "new", "mysql", "old", "lists", "support", "mobile", "mx",
  "static", "docs", "beta", "shop", "sql", "secure", "demo", "cp", "calendar",
  "wiki", "web", "media", "email", "images", "img", "www1", "intranet",
  "portal", "video", "sip", "dns2", "api", "cdn", "stats", "dns1", "ns4",
  "www3", "dns", "search", "staging", "server", "mx1", "chat", "wap", "my",
  "svn", "mail1", "sites", "proxy", "ads", "host", "crm", "cms", "backup",
  "mx2", "lyncdiscover", "info", "apps", "download", "remote", "db", "forums",
  "store", "relay", "files", "newsletter", "app", "live", "owa", "en", "start",
  "sms", "office", "exchange", "ipv4"
];

async function queryCertificateTransparency(domain: string): Promise<string[]> {
  try {
    const response = await axios.get(`https://crt.sh/?q=%.${domain}&output=json`, {
      timeout: 10000,
      headers: {
        'User-Agent': 'SecureRecon/1.0'
      }
    });

    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    const subdomains = new Set<string>();
    
    for (const cert of response.data) {
      if (cert.name_value) {
        const names = cert.name_value.split('\n');
        for (const name of names) {
          const cleanName = name.trim().toLowerCase();
          
          // Only include subdomains that match our target domain
          if (cleanName.endsWith(`.${domain}`) && !cleanName.includes('*')) {
            subdomains.add(cleanName);
          }
        }
      }
    }

    return Array.from(subdomains);
  } catch (error) {
    console.error('Certificate transparency query failed:', error);
    return [];
  }
}

async function resolveSubdomain(subdomain: string): Promise<{ ipAddresses: string[]; status: "active" | "inactive" }> {
  try {
    const addresses = await dns.resolve4(subdomain);
    return {
      ipAddresses: addresses,
      status: "active"
    };
  } catch (error) {
    // Try IPv6 if IPv4 fails
    try {
      const addresses = await dns.resolve6(subdomain);
      return {
        ipAddresses: addresses,
        status: "active"
      };
    } catch (ipv6Error) {
      return {
        ipAddresses: [],
        status: "inactive"
      };
    }
  }
}

async function checkCommonSubdomains(domain: string): Promise<string[]> {
  const discoveredSubdomains: string[] = [];
  
  // Check common subdomains in batches to avoid overwhelming DNS
  const batchSize = 10;
  for (let i = 0; i < COMMON_SUBDOMAINS.length; i += batchSize) {
    const batch = COMMON_SUBDOMAINS.slice(i, i + batchSize);
    const checks = batch.map(async (prefix) => {
      const subdomain = `${prefix}.${domain}`;
      const result = await resolveSubdomain(subdomain);
      if (result.status === "active") {
        return subdomain;
      }
      return null;
    });

    const results = await Promise.all(checks);
    discoveredSubdomains.push(...results.filter(s => s !== null) as string[]);
  }

  return discoveredSubdomains;
}

export async function enumerateSubdomains(hostname: string): Promise<SubdomainEnumerationResult> {
  // Extract apex domain (eTLD+1) to properly query for all subdomains
  // e.g., "www.example.com" -> "example.com"
  const parsed = psl.parse(hostname);
  const apexDomain = (parsed && 'domain' in parsed && parsed.domain) ? parsed.domain : hostname;
  
  const discoveredSubdomains = new Map<string, {
    source: "certificate_transparency" | "common_pattern";
    ipAddresses: string[];
    status: "active" | "inactive";
  }>();

  // Query Certificate Transparency logs for apex domain
  const ctSubdomains = await queryCertificateTransparency(apexDomain);
  
  // Check common subdomain patterns for apex domain
  const commonSubdomains = await checkCommonSubdomains(apexDomain);

  // Add CT subdomains to map
  for (const subdomain of ctSubdomains) {
    if (!discoveredSubdomains.has(subdomain)) {
      discoveredSubdomains.set(subdomain, {
        source: "certificate_transparency",
        ipAddresses: [],
        status: "inactive"
      });
    }
  }

  // Add common subdomains to map
  for (const subdomain of commonSubdomains) {
    if (!discoveredSubdomains.has(subdomain)) {
      discoveredSubdomains.set(subdomain, {
        source: "common_pattern",
        ipAddresses: [],
        status: "inactive"
      });
    }
  }

  // Resolve all discovered subdomains
  const resolvePromises = Array.from(discoveredSubdomains.keys()).map(async (subdomain) => {
    const result = await resolveSubdomain(subdomain);
    const existing = discoveredSubdomains.get(subdomain)!;
    discoveredSubdomains.set(subdomain, {
      ...existing,
      ipAddresses: result.ipAddresses,
      status: result.status
    });
  });

  await Promise.all(resolvePromises);

  // Convert to array format
  const subdomains: Subdomain[] = Array.from(discoveredSubdomains.entries()).map(([subdomain, data]) => ({
    subdomain,
    ipAddresses: data.ipAddresses,
    status: data.status,
    source: data.source,
    discoveredAt: new Date().toISOString()
  }));

  // Calculate sources
  const sources = {
    certificateTransparency: subdomains.filter(s => s.source === "certificate_transparency").length,
    commonPatterns: subdomains.filter(s => s.source === "common_pattern").length
  };

  return {
    totalSubdomains: subdomains.length,
    activeSubdomains: subdomains.filter(s => s.status === "active").length,
    subdomains: subdomains.sort((a, b) => {
      // Sort by status first (active first), then alphabetically
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }
      return a.subdomain.localeCompare(b.subdomain);
    }),
    sources
  };
}
