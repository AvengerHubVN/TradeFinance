import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function SymbolDetail() {
  const params = useParams();
  const symbol = params.symbol;

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

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{symbol}</CardTitle>
            <CardDescription>Symbol detail page - Coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This page will show detailed information about {symbol}, including:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>Real-time price chart</li>
              <li>Technical indicators</li>
              <li>ML predictions</li>
              <li>Trading signals</li>
              <li>Historical data</li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
