import SeedDataButton from '@/components/SeedDataButton';

export default function SeedData() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Demo Data Seeding</h1>
          <p className="text-muted-foreground">
            Quickly populate your database with demo accounts and sample data
          </p>
        </div>
        <SeedDataButton />
      </div>
    </div>
  );
}
