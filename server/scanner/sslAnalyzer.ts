import https from "https";
import tls from "tls";
import { SSLCertificate, Vulnerability } from "@shared/schema";

export async function analyzeSSL(hostname: string): Promise<{
  certificate: SSLCertificate;
  issues: Vulnerability[];
}> {
  return new Promise((resolve, reject) => {
    const options = {
      host: hostname,
      port: 443,
      method: "GET",
      rejectUnauthorized: false,
      agent: false,
    };

    const req = https.request(options, (res) => {
      const cert = (res.socket as tls.TLSSocket).getPeerCertificate();
      
      if (!cert || Object.keys(cert).length === 0) {
        reject(new Error("Unable to retrieve SSL certificate"));
        return;
      }

      const validFrom = new Date(cert.valid_from);
      const validTo = new Date(cert.valid_to);
      const now = new Date();
      const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isValid = now >= validFrom && now <= validTo;

      const socket = res.socket as tls.TLSSocket;
      const protocol = socket.getProtocol() || "Unknown";
      const cipher = socket.getCipher();

      const certificate: SSLCertificate = {
        valid: isValid,
        issuer: cert.issuer?.O || cert.issuer?.CN || "Unknown",
        validFrom: validFrom.toISOString(),
        validTo: validTo.toISOString(),
        daysRemaining,
        protocol,
        cipher: cipher ? `${cipher.name} (${cipher.version})` : "Unknown",
      };

      const issues: Vulnerability[] = [];

      if (!isValid) {
        issues.push({
          id: "ssl-expired",
          title: "SSL Certificate Expired",
          severity: "critical",
          category: "SSL/TLS",
          description: "The SSL certificate has expired and is no longer valid.",
          affectedComponent: "SSL Certificate",
          remediation: "Renew the SSL certificate immediately to maintain secure connections.",
        });
      } else if (daysRemaining < 30) {
        issues.push({
          id: "ssl-expiring-soon",
          title: "SSL Certificate Expiring Soon",
          severity: "high",
          category: "SSL/TLS",
          description: `The SSL certificate will expire in ${daysRemaining} days.`,
          affectedComponent: "SSL Certificate",
          remediation: "Plan to renew the certificate before expiration to avoid service disruption.",
        });
      }

      if (protocol.includes("TLSv1.0") || protocol.includes("TLSv1.1")) {
        issues.push({
          id: "ssl-weak-protocol",
          title: "Weak TLS Protocol Version",
          severity: "high",
          category: "SSL/TLS",
          description: "The server supports outdated TLS protocol versions (TLSv1.0 or TLSv1.1).",
          affectedComponent: "TLS Protocol",
          remediation: "Disable TLSv1.0 and TLSv1.1, and only support TLSv1.2 and TLSv1.3.",
        });
      }

      resolve({ certificate, issues });
      req.abort();
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.end();
  });
}
