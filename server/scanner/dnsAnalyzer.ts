import { promises as dns } from "dns";
import { DNSRecord } from "@shared/schema";

export async function analyzeDNS(hostname: string): Promise<DNSRecord[]> {
  const records: DNSRecord[] = [];

  try {
    // A records
    const aRecords = await dns.resolve4(hostname);
    aRecords.forEach(ip => {
      records.push({ type: "A", value: ip });
    });
  } catch (err) {
    // A records might not exist
  }

  try {
    // AAAA records (IPv6)
    const aaaaRecords = await dns.resolve6(hostname);
    aaaaRecords.forEach(ip => {
      records.push({ type: "AAAA", value: ip });
    });
  } catch (err) {
    // AAAA records might not exist
  }

  try {
    // MX records
    const mxRecords = await dns.resolveMx(hostname);
    mxRecords.forEach(mx => {
      records.push({ type: "MX", value: `${mx.exchange} (priority: ${mx.priority})` });
    });
  } catch (err) {
    // MX records might not exist
  }

  try {
    // NS records
    const nsRecords = await dns.resolveNs(hostname);
    nsRecords.forEach(ns => {
      records.push({ type: "NS", value: ns });
    });
  } catch (err) {
    // NS records might not exist
  }

  try {
    // TXT records
    const txtRecords = await dns.resolveTxt(hostname);
    txtRecords.forEach(txt => {
      records.push({ type: "TXT", value: txt.join(" ") });
    });
  } catch (err) {
    // TXT records might not exist
  }

  return records;
}
