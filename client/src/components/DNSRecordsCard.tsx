import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DNSRecord } from "@shared/schema";
import { Globe } from "lucide-react";

interface DNSRecordsCardProps {
  records: DNSRecord[];
}

export function DNSRecordsCard({ records }: DNSRecordsCardProps) {
  return (
    <Card className="border-card-border" data-testid="card-dns">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
        <div className="p-2 rounded-md bg-primary/10">
          <Globe className="w-5 h-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-xl">DNS Records</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {records.length} DNS records found
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {records.map((record, index) => (
            <div
              key={`${record.type}-${index}`}
              className="flex items-center justify-between p-3 rounded-md bg-muted/50"
              data-testid={`dns-record-${index}`}
            >
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground min-w-[60px]">
                {record.type}
              </span>
              <span className="text-sm font-mono flex-1 ml-4 break-all">
                {record.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
