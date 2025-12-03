import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, User, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface ShortlistedWorker {
  id: string;
  worker_id: string;
  list_name: string | null;
  notes: string | null;
  rating: number | null;
  created_at: string;
  profiles: {
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  } | null;
}

interface ShortlistedCandidatesCardProps {
  workers: ShortlistedWorker[];
  loading?: boolean;
}

export default function ShortlistedCandidatesCard({ workers, loading }: ShortlistedCandidatesCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-20" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 pb-3 border-b last:border-0">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (workers.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Shortlisted Candidates</h2>
        <div className="text-center py-8">
          <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">No candidates shortlisted yet</p>
          <Button asChild variant="outline">
            <Link to="/employer/search-workers">
              Search Workers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Shortlisted Candidates</h2>
        <Link 
          to="/employer/shortlist" 
          className="text-sm text-primary hover:underline flex items-center gap-1"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="space-y-4">
        {workers.map((worker) => (
          <div key={worker.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={worker.profiles?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-medium truncate">
                  {worker.profiles?.full_name || "Unknown Worker"}
                </p>
                {worker.list_name && (
                  <Badge variant="secondary" className="text-xs">
                    {worker.list_name}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {worker.profiles?.email}
              </p>
              <div className="flex items-center gap-3 mt-1">
                {worker.rating && (
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < worker.rating! 
                            ? "text-yellow-500 fill-yellow-500" 
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                )}
                <span className="text-xs text-muted-foreground">
                  Added {formatDistanceToNow(new Date(worker.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
