import { z } from "zod";

export const indianStates = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
] as const;

const phoneRegex = /^[6-9]\d{9}$/;
const pincodeRegex = /^[1-9]\d{5}$/;
const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const accountRegex = /^\d{6,18}$/;

export const businessInfoSchema = z.object({
  center_name: z.string().trim().min(2, "Center name is required").max(150),
  owner_name: z.string().trim().min(2, "Owner name is required").max(120),
  mobile: z.string().regex(phoneRegex, "Enter a valid 10-digit Indian mobile"),
  whatsapp: z.string().regex(phoneRegex, "Enter a valid 10-digit WhatsApp number"),
  email: z.string().trim().email("Enter a valid email").max(255),
  state: z.string().min(1, "State is required"),
  district: z.string().trim().min(2, "District is required").max(80),
  address: z.string().trim().min(10, "Address is required (min 10 chars)").max(500),
  pincode: z.string().regex(pincodeRegex, "Enter a valid 6-digit pincode"),
});

export const identitySchema = z.object({
  aadhaar_number: z.string().regex(aadhaarRegex, "Aadhaar must be 12 digits"),
  pan_number: z.string().regex(panRegex, "PAN format: ABCDE1234F"),
  aadhaar_front_url: z.string().min(1, "Upload Aadhaar front"),
  aadhaar_back_url: z.string().min(1, "Upload Aadhaar back"),
  pan_card_url: z.string().min(1, "Upload PAN card"),
  shop_photo_url: z.string().min(1, "Upload shop photo"),
});

export const businessDetailsSchema = z.object({
  years_in_operation: z.coerce.number().int().min(0).max(100),
  services_offered: z.array(z.string()).min(1, "Select at least one service"),
  monthly_footfall: z.coerce.number().int().min(0).max(1_000_000),
  offers_passport_service: z.boolean(),
  offers_doc_scanning: z.boolean(),
  offers_worker_registration: z.boolean(),
});

export const bankSchema = z.object({
  account_holder: z.string().trim().min(2).max(120),
  account_number: z.string().regex(accountRegex, "Account number 6–18 digits"),
  ifsc: z.string().regex(ifscRegex, "IFSC format: ABCD0123456").transform(s => s.toUpperCase()),
  upi_id: z.string().trim().regex(/^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/, "Enter a valid UPI ID").or(z.literal("")).optional(),
});

export const declarationsSchema = z.object({
  accepted_terms: z.literal(true, { errorMap: () => ({ message: "You must accept Partner Terms" }) }),
  accepted_privacy: z.literal(true, { errorMap: () => ({ message: "You must accept Privacy Policy" }) }),
  confirmed_accuracy: z.literal(true, { errorMap: () => ({ message: "You must confirm accuracy" }) }),
});

export const SERVICE_OPTIONS = [
  "Aadhaar Services",
  "PAN Services",
  "Passport Application",
  "Government Forms",
  "Document Scanning",
  "Photocopy & Printing",
  "Internet Browsing",
  "Money Transfer / Banking",
  "Bill Payments",
  "Insurance",
  "Other",
] as const;