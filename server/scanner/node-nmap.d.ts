declare module 'node-nmap' {
  export var nmapLocation: string;
  
  export class NmapScan {
    constructor(range: string, flags?: string);
    on(event: 'complete', callback: (data: any[]) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    startScan(): void;
    cancelScan(): void;
  }
  
  export class QuickScan extends NmapScan {}
  export class OsAndPortScan extends NmapScan {}
  export class QueuedNmapScan extends NmapScan {}
}
