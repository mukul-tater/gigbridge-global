

## Comprehensive Website Audit & Fix Plan

### Current State Summary
After scanning all routes, components, and database schema, here is a full audit of what works, what's broken, and what's missing for an initial product version.

---

### SECTION A: BROKEN / NON-FUNCTIONAL ITEMS (Must Fix)

#### 1. Messaging System is Empty Shell
Both `WorkerMessaging.tsx` and `EmployerMessaging.tsx` are placeholder pages with just "No messages yet" text and zero functionality. The `messages` table exists in the database but there is no UI to compose, send, or read messages.

**Fix:** Build a functional messaging interface for both worker and employer portals with conversation threads, message composition, and real-time updates using the existing `messages` table.

#### 2. Insurance & Remittance Page Uses Hardcoded Mock Data
`src/pages/worker/Insurance.tsx` shows a fake insurance policy ("INS-2024-56789") and fake remittance transactions. The "Send Money" button shows a toast but does nothing. No database backing.

**Fix:** Either connect to real database tables or clearly label as "Coming Soon" with disabled controls to avoid misleading users.

#### 3. Travel Status Page Uses Hardcoded Mock Data
`src/pages/worker/TravelStatus.tsx` shows a fake flight booking (EK 542) and visa details. Not connected to any real data source.

**Fix:** Connect to the `job_formalities` table which already has `visa_status`, `flight_booking_status`, `departure_date`, `arrival_date`, and `travel_details` fields, or mark as "Coming Soon."

#### 4. Agent Dashboard is a Stub
`src/pages/agent/AgentDashboard.tsx` has sidebar nav items that all point back to `/agent/dashboard`. No separate pages for Workers, Placements, Commissions, Analytics, or Settings. Uses hardcoded mock stats.

**Fix:** Either build out basic agent sub-pages or simplify to a single functional dashboard pulling real data from `agent_profiles` table.

#### 5. Hero Section References Missing Image Asset
`src/components/HeroSection.tsx` imports `heroImage from "@/assets/hero-workers.jpg"` but this file may not exist (no `src/assets` directory visible).

**Fix:** Verify image exists or replace with a fallback/gradient background.

#### 6. Worker Recommended Jobs Link Uses Raw ID Instead of Slug
In `WorkerDashboard.tsx` line 195: `<Link to={/jobs/${job.id}}>` but the route expects a slug (`/jobs/:slug`). This means clicking recommended jobs leads to a "Job Not Found" page.

**Fix:** Fetch the `slug` field in the jobs query and use it in the link.

---

### SECTION B: UX ISSUES TO FIX

#### 7. No Pagination on Jobs Page
920+ jobs load all at once with no pagination or infinite scroll. This is slow and overwhelming.

**Fix:** Add pagination (20-30 jobs per page) with page navigation controls.

#### 8. Homepage Search Bar - Location Field Maps Inconsistently
The hero search has a "Location" select that maps to the `location` URL param, but the Jobs page interprets it as `country`. This causes filter mismatches.

**Fix:** Ensure consistent parameter naming between homepage search and jobs page filters.

#### 9. No "Back to Dashboard" from Job Detail for Workers
When a logged-in worker views a job detail page, there's only "Back to Jobs" but no way to return to their dashboard context.

**Fix:** Show contextual back link based on referrer or role.

#### 10. Admin Role Selectable During Signup
The Auth page exposes "Admin" as a signup role option. Anyone can register as admin, creating a security concern (though the `handle_admin_user` trigger only assigns admin to a specific email).

**Fix:** Remove Admin from the public signup role selector. Admin accounts should only be created through backend processes.

---

### SECTION C: MISSING FEATURES FOR INITIAL VERSION

#### 11. No Job Edit Capability for Employers
Employers can post jobs and