import { SecurityHeader } from "@shared/schema";

export function analyzeSecurityHeaders(headers: Record<string, string | string[] | undefined>): SecurityHeader[] {
  const normalizeHeader = (name: string): string | undefined => {
    const value = headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  };

  const securityHeaders: SecurityHeader[] = [
    {
      name: "Content-Security-Policy",
      present: !!normalizeHeader("content-security-policy"),
      value: normalizeHeader("content-security-policy"),
      severity: normalizeHeader("content-security-policy") ? "pass" : "high",
      description: "Controls which resources the browser is allowed to load for your page.",
      recommendation: "Implement a strict CSP to prevent XSS attacks. Example: default-src 'self'; script-src 'self' 'unsafe-inline';",
    },
    {
      name: "Strict-Transport-Security",
      present: !!normalizeHeader("strict-transport-security"),
      value: normalizeHeader("strict-transport-security"),
      severity: normalizeHeader("strict-transport-security") ? "pass" : "high",
      description: "Forces browsers to only connect via HTTPS.",
      recommendation: "Add HSTS header with max-age of at least 31536000 seconds (1 year).",
    },
    {
      name: "X-Frame-Options",
      present: !!normalizeHeader("x-frame-options"),
      value: normalizeHeader("x-frame-options"),
      severity: normalizeHeader("x-frame-options") ? "pass" : "medium",
      description: "Prevents clickjacking attacks by controlling whether your site can be embedded in frames.",
      recommendation: "Set to 'DENY' or 'SAMEORIGIN' to prevent clickjacking.",
    },
    {
      name: "X-Content-Type-Options",
      present: !!normalizeHeader("x-content-type-options"),
      value: normalizeHeader("x-content-type-options"),
      severity: normalizeHeader("x-content-type-options") ? "pass" : "medium",
      description: "Prevents MIME type sniffing.",
      recommendation: "Set to 'nosniff' to prevent browsers from MIME-sniffing responses.",
    },
    {
      name: "Referrer-Policy",
      present: !!normalizeHeader("referrer-policy"),
      value: normalizeHeader("referrer-policy"),
      severity: normalizeHeader("referrer-policy") ? "pass" : "low",
      description: "Controls how much referrer information is shared.",
      recommendation: "Set to 'no-referrer' or 'strict-origin-when-cross-origin' for privacy.",
    },
    {
      name: "Permissions-Policy",
      present: !!normalizeHeader("permissions-policy"),
      value: normalizeHeader("permissions-policy"),
      severity: normalizeHeader("permissions-policy") ? "pass" : "low",
      description: "Controls which browser features and APIs can be used.",
      recommendation: "Restrict unnecessary features like geolocation, microphone, camera, etc.",
    },
    {
      name: "X-XSS-Protection",
      present: !!normalizeHeader("x-xss-protection"),
      value: normalizeHeader("x-xss-protection"),
      severity: normalizeHeader("x-xss-protection") ? "pass" : "low",
      description: "Legacy XSS protection (mostly superseded by CSP).",
      recommendation: "Set to '1; mode=block' for legacy browser support, but prioritize CSP.",
    },
  ];

  return securityHeaders;
}
