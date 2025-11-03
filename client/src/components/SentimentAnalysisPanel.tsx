import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Smile, Frown, Meh } from "lucide-react";
import { Badge } from "./ui/badge";

interface SentimentAnalysisPanelProps {
  symbol: string;
}

export function SentimentAnalysisPanel({ symbol }: SentimentAnalysisPanelProps) {
  const { data: sentiment, isLoading } = trpc.sentiment.get.useQuery(
    { symbol },
    { enabled: !!symbol, refetchInterval: 60000 * 5 } // Refresh every 5 minutes
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

  if (!sentiment) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">Sentiment data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  const score = sentiment.score;
  let sentimentLabel: string;
  let sentimentIcon: JSX.Element;
  let badgeVariant: "default" | "destructive" | "secondary" | "outline" = "secondary";

  if (score > 0.5) {
    sentimentLabel = "Strongly Bullish";
    sentimentIcon = <Smile className="h-5 w-5 text-green-500" />;
    badgeVariant = "default";
  } else if (score > 0.1) {
    sentimentLabel = "Bullish";
    sentimentIcon = <Smile className="h-5 w-5 text-green-400" />;
    badgeVariant = "default";
  } else if (score > -0.1) {
    sentimentLabel = "Neutral";
    sentimentIcon = <Meh className="h-5 w-5 text-yellow-500" />;
    badgeVariant = "secondary";
  } else if (score > -0.5) {
    sentimentLabel = "Bearish";
    sentimentIcon = <Frown className="h-5 w-5 text-red-400" />;
    badgeVariant = "destructive";
  } else {
    sentimentLabel = "Strongly Bearish";
    sentimentIcon = <Frown className="h-5 w-5 text-red-500" />;
    badgeVariant = "destructive";
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {sentimentIcon}
            <CardTitle className="text-lg">Market Sentiment</CardTitle>
          </div>
          <Badge variant={badgeVariant} className="capitalize">
            {sentimentLabel}
          </Badge>
        </div>
        <CardDescription>
          Based on analysis of {sentiment.sourceCount.toLocaleString()} sources.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Sentiment Score</p>
          <p className="text-xl font-bold font-mono" style={{ color: score > 0.1 ? '#10B981' : score < -0.1 ? '#EF4444' : '#F59E0B' }}>
            {score.toFixed(2)}
          </p>
        </div>
        <div className="bg-muted rounded p-3">
          <p className="text-xs text-muted-foreground">{sentiment.summary}</p>
        </div>
        <p className="text-xs text-muted-foreground text-right">
          Last updated: {new Date(sentiment.lastUpdated).toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
