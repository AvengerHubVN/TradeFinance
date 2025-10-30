import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

function BinanceAPISection() {
  const { data: connection } = trpc.binance.getConnection.useQuery();
  const testConnection = trpc.binance.testConnection.useMutation();
  const saveKeys = trpc.binance.saveKeys.useMutation();
  const deleteKeys = trpc.binance.deleteKeys.useMutation();
  const utils = trpc.useUtils();

  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);

  const handleTest = async () => {
    if (!apiKey || !apiSecret) {
      toast.error('Please enter both API key and secret');
      return;
    }

    try {
      const result = await testConnection.mutateAsync({ apiKey, apiSecret });
      if (result.success) {
        toast.success('Connection successful!');
      } else {
        toast.error(result.message || 'Connection failed');
      }
    } catch (error) {
      toast.error('Failed to test connection');
    }
  };

  const handleSave = async () => {
    if (!apiKey || !apiSecret) {
      toast.error('Please enter both API key and secret');
      return;
    }

    try {
      await saveKeys.mutateAsync({ apiKey, apiSecret });
      toast.success('API keys saved successfully!');
      setApiKey('');
      setApiSecret('');
      utils.binance.getConnection.invalidate();
    } catch (error) {
      toast.error('Failed to save API keys');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your Binance API keys?')) {
      return;
    }

    try {
      await deleteKeys.mutateAsync();
      toast.success('API keys deleted');
      utils.binance.getConnection.invalidate();
    } catch (error) {
      toast.error('Failed to delete API keys');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Binance API Connection</CardTitle>
          <CardDescription>
            Connect your Binance account to enable auto trading
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          {connection && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                {connection.isConnected ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Not Connected</span>
                  </>
                )}
              </div>
              {connection.isConnected && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  Disconnect
                </Button>
              )}
            </div>
          )}

          {/* API Key Input */}
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Binance API key"
              className="mt-1 font-mono"
            />
          </div>

          {/* API Secret Input */}
          <div>
            <Label htmlFor="apiSecret">API Secret</Label>
            <Input
              id="apiSecret"
              type={showSecret ? "text" : "password"}
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter your Binance API secret"
              className="mt-1 font-mono"
            />
            <div className="flex items-center mt-2">
              <Switch
                id="showSecret"
                checked={showSecret}
                onCheckedChange={setShowSecret}
              />
              <Label htmlFor="showSecret" className="ml-2 text-sm">
                Show secret
              </Label>
            </div>
          </div>

          {/* Warning */}
          <div className="flex gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-500 mb-1">Security Warning</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Only enable <strong>Spot & Margin Trading</strong> permissions</li>
                <li>• <strong>DO NOT</strong> enable "Enable Withdrawals"</li>
                <li>• Your API keys are encrypted before storage</li>
                <li>• Never share your API secret with anyone</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleTest}
              disabled={testConnection.isPending || !apiKey || !apiSecret}
              variant="outline"
              className="flex-1"
            >
              {testConnection.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveKeys.isPending || !apiKey || !apiSecret}
              className="flex-1"
            >
              {saveKeys.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save & Connect'
              )}
            </Button>
          </div>

          {/* How to Get API Keys */}
          <div className="p-4 bg-muted rounded-lg">
            <p className="font-semibold mb-2">How to get Binance API keys:</p>
            <ol className="text-sm space-y-1 text-muted-foreground list-decimal list-inside">
              <li>Log in to your Binance account</li>
              <li>Go to Profile → API Management</li>
              <li>Create a new API key</li>
              <li>Enable only "Spot & Margin Trading"</li>
              <li>Copy the API Key and Secret</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Settings() {
  const { user, loading: authLoading, logout } = useAuth();
  const { data: preferences, isLoading: prefsLoading } = trpc.preferences.get.useQuery(
    undefined,
    { enabled: !!user }
  );
  const updatePrefs = trpc.preferences.update.useMutation();

  const [riskTolerance, setRiskTolerance] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [defaultCapital, setDefaultCapital] = useState('10000');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (preferences) {
      setRiskTolerance(preferences.riskTolerance || 'moderate');
      setDefaultCapital(preferences.defaultCapital || '10000');
      setNotificationsEnabled(preferences.notificationsEnabled ?? true);
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      await updatePrefs.mutateAsync({
        riskTolerance,
        defaultCapital,
        notificationsEnabled,
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  if (authLoading || prefsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    window.location.href = '/';
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="binance">Binance API</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={user.name || 'N/A'} disabled className="mt-1" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user.email || 'N/A'} disabled className="mt-1" />
                </div>
                <div>
                  <Label>Role</Label>
                  <Input value={user.role} disabled className="mt-1 capitalize" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleLogout} className="w-full">
                  Logout
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trading Tab */}
          <TabsContent value="trading" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Trading Preferences</CardTitle>
                <CardDescription>Configure your trading settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="risk">Risk Tolerance</Label>
                  <Select value={riskTolerance} onValueChange={(v: any) => setRiskTolerance(v)}>
                    <SelectTrigger id="risk" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {riskTolerance === 'conservative' && 'Lower risk, lower returns. Suitable for beginners.'}
                    {riskTolerance === 'moderate' && 'Balanced risk and returns. Recommended for most users.'}
                    {riskTolerance === 'aggressive' && 'Higher risk, higher potential returns. For experienced traders.'}
                  </p>
                </div>

                <div>
                  <Label htmlFor="capital">Default Capital (USD)</Label>
                  <Input
                    id="capital"
                    type="number"
                    value={defaultCapital}
                    onChange={(e) => setDefaultCapital(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Default amount to use for trading calculations
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="notifications">Enable Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive alerts for trading signals and updates
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={updatePrefs.isPending}
                  className="w-full"
                >
                  {updatePrefs.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Binance API Tab */}
          <TabsContent value="binance" className="space-y-6">
            <BinanceAPISection />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
