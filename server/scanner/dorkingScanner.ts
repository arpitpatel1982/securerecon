import https from 'https';
import http from 'http';

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

export interface DorkingResult {
  exposedFiles: ExposedResource[];
  interestingPaths: string[];
  findings: string[];
  totalExposed: number;
}

// Common sensitive files and paths to check
const SENSITIVE_PATHS = [
  // Version control
  { path: '.git/config', type: 'file', severity: 'critical', description: 'Exposed Git repository configuration - may contain credentials and repository history' },
  { path: '.git/HEAD', type: 'file', severity: 'critical', description: 'Git repository exposed - entire codebase may be downloadable' },
  { path: '.svn/entries', type: 'file', severity: 'critical', description: 'SVN repository exposed - source code may be accessible' },
  
  // Environment and configuration
  { path: '.env', type: 'config', severity: 'critical', description: 'Environment file exposed - likely contains API keys, database credentials, secrets' },
  { path: '.env.production', type: 'config', severity: 'critical', description: 'Production environment file exposed with sensitive credentials' },
  { path: '.env.local', type: 'config', severity: 'critical', description: 'Local environment file exposed' },
  { path: 'config.json', type: 'config', severity: 'high', description: 'Configuration file exposed - may contain sensitive settings' },
  { path: 'config.php', type: 'config', severity: 'high', description: 'PHP configuration file exposed' },
  { path: 'wp-config.php', type: 'config', severity: 'critical', description: 'WordPress configuration exposed - contains database credentials' },
  { path: 'config/database.yml', type: 'config', severity: 'critical', description: 'Database configuration exposed' },
  
  // Backup files
  { path: 'backup.sql', type: 'file', severity: 'critical', description: 'SQL database backup exposed - full database dump accessible' },
  { path: 'backup.zip', type: 'file', severity: 'high', description: 'Backup archive exposed' },
  { path: 'db_backup.sql', type: 'file', severity: 'critical', description: 'Database backup exposed' },
  { path: 'backup.tar.gz', type: 'file', severity: 'high', description: 'Compressed backup exposed' },
  
  // Admin panels and sensitive endpoints
  { path: 'admin', type: 'endpoint', severity: 'medium', description: 'Admin panel accessible' },
  { path: 'admin/', type: 'endpoint', severity: 'medium', description: 'Admin panel accessible' },
  { path: 'administrator', type: 'endpoint', severity: 'medium', description: 'Administrator panel accessible' },
  { path: 'wp-admin', type: 'endpoint', severity: 'medium', description: 'WordPress admin panel accessible' },
  { path: 'phpmyadmin', type: 'endpoint', severity: 'high', description: 'phpMyAdmin interface exposed' },
  { path: 'phpMyAdmin', type: 'endpoint', severity: 'high', description: 'phpMyAdmin interface exposed' },
  { path: 'adminer.php', type: 'endpoint', severity: 'high', description: 'Adminer database management tool exposed' },
  
  // Information disclosure
  { path: 'robots.txt', type: 'file', severity: 'low', description: 'Robots.txt file - may reveal interesting directories' },
  { path: 'sitemap.xml', type: 'file', severity: 'low', description: 'Sitemap - reveals site structure' },
  { path: '.htaccess', type: 'config', severity: 'medium', description: 'Apache configuration file exposed' },
  { path: 'web.config', type: 'config', severity: 'medium', description: 'IIS configuration file exposed' },
  { path: 'composer.json', type: 'file', severity: 'low', description: 'PHP dependencies file - reveals technology stack' },
  { path: 'package.json', type: 'file', severity: 'low', description: 'Node.js dependencies file - reveals technology stack' },
  { path: 'package-lock.json', type: 'file', severity: 'low', description: 'NPM lock file - reveals exact dependency versions' },
  
  // Server info
  { path: 'phpinfo.php', type: 'file', severity: 'critical', description: 'PHP configuration info exposed - reveals server details, paths, settings' },
  { path: 'info.php', type: 'file', severity: 'critical', description: 'PHP info page exposed' },
  { path: 'server-status', type: 'endpoint', severity: 'high', description: 'Apache server status page exposed' },
  { path: 'server-info', type: 'endpoint', severity: 'high', description: 'Apache server info page exposed' },
  
  // Common files
  { path: 'README.md', type: 'file', severity: 'low', description: 'README file - may contain setup instructions or sensitive info' },
  { path: 'CHANGELOG.md', type: 'file', severity: 'low', description: 'Changelog - reveals version history' },
  { path: '.DS_Store', type: 'file', severity: 'medium', description: 'macOS metadata file - may reveal directory structure' },
  { path: 'Thumbs.db', type: 'file', severity: 'low', description: 'Windows thumbnail cache exposed' },
] as const;

