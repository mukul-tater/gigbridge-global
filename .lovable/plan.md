## Scope (this milestone only)

In: Convert existing `agent` role to `partner` (e-Mitra), full multi-step partner onboarding, document uploads, admin approval workflow, partner dashboard shell, notifications.

Out (future milestones): Worker registration by partners, External Opportunities (Adzuna), partner earnings payouts, employer/worker rework.

---

## 1. Rename `agent` → `partner` (e-Mitra)

`agent` is currently a near-empty role (one dashboard page, sparse references). We rename in place rather than adding a parallel role.

**DB migration (single migration):**
- Add `'partner'` value to `app_role` enum, then update all `user_roles` rows from `agent` → `partner`. (Postgres enums can't drop values cleanly while in use; we keep `agent` in the enum but stop writing it.)
- Rename table `agent_profiles` → `partner_profiles` and update its RLS policies/trigger names.
- Update `assign_initial_role()` and `handle_new_user()` to handle `partner` (insert into `partner_profiles`).
- Update `seed_demo_users()` (only the role mapping branch — no agent-specific seed logic exists today).

**Code rename:**
- `AppRole` type in `src/contexts/AuthContext.tsx`: `'agent'` → `'partner'`.
- `src/pages/agent/AgentDashboard.tsx` → `src/pages/partner/PartnerDashboard.tsx` (kept as a shell; real content built in §3).
- All route paths `/agent/*` → `/partner/*` in `App.tsx`.
- Role-select UI in `Auth.tsx`, `Dashboard.tsx` redirect map, `AccessDenied`, mobile nav, admin UserManagement filters, resource pages mentioning "agents" — replace with "Partner (e-Mitra)".
- `integrations/supabase/types.ts` regenerates automatically after migration.

## 2. Partner onboarding (5-step wizard)

New route: `/partner/onboarding` (protected, role=partner, mandatory until `submitted_at` is set — same pattern as worker/employer onboarding).

**Schema (`partner_profiles` after rename + new columns):**

```
-- Business info
center_name, owner_name, mobile, whatsapp, email,
state, district, address, pincode

-- Identity
aadhaar_number, pan_number,
aadhaar_front_url, aadhaar_back_url, pan_card_url, shop_photo_url

-- Business details
years_in_operation int, services_offered text[],
monthly_footfall int,
offers_passport_service bool, offers_doc_scanning bool, offers_worker_registration bool

-- Bank
account_holder, account_number, ifsc, upi_id

-- Declarations + workflow
accepted_terms bool, accepted_privacy bool, confirmed_accuracy bool,
status partner_status DEFAULT 'applied'  -- enum: applied|under_review|approved|active|suspended|rejected
submitted_at, reviewed_at, reviewed_by, rejection_reason
```

Plus retain existing columns. Add CHECK trigger to validate Aadhaar (12 digits), PAN format, IFSC, pincode.

**Wizard steps** (`src/pages/partner/PartnerOnboarding.tsx` + step components):
1. Business Information
2. Identity Verification (with file uploads)
3. Business Details
4. Bank Details
5. Declarations + Review & Submit

Use existing `OnboardingStepper`, `FileUpload`, `ValidatedInput`, `zod` validations. Persist progress on each step (upsert into `partner_profiles`). On final submit set `status='under_review'`, `submitted_at=now()`.

**Storage:** new private bucket `partner-documents` with RLS — owner can CRUD their own folder, admin can read all. Add helper in `src/lib/storage.ts` for signed URLs.

## 3. Partner dashboard shell

`/partner/dashboard` (gate: `status IN ('approved','active')` — otherwise redirect to onboarding or show "Application under review" state).

Overview cards (zeros for now, wired to real counts when worker module ships):
- Workers Registered / Verified / Interviewed / Placed
- Total Earnings (₹0 placeholder with "Payouts coming soon")

Recent Activity feed (empty state) and Earnings section (empty state) — built as reusable cards so the worker module can populate them later.

Sidebar: Dashboard, My Profile, Workers (disabled w/ tooltip "Coming soon"), Earnings (disabled), Documents, Notifications.

## 4. Admin approval workflow

New admin page `/admin/partners` (`src/pages/admin/PartnerApprovals.tsx`):
- Tabs: Pending (`applied`+`under_review`), Approved, Active, Suspended, Rejected
- Row → drawer with full application, document previews (signed URLs)
- Actions: Approve (→ `approved`, then auto `active`), Reject (require reason), Suspend, Reactivate. Each writes to `admin_actions` audit table.
- Add nav item in `AdminSidebar` and a stat card on `AdminDashboard`.

New table `admin_actions(id, admin_id, target_type, target_id, action, reason, metadata jsonb, created_at)` with RLS (admin-only read; insert via security-definer fn).

## 5. Notifications

Reuse existing `notifications` table. Emit on:
- Partner submits application → all admins
- Admin approves / rejects / suspends → that partner
Use existing `NotificationCenter` UI; no new components needed.

## 6. Public/marketing touchpoints

- Update `Auth.tsx` role-select chip from "Agent" → "Partner (e-Mitra)".
- Update homepage / resource pages that mention "Agents" to "e-Mitra Partners" (one-line text changes).

---

## Files created (new)
- `supabase/migrations/<ts>_partner_renaming_and_onboarding.sql`
- `src/pages/partner/PartnerDashboard.tsx` (replaces agent dashboard)
- `src/pages/partner/PartnerOnboarding.tsx` + `steps/{BusinessInfo,Identity,BusinessDetails,BankDetails,Declarations}.tsx`
- `src/pages/admin/PartnerApprovals.tsx`
- `src/components/partner/{PartnerSidebar,PartnerHeader,PartnerStatusBanner}.tsx`
- `src/config/partnerNav.ts`
- `src/lib/validations/partner.ts`

## Files edited
- `src/App.tsx` (routes), `src/contexts/AuthContext.tsx` (role type + redirect), `src/pages/Auth.tsx`, `src/pages/Dashboard.tsx`, `src/pages/AccessDenied.tsx`, `src/components/MobileBottomNav.tsx`, `src/components/admin/AdminSidebar.tsx`, `src/pages/admin/AdminDashboard.tsx`, `src/pages/admin/UserManagement.tsx`, `src/lib/storage.ts`, plus copy-only updates to homepage/resource pages mentioning agents.

## Files deleted
- `src/pages/agent/AgentDashboard.tsx`

---

## Out of scope confirmation
- No `workers`, `worker_documents`, `worker_videos`, `external_jobs`, `job_sync_logs` tables created here.
- No Adzuna edge function or cron.
- No payout / commission logic — earnings cards are placeholders.

If this looks right I'll start with the migration (single approval), then ship the code in one pass.