import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { seedService, DEMO_ACCOUNTS } from '@/services/SeedService';

export default function SeedDataButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; errors?: string[] } | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setResult(null);

    try {
      const seedResult = await seedService.seedAllData();
      setResult(seedResult);
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to seed data'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Seed Demo Data
        </CardTitle>
        <CardDescription>
          Populate the database with demo accounts and sample data for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            <div className="flex items-start gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 mt-0.5" />
              ) : (
                <XCircle className="h-4 w-4 mt-0.5" />
              )}
              <div className="flex-1">
                <AlertDescription className="whitespace-pre-line">
                  {result.message}
                </AlertDescription>
                {result.errors && result.errors.length > 0 && (
                  <ul className="mt-2 text-sm space-y-1">
                    {result.errors.map((error, idx) => (
                      <li key={idx} className="text-destructive">• {error}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Alert>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Demo Accounts:</h3>
          <div className="bg-muted rounded-lg p-4 space-y-2 text-sm font-mono">
            {DEMO_ACCOUNTS.map((account, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="text-primary">{account.role.toUpperCase()}</span>
                <span>{account.email}</span>
                <span className="text-muted-foreground">{account.password}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold text-sm">What will be created:</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• 6 demo user accounts (1 admin, 2 employers, 3 workers)</li>
            <li>• 6 sample job postings with various categories</li>
            <li>• Worker profiles with skills, certifications, and work experience</li>
            <li>• Job skills and requirements</li>
          </ul>
        </div>

        <Button 
          onClick={handleSeed} 
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? 'Seeding Database...' : 'Seed Demo Data'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Note: This will create new demo accounts. If accounts already exist, seeding will fail.
        </p>
      </CardContent>
    </Card>
  );
}
