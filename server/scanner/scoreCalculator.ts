import { SecurityScoreBreakdown, SecurityHeader, Vulnerability, SSLCertificate } from "@shared/schema";

export function calculateSecurityScore(
  sslCertificate: SSLCertificate,
  headers: SecurityHeader[],
  vulnerabilities: Vulnerability[]
): {
  overallScore: number;
  letterGrade: "A" | "B" | "C" | "D" | "F";
  scoreBreakdown: SecurityScoreBreakdown[];
} {
  // SSL/TLS Score (30% weight)
  let sslScore = 100;
  if (!sslCertificate.valid || sslCertificate.daysRemaining <= 0) {
    sslScore = 0;
  } else if (sslCertificate.daysRemaining < 30) {
    sslScore = 70;
  } else if (sslCertificate.protocol.includes("TLSv1.0") || sslCertificate.protocol.includes("TLSv1.1")) {
    sslScore = 60;
  }

  // Security Headers Score (30% weight)
  const criticalHeaders = headers.filter(h => 
    h.severity === "high" || h.severity === "critical"
  );
  const presentCriticalHeaders = criticalHeaders.filter(h => h.present);
  const headersScore = criticalHeaders.length > 0
    ? (presentCriticalHeaders.length / criticalHeaders.length) * 100
    : 100;

  // Vulnerability Score (40% weight)
  let vulnScore = 100;
  const criticalVulns = vulnerabilities.filter(v => v.severity === "critical").length;
  const highVulns = vulnerabilities.filter(v => v.severity === "high").length;
  const mediumVulns = vulnerabilities.filter(v => v.severity === "medium").length;
  const lowVulns = vulnerabilities.filter(v => v.severity === "low").length;

  vulnScore -= criticalVulns * 25;
  vulnScore -= highVulns * 15;
  vulnScore -= mediumVulns * 8;
  vulnScore -= lowVulns * 3;
  vulnScore = Math.max(0, vulnScore);

  // Calculate weighted overall score
  const overallScore = Math.round(
    (sslScore * 0.3) + (headersScore * 0.3) + (vulnScore * 0.4)
  );

  // Determine letter grade
  let letterGrade: "A" | "B" | "C" | "D" | "F";
  if (overallScore >= 90) letterGrade = "A";
  else if (overallScore >= 80) letterGrade = "B";
  else if (overallScore >= 70) letterGrade = "C";
  else if (overallScore >= 60) letterGrade = "D";
  else letterGrade = "F";

  const scoreBreakdown: SecurityScoreBreakdown[] = [
    {
      category: "SSL/TLS Security",
      score: Math.round(sslScore),
      maxScore: 100,
      weight: 30,
    },
    {
      category: "Security Headers",
      score: Math.round(headersScore),
      maxScore: 100,
      weight: 30,
    },
    {
      category: "Vulnerability Assessment",
      score: Math.round(vulnScore),
      maxScore: 100,
      weight: 40,
    },
  ];

  return {
    overallScore,
    letterGrade,
    scoreBreakdown,
  };
}
