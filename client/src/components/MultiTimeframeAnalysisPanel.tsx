import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, TrendingUp, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { Badge } from "./ui/badge";

interface MultiTimeframeAnalysisPanelProps {
  symbol: string;
}

export function MultiTimeframeAnalysisPanel({ symbol }: MultiTimeframeAnalysisPanelProps) {
  const { data: mta, isLoading } = trpc.mta.get.useQuery(
    { symbol },
    { enabled: !!symbol, refetchInterval: 60000 * 15 } // Refresh every 15 minutes
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!mta) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">Multi-Timeframe Analysis unavailable</p>
        </CardContent>
      </Card>
    );
  }

  const getSignalBadgeVariant = (signal: string): "default" | "destructive" | "secondary" | "outline" => {
    if (signal.includes('buy')) return 'default';
    if (signal.includes('sell')) return 'destructive';
    return 'secondary';
  };

  const getDirectionIcon = (direction: string) => {
    if (direction === 'bullish') return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (direction === 'bearish') return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <CardTitle className="text-lg">Multi-Timeframe Analysis</CardTitle>
          </div>
          <Badge variant={getSignalBadgeVariant(mta.overallSignal)} className="capitalize">
            {mta.overallSignal.replace('_', ' ')}
          </Badge>
        </div>
        <CardDescription>
          Overall Signal: {mta.overallSummary}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {mta.analysis.map((analysis, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-sm">{analysis.timeframe}</p>
                <Badge variant={getSignalBadgeVariant(analysis.signal)} className="capitalize text-xs">
                  {analysis.signal}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {getDirectionIcon(analysis.trend)}
                <p className="capitalize">{analysis.trend} trend</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{analysis.reason}</p>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
