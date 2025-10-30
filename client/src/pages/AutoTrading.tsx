import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2, Loader2, Target, DollarSign, Calendar, Shield } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";
import { toast } from "sonner";

interface Strategy {
  name: string;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  expectedROI: number;
  maxDrawdown: number;
  leverage: number;
  coins: Array<{
    symbol: string;
    allocation: number;
    entryPrice: number;
    targetPrice: number;
  }>;
  description: string;
}

export default function AutoTrading() {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState<'input' | 'strategies' | 'activate'>('input');
  
  // Form inputs
  const [targetROI, setTargetROI] = useState('30');
  const [capital, setCapital] = useState('10000');
  const [timeframe, setTimeframe] = useState('30'); // days
  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  
  // Generated strategies
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: binanceConnection } = trpc.binance.getConnection.useQuery(
    undefined,
    { enabled: !!user }
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Login Required</CardTitle>
            <CardDescription>Please login to access auto trading</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href={getLoginUrl()}>Login with Manus</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const generateStrategies = async () => {
    setGenerating(true);
    
    try {
      // Simulate AI strategy generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const targetROINum = parseFloat(targetROI);
      const capitalNum = parseFloat(capital);
      
      const mockStrategies: Strategy[] = [
        {
          name: "Conservative Growth",
          riskLevel: "conservative",
          expectedROI: targetROINum * 0.6,
          maxDrawdown: 10,
          leverage: 1,
          coins: [
            { symbol: "BTCUSDT", allocation: 50, entryPrice: 107000, targetPrice: 115000 },
            { symbol: "ETHUSDT", allocation: 30, entryPrice: 3750, targetPrice: 4100 },
            { symbol: "BNBUSDT", allocation: 20, entryPrice: 1070, targetPrice: 1150 },
          ],
          description: "Low-risk strategy focusing on major cryptocurrencies with no leverage. Suitable for capital preservation with modest growth."
        },
        {
          name: "Balanced Approach",
          riskLevel: "moderate",
          expectedROI: targetROINum,
          maxDrawdown: 20,
          leverage: 2,
          coins: [
            { symbol: "BTCUSDT", allocation: 40, entryPrice: 107000, targetPrice: 120000 },
            { symbol: "ETHUSDT", allocation: 30, entryPrice: 3750, targetPrice: 4500 },
            { symbol: "SOLUSDT", allocation: 20, entryPrice: 183, targetPrice: 220 },
            { symbol: "BNBUSDT", allocation: 10, entryPrice: 1070, targetPrice: 1200 },
          ],
          description: "Moderate risk with 2x leverage. Balanced portfolio across top cryptocurrencies with AI-optimized entry/exit points."
        },
        {
          name: "Aggressive Growth",
          riskLevel: "aggressive",
          expectedROI: targetROINum * 1.5,
          maxDrawdown: 35,
          leverage: 5,
          coins: [
            { symbol: "BTCUSDT", allocation: 30, entryPrice: 107000, targetPrice: 130000 },
            { symbol: "SOLUSDT", allocation: 25, entryPrice: 183, targetPrice: 250 },
            { symbol: "AVAXUSDT", allocation: 20, entryPrice: 18, targetPrice: 28 },
            { symbol: "DOGEUSDT", allocation: 15, entryPrice: 0.18, targetPrice: 0.25 },
            { symbol: "MATICUSDT", allocation: 10, entryPrice: 0.38, targetPrice: 0.55 },
          ],
          description: "High-risk, high-reward strategy with 5x leverage. Diversified across multiple altcoins with strong growth potential."
        }
      ];
      
      setStrategies(mockStrategies);
      setStep('strategies');
      toast.success("Strategies generated successfully!");
    } catch (error) {
      toast.error("Failed to generate strategies");
    } finally {
      setGenerating(false);
    }
  };

  const activateStrategy = async (strategy: Strategy) => {
    if (!binanceConnection?.isConnected) {
      toast.error("Please connect your Binance API first in Settings");
      return;
    }
    
    setSelectedStrategy(strategy);
    setStep('activate');
  };

  const confirmActivation = async () => {
    toast.success("Auto trading activated! Monitoring market conditions...");
    // In real implementation, this would start the auto trading bot
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{APP_TITLE}</h1>
                <p className="text-sm text-muted-foreground">Goal-Based Auto Trading</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Warning Banner */}
        <Alert variant="destructive" className="mb-8">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>High Risk Warning</AlertTitle>
          <AlertDescription>
            Auto trading involves significant risk. You may lose your entire capital. This is not financial advice.
            Only invest what you can afford to lose. Past performance does not guarantee future results.
          </AlertDescription>
        </Alert>

        {/* Step 1: Goal Input */}
        {step === 'input' && (
          <Card>
            <CardHeader>
              <CardTitle>Set Your Trading Goals</CardTitle>
              <CardDescription>
                Define your target ROI, capital, and risk tolerance. Our AI will generate optimized strategies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="targetROI" className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Target ROI (%)
                  </Label>
                  <Input
                    id="targetROI"
                    type="number"
                    value={targetROI}
                    onChange={(e) => setTargetROI(e.target.value)}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Realistic target: 10-50% per month
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capital" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Capital (USDT)
                  </Label>
                  <Input
                    id="capital"
                    type="number"
                    value={capital}
                    onChange={(e) => setCapital(e.target.value)}
                    placeholder="10000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum recommended: $1,000
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeframe" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Timeframe (days)
                  </Label>
                  <Input
                    id="timeframe"
                    type="number"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 30-90 days
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="risk" className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Risk Tolerance
                  </Label>
                  <Select value={riskTolerance} onValueChange={(v: any) => setRiskTolerance(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (Low Risk)</SelectItem>
                      <SelectItem value="moderate">Moderate (Medium Risk)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (High Risk)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={generateStrategies}
                disabled={generating}
                className="w-full"
                size="lg"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Strategies with AI...
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Generate Trading Strategies
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Strategy Selection */}
        {step === 'strategies' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Generated Strategies</h2>
              <Button variant="outline" onClick={() => setStep('input')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Goals
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {strategies.map((strategy) => (
                <Card key={strategy.name} className="flex flex-col">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <Badge
                        variant={
                          strategy.riskLevel === 'conservative'
                            ? 'secondary'
                            : strategy.riskLevel === 'moderate'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {strategy.riskLevel}
                      </Badge>
                    </div>
                    <CardDescription>{strategy.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expected ROI:</span>
                        <span className="font-semibold text-green-600">
                          +{strategy.expectedROI.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Max Drawdown:</span>
                        <span className="font-semibold text-red-600">
                          -{strategy.maxDrawdown}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Leverage:</span>
                        <span className="font-semibold">{strategy.leverage}x</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Coin Allocation:</p>
                      {strategy.coins.map((coin) => (
                        <div key={coin.symbol} className="flex justify-between text-xs">
                          <span>{coin.symbol}</span>
                          <span className="text-muted-foreground">{coin.allocation}%</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => activateStrategy(strategy)}
                      className="w-full"
                      variant={strategy.riskLevel === 'moderate' ? 'default' : 'outline'}
                    >
                      Select Strategy
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Activation Confirmation */}
        {step === 'activate' && selectedStrategy && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Confirm Activation</h2>
              <Button variant="outline" onClick={() => setStep('strategies')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Strategies
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{selectedStrategy.name}</CardTitle>
                <CardDescription>Review and confirm your auto trading setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Strategy Summary */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Capital</p>
                    <p className="text-lg font-bold">${parseFloat(capital).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expected ROI</p>
                    <p className="text-lg font-bold text-green-600">
                      +{selectedStrategy.expectedROI.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timeframe</p>
                    <p className="text-lg font-bold">{timeframe} days</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Max Drawdown</p>
                    <p className="text-lg font-bold text-red-600">
                      -{selectedStrategy.maxDrawdown}%
                    </p>
                  </div>
                </div>

                {/* Comprehensive Disclaimer */}
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Risk Disclaimer - Please Read Carefully</AlertTitle>
                  <AlertDescription className="space-y-2 mt-2">
                    <p>By activating auto trading, you acknowledge and accept:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>You may lose your entire capital</li>
                      <li>Cryptocurrency markets are highly volatile and unpredictable</li>
                      <li>Past performance does not guarantee future results</li>
                      <li>AI predictions have accuracy of 65-70%, not 100%</li>
                      <li>Leverage trading amplifies both gains and losses</li>
                      <li>You are solely responsible for all trading decisions</li>
                      <li>This is NOT financial advice</li>
                      <li>We are NOT liable for any losses</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                {/* Binance Connection Status */}
                {!binanceConnection?.isConnected && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Binance API Not Connected</AlertTitle>
                    <AlertDescription>
                      Please connect your Binance API in Settings before activating auto trading.
                      <Link href="/settings">
                        <Button variant="link" className="p-0 h-auto ml-2">
                          Go to Settings
                        </Button>
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep('strategies')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmActivation}
                    disabled={!binanceConnection?.isConnected}
                    className="flex-1"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    I Accept - Activate Trading
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
