import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailNotificationRequest {
  type: 'application_submitted' | 'application_status_changed' | 'offer_received' | 'message_received' | 'interview_scheduled';
  recipientEmail: string;
  recipientName: string;
  data: Record<string, any>;
}

const EMAIL_TEMPLATES: Record<string, { subject: string; getHtml: (data: any, name: string) => string }> = {
  application_submitted: {
    subject: 'Application Submitted Successfully - SafeWork Global',
    getHtml: (data, name) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">SafeWork Global</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Hi ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your application for <strong>${data.jobTitle}</strong> at <strong>${data.companyName}</strong> has been submitted successfully!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280;"><strong>Job:</strong> ${data.jobTitle}</p>
            <p style="margin: 10px 0 0; color: #6b7280;"><strong>Company:</strong> ${data.companyName}</p>
            <p style="margin: 10px 0 0; color: #6b7280;"><strong>Location:</strong> ${data.location}</p>
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            We'll notify you when there's an update on your application. In the meantime, you can track your application status in your dashboard.
          </p>
          <a href="${data.dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Application</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          © 2024 SafeWork Global. All rights reserved.
        </p>
      </div>
    `
  },
  application_status_changed: {
    subject: 'Application Status Update - SafeWork Global',
    getHtml: (data, name) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">SafeWork Global</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Hi ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            There's an update on your application for <strong>${data.jobTitle}</strong>.
          </p>
          <div style="background: ${data.statusColor}; padding: 15px 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; color: white; font-size: 18px; font-weight: bold;">${data.newStatus}</p>
          </div>
          ${data.message ? `<p style="color: #4b5563; line-height: 1.6;">${data.message}</p>` : ''}
          <a href="${data.dashboardUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Details</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          © 2024 SafeWork Global. All rights reserved.
        </p>
      </div>
    `
  },
  offer_received: {
    subject: '🎉 Congratulations! You have a new job offer - SafeWork Global',
    getHtml: (data, name) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #059669 0%, #0891b2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">🎉 Congratulations!</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Hi ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Great news! You've received a job offer from <strong>${data.companyName}</strong>!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #059669;">
            <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: bold;">${data.jobTitle}</p>
            <p style="margin: 10px 0 0; color: #6b7280;"><strong>Salary:</strong> ${data.salary}</p>
            <p style="margin: 10px 0 0; color: #6b7280;"><strong>Start Date:</strong> ${data.startDate}</p>
            <p style="margin: 10px 0 0; color: #6b7280;"><strong>Expires:</strong> ${data.expiryDate}</p>
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            Please review the offer details and respond before the expiry date.
          </p>
          <a href="${data.offerUrl}" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Review Offer</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          © 2024 SafeWork Global. All rights reserved.
        </p>
      </div>
    `
  },
  message_received: {
    subject: 'New Message - SafeWork Global',
    getHtml: (data, name) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #2563eb 0%, #0891b2 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">SafeWork Global</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Hi ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            You have a new message from <strong>${data.senderName}</strong>.
          </p>
          ${data.subject ? `<p style="color: #6b7280;"><strong>Subject:</strong> ${data.subject}</p>` : ''}
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0; color: #4b5563; font-style: italic;">"${data.preview}"</p>
          </div>
          <a href="${data.messageUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">Read Message</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          © 2024 SafeWork Global. All rights reserved.
        </p>
      </div>
    `
  },
  interview_scheduled: {
    subject: 'Interview Scheduled - SafeWork Global',
    getHtml: (data, name) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%); padding: 30px; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0;">📅 Interview Scheduled</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px;">
          <h2 style="color: #1f2937;">Hi ${name},</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Your interview with <strong>${data.companyName}</strong> has been scheduled!
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: bold;">${data.jobTitle}</p>
            <p style="margin: 15px 0 5px; color: #6b7280;"><strong>📅 Date:</strong> ${data.date}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>🕐 Time:</strong> ${data.time}</p>
            <p style="margin: 5px 0; color: #6b7280;"><strong>📍 Mode:</strong> ${data.mode}</p>
            ${data.meetingLink ? `<p style="margin: 5px 0; color: #6b7280;"><strong>🔗 Link:</strong> <a href="${data.meetingLink}">${data.meetingLink}</a></p>` : ''}
            ${data.location ? `<p style="margin: 5px 0; color: #6b7280;"><strong>📍 Location:</strong> ${data.location}</p>` : ''}
          </div>
          <p style="color: #4b5563; line-height: 1.6;">
            Please be prepared and join on time. Good luck!
          </p>
          <a href="${data.dashboardUrl}" style="display: inline-block; background: #7c3aed; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px;">View Details</a>
        </div>
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
          © 2024 SafeWork Global. All rights reserved.
        </p>
      </div>
    `
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, recipientEmail, recipientName, data }: EmailNotificationRequest = await req.json();

    // Validate request
    if (!type || !recipientEmail || !recipientName) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: type, recipientEmail, recipientName' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const template = EMAIL_TEMPLATES[type];
    if (!template) {
      return new Response(
        JSON.stringify({ error: `Unknown email type: ${type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For now, log the email that would be sent (Resend integration can be added later)
    const emailContent = {
      to: recipientEmail,
      subject: template.subject,
      html: template.getHtml(data, recipientName)
    };

    console.log('Email notification prepared:', {
      type,
      to: recipientEmail,
      subject: template.subject
    });

    // Check if RESEND_API_KEY is configured
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (resendApiKey) {
      // Send via Resend
      const { Resend } = await import("npm:resend@2.0.0");
      const resend = new Resend(resendApiKey);
      
      const emailResponse = await resend.emails.send({
        from: "SafeWork Global <notifications@safeworkglobal.com>",
        to: [recipientEmail],
        subject: template.subject,
        html: template.getHtml(data, recipientName)
      });
      
      console.log("Email sent via Resend:", emailResponse);
      
      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully', emailId: emailResponse.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Log email for development (no Resend key configured)
      console.log("RESEND_API_KEY not configured. Email logged:", emailContent);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email notification logged (RESEND_API_KEY not configured)',
          emailContent 
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
