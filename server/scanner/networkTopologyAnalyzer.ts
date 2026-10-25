import * as nmap from 'node-nmap';

export interface NetworkHost {
  ip: string;
  hostname?: string;
  mac?: string;
  vendor?: string;
  osNmap?: string;
  openPorts: NetworkPort[];
  state: 'up' | 'down' | 'unknown';
}

export interface NetworkPort {
  port: number;
  protocol: 'tcp' | 'udp';
  state: 'open' | 'closed' | 'filtered';
  service?: string;
  version?: string;
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

/**
 * Analyzes network topology using Nmap
 * Performs OS and port detection on the target host
 */
export async function analyzeNetworkTopology(hostname: string): Promise<NetworkTopology> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    // Note: nmap.nmapLocation will use system PATH to find nmap automatically
    
    // Create a scan with OS detection and service version detection
    // Using -sV for version detection and -O for OS detection
    // Note: OS detection requires root privileges, so we'll use a lighter scan
    const scan = new nmap.OsAndPortScan(hostname, '-p 1-1000');
    
    const results: NetworkHost[] = [];
    
    scan.on('complete', (data: any[]) => {
      const scanDuration = Date.now() - startTime;
      
      // Parse nmap results
      for (const host of data) {
        const networkHost: NetworkHost = {
          ip: host.ip || hostname,
          hostname: host.hostname || undefined,
          mac: host.mac || undefined,
          vendor: host.vendor || undefined,
          osNmap: host.osNmap || undefined,
          openPorts: [],
          state: 'up'
        };
        
        // Parse open ports
        if (host.openPorts && Array.isArray(host.openPorts)) {
          networkHost.openPorts = host.openPorts.map((port: any) => ({
            port: parseInt(port.port) || 0,
            protocol: port.protocol || 'tcp',
            state: 'open',
            service: port.service || undefined,
            version: port.version || undefined
          }));
        }
        
        results.push(networkHost);
      }
      
      const hostsUp = results.filter(h => h.state === 'up').length;
      
      resolve({
        targetHost: hostname,
        scanDate: new Date().toISOString(),
        totalHosts: results.length,
        hostsUp,
        hostsDown: results.length - hostsUp,
        hosts: results,
        scanType: 'OS and Port Scan (ports 1-1000)',
        scanDuration
      });
    });
    
    scan.on('error', (error: Error) => {
      // If nmap fails, return a minimal topology
      console.error('Nmap scan error:', error.message);
      resolve({
        targetHost: hostname,
        scanDate: new Date().toISOString(),
        totalHosts: 0,
        hostsUp: 0,
        hostsDown: 0,
        hosts: [],
        scanType: 'OS and Port Scan (failed)',
        scanDuration: Date.now() - startTime
      });
    });
    
    // Start the scan with a timeout of 60 seconds
    try {
      scan.startScan();
      
      // Safety timeout to prevent hanging
      setTimeout(() => {
        scan.cancelScan();
        resolve({
          targetHost: hostname,
          scanDate: new Date().toISOString(),
          totalHosts: 0,
          hostsUp: 0,
          hostsDown: 0,
          hosts: [],
          scanType: 'OS and Port Scan (timeout)',
          scanDuration: Date.now() - startTime
        });
      }, 60000); // 60 second timeout
    } catch (error) {
      resolve({
        targetHost: hostname,
        scanDate: new Date().toISOString(),
        totalHosts: 0,
        hostsUp: 0,
        hostsDown: 0,
        hosts: [],
        scanType: 'OS and Port Scan (error)',
        scanDuration: Date.now() - startTime
      });
    }
  });
}
