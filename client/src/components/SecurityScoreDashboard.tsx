import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreCircle } from "./ScoreCircle";
import { Progress } from "@/components/ui/progress";
import { SecurityScoreBreakdown } from "@shared/schema";
import { Shield, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { format } from "date-fns";

interface SecurityScoreDashboardProps {
  score: number;
  letterGrade: string;
  scoreBreakdown: SecurityScoreBreakdown[];
  timestamp: string;
  riskSummary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export function SecurityScoreDashboard({
  score,
  letterGrade,
  scoreBreakdown,
  timestamp,
  riskSummary,
}: SecurityScoreDashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2 border-card-border" data-testid="card-overall-score">
        <CardHeader>
          <CardTitle className="text-xl">Overall Security Score</CardTitle>
          <p className="text-sm text-muted-foreground">
            {timestamp ? `Last scanned ${format(new Date(timestamp), "PPpp")}` : "Just completed"}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-shrink-0">
              <ScoreCircle score={score} size={200} strokeWidth={14} />
            </div>
            
            <div className="flex-1 w-full space-y-4">
              {scoreBreakdown?.map((item) => (
                <div key={item.category} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-muted-foreground">
                      {item.score} / {item.maxScore}
                    </span>
                  </div>
                  <Progress 
                    value={(item.score / item.maxScore) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-card-border" data-testid="card-risk-summary">
        <CardHeader>
          <CardTitle className="text-xl">Risk Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-md bg-critical/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-critical" />
              <span className="text-sm font-medium">Critical</span>
            </div>
            <span className="text-2xl font-bold text-critical" data-testid="text-critical-count">
              {riskSummary.critical}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-high/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-high" />
              <span className="text-sm font-medium">High</span>
            </div>
            <span className="text-2xl font-bold text-high" data-testid="text-high-count">
              {riskSummary.high}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-medium/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-medium" />
              <span className="text-sm font-medium">Medium</span>
            </div>
            <span className="text-2xl font-bold text-medium" data-testid="text-medium-count">
              {riskSummary.medium}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-low/10">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-low" />
              <span className="text-sm font-medium">Low</span>
            </div>
            <span className="text-2xl font-bold text-low" data-testid="text-low-count">
              {riskSummary.low}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
