import { format, parseISO, addMinutes } from "date-fns";

interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: string; // ISO date
  startTime: string; // HH:mm format
  durationMinutes: number;
}

/**
 * Generates a Google Calendar URL for adding an event
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const startDateTime = parseStartDateTime(event.startDate, event.startTime);
  const endDateTime = addMinutes(startDateTime, event.durationMinutes);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${formatGoogleDate(startDateTime)}/${formatGoogleDate(endDateTime)}`,
    details: event.description || "",
    location: event.location || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates an ICS file content for Outlook/Apple Calendar
 */
export function generateICSFile(event: CalendarEvent): string {
  const startDateTime = parseStartDateTime(event.startDate, event.startTime);
  const endDateTime = addMinutes(startDateTime, event.durationMinutes);

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SafeWork Global//Interview Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${formatICSDate(startDateTime)}`,
    `DTEND:${formatICSDate(endDateTime)}`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description || "")}`,
    `LOCATION:${escapeICSText(event.location || "")}`,
    `UID:${generateUID()}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return icsContent;
}

/**
 * Downloads an ICS file to the user's device
 */
export function downloadICSFile(event: CalendarEvent, filename: string = "interview.ics"): void {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Helper functions
function parseStartDateTime(date: string, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const dateObj = parseISO(date);
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
}

function formatGoogleDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

function formatICSDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function generateUID(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}@safeworkglobal.com`;
}
