import { DarkWebExposure } from "@shared/schema";

// Simulated dark web breach database
// In production, this would query real threat intelligence APIs
const SIMULATED_BREACHES = [
  {
    domains: ["example.com", "test.com", "demo.com"],
    source: "DataBreach2023 Incident",
    breachDate: "2023-03-15",
    dataTypes: ["Email addresses", "Passwords", "Usernames"],
    recordsAffected: 125000,
    severity: "critical" as const,
  },
  {
    domains: ["github.com", "gitlab.com"],
    source: "CodeRepo Leak",
    breachDate: "2022-11-08",
    dataTypes: ["Email addresses", "User profiles", "Repository data"],
    recordsAffected: 50000,
    severity: "high" as const,
  },
  {
    domains: ["stackoverflow.com", "stackexchange.com"],
    source: "Stack Network Exposure",
    breachDate: "2021-05-12",
    dataTypes: ["Email addresses", "Profile information"],
    recordsAffected: 180000,
    severity: "medium" as const,
  },
];

export function checkDarkWebExposure(hostname: string): DarkWebExposure[] {
  const exposures: DarkWebExposure[] = [];

  // Check if the hostname matches any known breaches in our simulated database
  for (const breach of SIMULATED_BREACHES) {
    const matchingDomain = breach.domains.find(domain => 
      hostname.includes(domain) || domain.includes(hostname)
    );

    if (matchingDomain) {
      exposures.push({
        source: breach.source,
        breachDate: breach.breachDate,
        dataTypes: breach.dataTypes,
        recordsAffected: breach.recordsAffected,
        severity: breach.severity,
      });
    }
  }

  return exposures;
}
