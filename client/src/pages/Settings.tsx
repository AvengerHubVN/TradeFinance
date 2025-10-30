import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

        {/* User Profile */}
        <Card className="mb-6">
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

        {/* Trading Preferences */}
        <Card className="mb-6">
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

        {/* Account Actions */}
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
      </main>
    </div>
  );
}
