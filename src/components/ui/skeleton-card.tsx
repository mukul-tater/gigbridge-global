import { Card, CardContent } from "@/components/ui/card";

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 shimmer" />
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-20 rounded-md shimmer" />
          <div className="h-4 w-16 rounded shimmer" />
        </div>
        <div className="h-5 w-3/4 rounded shimmer" />
        <div className="h-4 w-1/2 rounded shimmer" />
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="h-3 rounded shimmer" style={{ width: `${90 - i * 15}%` }} />
        ))}
        <div className="h-10 w-full rounded-xl shimmer mt-2" />
      </CardContent>
    </Card>
  );
}

export function SkeletonJobGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
