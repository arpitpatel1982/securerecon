import { whoisDomain, firstResult } from 'whoiser';
import type { WHOISInfo } from '@shared/schema';

export async function analyzeWHOIS(hostname: string): Promise<WHOISInfo | null> {
  try {
    const whoisData = await whoisDomain(hostname, { follow: 2 });
    
    // whoiser returns data from multiple WHOIS servers, get the most detailed one
    const serverKeys = Object.keys(whoisData);
    if (serverKeys.length === 0) {
      return null;
    }

    // Get the registrar data (usually the second server response has more details)
    const registrarData = serverKeys.length > 1 ? whoisData[serverKeys[1]] : whoisData[serverKeys[0]];
    
    if (!registrarData || typeof registrarData === 'string') {
      return null;
    }

    // Extract domain info with various field name variations
    const domainName = registrarData['Domain Name'] || 
                      registrarData['domain'] || 
                      registrarData['domain_name'] || 
                      hostname;

    const registrar = registrarData['Registrar'] || 
                     registrarData['registrar'] || 
                     registrarData['Sponsoring Registrar'] ||
                     'Unknown';

    const creationDate = registrarData['Creation Date'] || 
                        registrarData['Created Date'] ||
                        registrarData['created'] ||
                        registrarData['Registered on'] ||
                        'Unknown';

    const expirationDate = registrarData['Registry Expiry Date'] ||
                          registrarData['Registrar Registration Expiration Date'] ||
                          registrarData['Expiry Date'] ||
                          registrarData['expires'] ||
                          registrarData['Expiry date'] ||
                          'Unknown';

    const lastUpdated = registrarData['Updated Date'] ||
                       registrarData['Last Updated'] ||
                       registrarData['updated'] ||
                       registrarData['Last update of WHOIS database'] ||
                       'Unknown';

    // Parse name servers
    let nameServers: string[] = [];
    const nsField = registrarData['Name Server'] || 
                   registrarData['name_servers'] || 
                   registrarData['nserver'] ||
                   [];
    
    if (Array.isArray(nsField)) {
      nameServers = nsField.map(ns => typeof ns === 'string' ? ns.toLowerCase() : String(ns).toLowerCase());
    } else if (typeof nsField === 'string') {
      nameServers = [nsField.toLowerCase()];
    }

    // Parse status
    let status: string[] = [];
    const statusField = registrarData['Domain Status'] || 
                       registrarData['status'] ||
                       [];
    
    if (Array.isArray(statusField)) {
      status = statusField.map(s => typeof s === 'string' ? s : String(s));
    } else if (typeof statusField === 'string') {
      status = [statusField];
    }

    // Calculate days until expiration
    let daysUntilExpiration = 0;
    if (expirationDate && expirationDate !== 'Unknown') {
      // Handle array values by taking the first element
      const dateStr = Array.isArray(expirationDate) ? expirationDate[0] : expirationDate;
      const expDate = new Date(String(dateStr));
      const now = new Date();
      daysUntilExpiration = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    const registrantOrg = registrarData['Registrant Organization'] ||
                         registrarData['org'] ||
                         undefined;

    const registrantCountry = registrarData['Registrant Country'] ||
                             registrarData['country'] ||
                             undefined;

    return {
      domainName: String(domainName),
      registrar: String(registrar),
      creationDate: String(creationDate),
      expirationDate: String(expirationDate),
      lastUpdated: String(lastUpdated),
      daysUntilExpiration,
      nameServers,
      status,
      registrantOrg: registrantOrg ? String(registrantOrg) : undefined,
      registrantCountry: registrantCountry ? String(registrantCountry) : undefined,
    };
  } catch (error) {
    console.error('WHOIS lookup failed:', error);
    return null;
  }
}
