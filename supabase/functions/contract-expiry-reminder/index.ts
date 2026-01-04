import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Starting contract expiry reminder check...");

    // Get contracts expiring in the next 3 days that haven't been signed and reminder not sent
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const today = new Date().toISOString().split('T')[0];
    const expiryThreshold = threeDaysFromNow.toISOString().split('T')[0];

    const { data: expiringContracts, error: fetchError } = await supabase
      .from("job_formalities")
      .select(`
        id,
        worker_id,
        job_id,
        contract_expiry_date,
        contract_reminder_sent,
        jobs (
          title,
          employer_id,
          employer_profiles (
            company_name
          )
        )
      `)
      .eq("contract_sent", true)
      .eq("contract_signed", false)
      .eq("contract_reminder_sent", false)
      .not("contract_expiry_date", "is", null)
      .lte("contract_expiry_date", expiryThreshold)
      .gte("contract_expiry_date", today);

    if (fetchError) {
      console.error("Error fetching expiring contracts:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiringContracts?.length || 0} expiring contracts`);

    const notifications: any[] = [];
    const updatedFormalityIds: string[] = [];

    for (const contract of expiringContracts || []) {
      const jobTitle = contract.jobs?.title || "Unknown Job";
      const companyName = contract.jobs?.employer_profiles?.company_name || "the employer";
      const expiryDate = new Date(contract.contract_expiry_date).toLocaleDateString();
      const daysUntilExpiry = Math.ceil(
        (new Date(contract.contract_expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      // Notification for worker
      notifications.push({
        user_id: contract.worker_id,
        type: "contract_expiring",
        title: "Contract Expiring Soon",
        message: `Your contract for "${jobTitle}" with ${companyName} expires in ${daysUntilExpiry} day(s) on ${expiryDate}. Please review and sign it before it expires.`,
        data: {
          formality_id: contract.id,
          job_id: contract.job_id,
          expiry_date: contract.contract_expiry_date,
        },
      });

      // Notification for employer
      if (contract.jobs?.employer_id) {
        notifications.push({
          user_id: contract.jobs.employer_id,
          type: "contract_expiring",
          title: "Contract Pending Signature",
          message: `The contract for "${jobTitle}" expires in ${daysUntilExpiry} day(s) on ${expiryDate}. The worker has not yet signed the contract.`,
          data: {
            formality_id: contract.id,
            job_id: contract.job_id,
            worker_id: contract.worker_id,
            expiry_date: contract.contract_expiry_date,
          },
        });
      }

      updatedFormalityIds.push(contract.id);
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error: notifyError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifyError) {
        console.error("Error inserting notifications:", notifyError);
        throw notifyError;
      }

      console.log(`Created ${notifications.length} notifications`);
    }

    // Mark reminders as sent
    if (updatedFormalityIds.length > 0) {
      const { error: updateError } = await supabase
        .from("job_formalities")
        .update({ contract_reminder_sent: true })
        .in("id", updatedFormalityIds);

      if (updateError) {
        console.error("Error updating formalities:", updateError);
        throw updateError;
      }

      console.log(`Marked ${updatedFormalityIds.length} contracts as reminder sent`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        contractsProcessed: expiringContracts?.length || 0,
        notificationsCreated: notifications.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in contract-expiry-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
