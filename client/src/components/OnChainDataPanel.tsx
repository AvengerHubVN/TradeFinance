import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Loader2, Link, Users, TrendingUp, DollarSign, Zap } from "lucide-react";
import { Badge } from "./ui/badge";

interface OnChainDataPanelProps {
  symbol: string;
}

const formatNumber = (num: number) => {
  if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toLocaleString();
};

export function OnChainDataPanel({ symbol }: OnChainDataPanelProps) {
  const { data: onChainData, isLoading } = trpc.onChain.get.useQuery(
    { symbol },
    { enabled: !!symbol, refetchInterval: 60000 * 10 } // Refresh every 10 minutes
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

  if (!onChainData) {
    return (
      <Card>
        <CardContent className="text-center py-6">
          <p className="text-muted-foreground">On-Chain data unavailable</p>
        </CardContent>
      </Card>
    );
  }

  const whaleScore = onChainData.whaleAccumulationScore;
  let whaleLabel: string;
  let whaleIcon: JSX.Element;
  let whaleBadgeVariant: "default" | "destructive" | "secondary" | "outline" = "secondary";

  if (whaleScore > 0.5) {
    whaleLabel = "Strong Accumulation";
    whaleIcon = <TrendingUp className="h-4 w-4 text-green-500" />;
    whaleBadgeVariant = "default";
  } else if (whaleScore > 0.1) {
    whaleLabel = "Accumulation";
    whaleIcon = <TrendingUp className="h-4 w-4 text-green-400" />;
    whaleBadgeVariant = "default";
  } else if (whaleScore > -0.1) {
    whaleLabel = "Neutral";
    whaleIcon = <Zap className="h-4 w-4 text-yellow-500" />;
    whaleBadgeVariant = "secondary";
  } else if (whaleScore > -0.5) {
    whaleLabel = "Distribution";
    whaleIcon = <TrendingUp className="h-4 w-4 rotate-180 text-red-400" />;
    whaleBadgeVariant = "destructive";
  } else {
    whaleLabel = "Strong Distribution";
    whaleIcon = <TrendingUp className="h-4 w-4 rotate-180 text-red-500" />;
    whaleBadgeVariant = "destructive";
  }

  const metrics = [
    { label: "Active Addresses (24h)", value: formatNumber(onChainData.activeAddresses24h), icon: <Users className="h-4 w-4 text-blue-400" /> },
    { label: "New Addresses (24h)", value: formatNumber(onChainData.newAddresses24h), icon: <Link className="h-4 w-4 text-purple-400" /> },
    { label: "Total Transactions (24h)", value: formatNumber(onChainData.transactionCount24h), icon: <Zap className="h-4 w-4 text-yellow-400" /> },
    { label: "Large Transactions (24h)", value: formatNumber(onChainData.largeTransactionCount24h), icon: <DollarSign className="h-4 w-4 text-red-400" /> },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            <CardTitle className="text-lg">On-Chain Data</CardTitle>
          </div>
          <Badge variant={whaleBadgeVariant} className="capitalize flex items-center gap-1">
            {whaleIcon}
            {whaleLabel}
          </Badge>
        </div>
        <CardDescription>
          Whale Accumulation Score: {whaleScore.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
              <div className="flex items-center gap-2">
                {metric.icon}
                <p className="text-sm text-muted-foreground">{metric.label}</p>
              </div>
              <p className="text-lg font-bold font-mono">{metric.value}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm font-semibold mb-1">Summary:</p>
          <p className="text-xs text-muted-foreground">{onChainData.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="text-muted-foreground">Supply on Exchanges</p>
                <p className="font-bold">{onChainData.supplyOnExchanges.toFixed(2)}%</p>
            </div>
            <div>
                <p className="text-muted-foreground">Top 100 Holders</p>
                <p className="font-bold">{onChainData.top100HoldersPercentage.toFixed(2)}%</p>
            </div>
        </div>

        <p className="text-xs text-muted-foreground text-right">
          Last updated: {new Date(onChainData.lastUpdated).toLocaleTimeString()}
        </p>
      </CardContent>
    </Card>
  );
}
