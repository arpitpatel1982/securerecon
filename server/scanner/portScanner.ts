import { PortInfo } from "@shared/schema";

// Common ports and their services
const COMMON_PORTS = [
  { port: 80, service: "HTTP" },
  { port: 443, service: "HTTPS" },
  { port: 22, service: "SSH" },
  { port: 21, service: "FTP" },
  { port: 25, service: "SMTP" },
  { port: 3306, service: "MySQL" },
  { port: 5432, service: "PostgreSQL" },
  { port: 27017, service: "MongoDB" },
  { port: 6379, service: "Redis" },
  { port: 8080, service: "HTTP-Alt" },
];

export async function scanPorts(hostname: string): Promise<PortInfo[]> {
  // Note: Actual port scanning requires elevated privileges and can be
  // blocked by firewalls. This is a simulated response for MVP.
  // In production, you would use tools like nmap or specialized libraries.
  
  const openPorts: PortInfo[] = [];

  // Simulate that HTTPS (443) is typically open for web servers
  openPorts.push({
    port: 443,
    service: "HTTPS",
    state: "open",
    version: "TLSv1.3",
  });

  // Simulate HTTP (80) being open
  openPorts.push({
    port: 80,
    service: "HTTP",
    state: "open",
  });

  // Randomly simulate some other ports being open based on hostname
  // This makes the demo more realistic without actually scanning
  const hash = hostname.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  if (hash % 3 === 0) {
    openPorts.push({
      port: 22,
      service: "SSH",
      state: "open",
      version: "OpenSSH 8.2",
    });
  }

  if (hash % 5 === 0) {
    openPorts.push({
      port: 8080,
      service: "HTTP-Alt",
      state: "open",
    });
  }

  return openPorts.sort((a, b) => a.port - b.port);
}
