import EmployerSidebar from "@/components/employer/EmployerSidebar";
import EmployerHeader from "@/components/employer/EmployerHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContractVersionHistory from "@/components/ContractVersionHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { History } from "lucide-react";

export default function ContractHistory() {
  const { user } = useAuth();
  const [selectedFormalityId, setSelectedFormalityId] = useState<string>("");

  const { data: formalities } = useQuery({
    queryKey: ['employer-formalities-for-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('job_formalities')
        .select(`
          id,
          contract_url,
          jobs!inner (
            title,
            employer_id
          ),
          worker_profiles:worker_id (
            profiles:user_id (
              full_name
            )
          )
        `)
        .eq('jobs.employer_id', user.id)
        .not('contract_url', 'is', null);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  return (
    <div className="flex min-h-screen bg-background">
      <EmployerSidebar />
      <div className="flex-1">
        <EmployerHeader />
        <main className="p-4 md:p-6 pt-16 md:pt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Contract Version History
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Contract</label>
                <Select value={selectedFormalityId} onValueChange={setSelectedFormalityId}>
                  <SelectTrigger className="w-full md:w-[400px]">
                    <SelectValue placeholder="Choose a contract to view history" />
                  </SelectTrigger>
                  <SelectContent>
                    {formalities?.map((formality: any) => (
                      <SelectItem key={formality.id} value={formality.id}>
                        {formality.jobs?.title} - {formality.worker_profiles?.profiles?.full_name || 'Unknown Worker'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFormalityId ? (
                <div className="border rounded-lg p-4">
                  <ContractVersionHistory 
                    formalityId={selectedFormalityId} 
                    isEmployer={true}
                  />
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a contract above to view its version history</p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
