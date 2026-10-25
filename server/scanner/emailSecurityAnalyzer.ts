import { promises as dns } from 'dns';
import type { EmailSecurity } from '@shared/schema';

export async function analyzeEmailSecurity(domain: string): Promise<EmailSecurity | null> {
  try {
    const issues: string[] = [];
    let score = 100;

    // Check SPF record
    let hasSPF = false;
    let spfRecord: string | undefined;
    try {
      const txtRecords = await dns.resolveTxt(domain);
      const spfRecords = txtRecords
        .flat()
        .filter(record => record.startsWith('v=spf1'));
      
      if (spfRecords.length > 0) {
        hasSPF = true;
        spfRecord = spfRecords[0];
      } else {
        score -= 35;
        issues.push('No SPF record found - email spoofing is possible');
      }
    } catch (error) {
      score -= 35;
      issues.push('SPF record not configured');
    }

    // Check DMARC record
    let hasDMARC = false;
    let dmarcRecord: string | undefined;
    let dmarcPolicy: string | undefined;
    try {
      const dmarcDomain = `_dmarc.${domain}`;
      const txtRecords = await dns.resolveTxt(dmarcDomain);
      const dmarcRecords = txtRecords
        .flat()
        .filter(record => record.startsWith('v=DMARC1'));
      
      if (dmarcRecords.length > 0) {
        hasDMARC = true;
        dmarcRecord = dmarcRecords[0];
        
        // Extract policy
        const policyMatch = dmarcRecord.match(/p=(none|quarantine|reject)/);
        if (policyMatch) {
          dmarcPolicy = policyMatch[1];
          
          // Score based on policy strength
          if (dmarcPolicy === 'reject') {
            // Best policy
          } else if (dmarcPolicy === 'quarantine') {
            score -= 10;
            issues.push('DMARC policy is "quarantine" - consider upgrading to "reject" for stronger protection');
          } else if (dmarcPolicy === 'none') {
            score -= 20;
            issues.push('DMARC policy is "none" - not enforcing email authentication');
          }
        }
      } else {
        score -= 35;
        issues.push('No DMARC record found - email authentication not enforced');
      }
    } catch (error) {
      score -= 35;
      issues.push('DMARC record not configured');
    }

    // Check DKIM (more complex - we can only check if DNS is set up for common selectors)
    let hasDKIM = false;
    const commonSelectors = ['default', 'google', 'k1', 'selector1', 'selector2', 'dkim'];
    
    for (const selector of commonSelectors) {
      try {
        const dkimDomain = `${selector}._domainkey.${domain}`;
        const txtRecords = await dns.resolveTxt(dkimDomain);
        const dkimRecords = txtRecords
          .flat()
          .filter(record => record.includes('DKIM') || record.includes('p='));
        
        if (dkimRecords.length > 0) {
          hasDKIM = true;
          break;
        }
      } catch (error) {
        // Continue checking other selectors
      }
    }

    if (!hasDKIM) {
      score -= 30;
      issues.push('No DKIM records found for common selectors - email integrity cannot be verified');
    }

    // Final score
    score = Math.max(0, score);

    return {
      hasSPF,
      hasDKIM,
      hasDMARC,
      spfRecord,
      dmarcPolicy,
      dmarcRecord,
      score,
      issues,
    };
  } catch (error) {
    console.error('Email security check failed:', error);
    return null;
  }
}