async function checkPath(baseUrl: string, path: string): Promise<{ found: boolean; statusCode?: number; contentSnippet?: string }> {
  return new Promise((resolve) => {
    const url = `${baseUrl}/${path}`;
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;
    
    const request = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SecureRecon-Scanner/1.0)',
      },
      timeout: 5000,
      rejectUnauthorized: false,
    }, (response) => {
      let data = '';
      
      // Only collect small snippet of data
      response.on('data', (chunk) => {
        if (data.length < 500) {
          data += chunk.toString();
        }
      });
      
      response.on('end', () => {
        const statusCode = response.statusCode || 0;
        // Consider 200-299 and 403 (forbidden but exists) as found
        const found = (statusCode >= 200 && statusCode < 300) || statusCode === 403;
        
        resolve({
          found,
          statusCode,
          contentSnippet: data.substring(0, 200),
        });
      });
    });
    
    request.on('error', () => {
      resolve({ found: false });
    });
    
    request.on('timeout', () => {
      request.destroy();
      resolve({ found: false });
    });
  });
}

async function extractRobotsTxtPaths(baseUrl: string): Promise<string[]> {
  try {
    const result = await checkPath(baseUrl, 'robots.txt');
    if (!result.found || !result.contentSnippet) {
      return [];
    }
    
    const paths: string[] = [];
    const lines = result.contentSnippet.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Extract Disallow and Allow paths
      if (trimmed.startsWith('Disallow:') || trimmed.startsWith('Allow:')) {
        const path = trimmed.split(':')[1]?.trim();
        if (path && path !== '/' && path.length > 1) {
          paths.push(path.replace(/^\//, '')); // Remove leading slash
        }
      }
      // Extract Sitemap URLs
      if (trimmed.startsWith('Sitemap:')) {
        const sitemapUrl = trimmed.split(':').slice(1).join(':').trim();
        if (sitemapUrl) {
          paths.push(`Sitemap found: ${sitemapUrl}`);
        }
      }
    }
    
    return Array.from(new Set(paths)); // Remove duplicates
  } catch (error) {
    return [];
  }
}

export async function performDorking(targetUrl: string): Promise<DorkingResult> {
  // Extract origin (scheme + hostname + port) to probe site root, not a specific path
  const parsedUrl = new URL(targetUrl);
  const baseUrl = parsedUrl.origin; // e.g., "https://example.com" (no trailing slash, no path)
  const exposedFiles: ExposedResource[] = [];
  const findings: string[] = [];
  
  // Check all sensitive paths
  const checks = SENSITIVE_PATHS.map(async (item) => {
    const result = await checkPath(baseUrl, item.path);
    
    const resource: ExposedResource = {
      type: item.type as any,
      path: item.path,
      url: `${baseUrl}/${item.path}`,
      severity: item.severity as any,
      description: item.description,
      found: result.found,
      statusCode: result.statusCode,
      contentSnippet: result.contentSnippet,
    };
    
    return resource;
  });
  
  const results = await Promise.all(checks);
  
  // Filter to only exposed resources
  const exposed = results.filter(r => r.found);
  exposedFiles.push(...exposed);
  
  // Extract interesting paths from robots.txt
  const robotsPaths = await extractRobotsTxtPaths(baseUrl);
  
  // Generate findings
  if (exposed.length > 0) {
    const criticalCount = exposed.filter(e => e.severity === 'critical').length;
    const highCount = exposed.filter(e => e.severity === 'high').length;
    
    if (criticalCount > 0) {
      findings.push(`Found ${criticalCount} critical exposed resources (credentials, source code, or database files)`);
    }
    if (highCount > 0) {
      findings.push(`Found ${highCount} high-severity exposed resources (admin panels, configuration files)`);
    }
    
    // Specific findings
    if (exposed.some(e => e.path.includes('.git'))) {
      findings.push('Git repository exposed - entire source code may be downloadable');
    }
    if (exposed.some(e => e.path.includes('.env'))) {
      findings.push('Environment files exposed - likely contains API keys and credentials');
    }
    if (exposed.some(e => e.path.includes('backup') || e.path.includes('.sql'))) {
      findings.push('Database backups accessible - sensitive data exposure risk');
    }
    if (exposed.some(e => e.path.includes('phpinfo') || e.path.includes('info.php'))) {
      findings.push('Server configuration pages exposed - reveals system information');
    }
  } else {
    findings.push('No critical exposed files detected');
  }
  
  if (robotsPaths.length > 0) {
    findings.push(`Robots.txt reveals ${robotsPaths.length} interesting paths`);
  }
  
  return {
    exposedFiles: exposed,
    interestingPaths: robotsPaths,
    findings,
    totalExposed: exposed.length,
  };
}
