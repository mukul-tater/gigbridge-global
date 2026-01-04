import { supabase } from '@/integrations/supabase/client';

type NotificationType = 
  | 'application_submitted' 
  | 'application_status_changed' 
  | 'offer_received' 
  | 'offer_response'
  | 'message_received' 
  | 'interview_scheduled';

interface NotificationData {
  type: NotificationType;
  recipientEmail: string;
  recipientName: string;
  data: Record<string, any>;
}

export async function sendEmailNotification(notification: NotificationData): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: notification
    });

    if (error) {
      console.error('Error sending notification:', error);
      return false;
    }

    console.log('Notification sent:', data);
    return true;
  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

// Helper functions for common notifications
export async function notifyApplicationSubmitted(
  workerEmail: string,
  workerName: string,
  jobTitle: string,
  companyName: string,
  location: string
) {
  return sendEmailNotification({
    type: 'application_submitted',
    recipientEmail: workerEmail,
    recipientName: workerName,
    data: {
      jobTitle,
      companyName,
      location,
      dashboardUrl: `${window.location.origin}/worker/applications`
    }
  });
}

export async function notifyApplicationStatusChange(
  workerEmail: string,
  workerName: string,
  jobTitle: string,
  newStatus: string,
  message?: string
) {
  const statusColors: Record<string, string> = {
    SHORTLISTED: '#059669',
    INTERVIEW: '#7c3aed',
    OFFERED: '#2563eb',
    HIRED: '#059669',
    REJECTED: '#dc2626'
  };

  return sendEmailNotification({
    type: 'application_status_changed',
    recipientEmail: workerEmail,
    recipientName: workerName,
    data: {
      jobTitle,
      newStatus: newStatus.replace('_', ' '),
      statusColor: statusColors[newStatus] || '#6b7280',
      message,
      dashboardUrl: `${window.location.origin}/worker/applications`
    }
  });
}

export async function notifyOfferReceived(
  workerEmail: string,
  workerName: string,
  jobTitle: string,
  companyName: string,
  salary: string,
  startDate: string,
  expiryDate: string,
  offerId: string
) {
  return sendEmailNotification({
    type: 'offer_received',
    recipientEmail: workerEmail,
    recipientName: workerName,
    data: {
      jobTitle,
      companyName,
      salary,
      startDate,
      expiryDate,
      offerUrl: `${window.location.origin}/worker/applications?offer=${offerId}`
    }
  });
}

export async function notifyMessageReceived(
  recipientEmail: string,
  recipientName: string,
  senderName: string,
  subject: string | null,
  preview: string,
  messageUrl: string
) {
  return sendEmailNotification({
    type: 'message_received',
    recipientEmail,
    recipientName,
    data: {
      senderName,
      subject,
      preview: preview.substring(0, 100) + (preview.length > 100 ? '...' : ''),
      messageUrl
    }
  });
}

export async function notifyInterviewScheduled(
  workerEmail: string,
  workerName: string,
  jobTitle: string,
  companyName: string,
  date: string,
  time: string,
  mode: string,
  meetingLink?: string,
  location?: string
) {
  return sendEmailNotification({
    type: 'interview_scheduled',
    recipientEmail: workerEmail,
    recipientName: workerName,
    data: {
      jobTitle,
      companyName,
      date,
      time,
      mode,
      meetingLink,
      location,
      dashboardUrl: `${window.location.origin}/worker/applications`
    }
  });
}

export async function notifyOfferResponse(
  employerEmail: string,
  employerName: string,
  workerName: string,
  jobTitle: string,
  salary: string,
  startDate: string,
  accepted: boolean,
  reason?: string
) {
  return sendEmailNotification({
    type: 'offer_response',
    recipientEmail: employerEmail,
    recipientName: employerName,
    data: {
      workerName,
      jobTitle,
      salary,
      startDate,
      accepted,
      reason,
      dashboardUrl: `${window.location.origin}/employer/offers`
    }
  });
}
