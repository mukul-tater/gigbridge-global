

## Full Professional Redesign Plan

This is a large-scale redesign covering the entire app. To keep it manageable and avoid breaking changes, I'll break it into phases executed across multiple messages.

### Phase 1: Fix Build Errors + Shared Layout Components

**Problem**: The `data-lov-id` duplicate attribute errors in `main.tsx` and `App.tsx` are caused by the internal tagger plugin running twice. A minor whitespace change to both files will force a clean re-transformation.

**New shared components**:
- `src/components/layout/DashboardLayout.tsx` — A reusable shell (sidebar + header + main content) used by all 4 portals. Eliminates the 3 separate header/sidebar patterns.
- `src/components/layout/DashboardHeader.tsx` — Unified header with avatar dropdown, notifications, portal name, and breadcrumb. Accepts `portalName` and `basePath` props.
- `src/components/layout/DashboardSidebar.tsx` — Unified sidebar component that accepts `navItems`, `portalLabel`, and an accent color. Uses the existing Sheet pattern for mobile.

### Phase 2: Unified Theme Refinement

- Polish `index.css` dark mode variables for consistency
- Ensure all cards, buttons, and surfaces use the same shadow/border/radius tokens
- Standardize spacing scale across all pages (consistent `p-6`, `gap-6`, etc.)

### Phase 3: Landing Page Refresh

- Clean up `HeroSection.tsx` — tighter copy, better CTA hierarchy, refined search bar
- Refresh `Header.tsx` — ensure mobile menu uses same styling tokens as dashboard sidebars
- Polish `Footer.tsx` — ensure consistent brand treatment
- Ensure all public pages (About, Contact, Jobs, Investors) use Header + Footer consistently

### Phase 4: Dashboard Redesigns (all 4 roles)

**Worker Dashboard** (`WorkerDashboard.tsx`):
- Use new `DashboardLayout` wrapper
- Cleaner stat cards with consistent icon treatment
- Better activity feed and recommended jobs cards

**Employer Dashboard** (`EmployerDashboard.tsx`):
- Use new `DashboardLayout` wrapper
- Streamline analytics cards layout
- Consistent chart styling

**Admin Dashboard** (`AdminDashboard.tsx`):
- Use new `DashboardLayout` wrapper
- Clean up the tabs and stat grid

**Agent Dashboard** (`AgentDashboard.tsx`):
- Replace the basic placeholder with proper `DashboardLayout`
- Add sidebar navigation for agent-specific pages
- Professional stat cards matching other portals

### Phase 5: Mobile Responsiveness Pass

- Ensure all dashboard pages work at 375px width
- Sidebar collapses to sheet on mobile (already in place, but verify consistency)
- Cards stack properly on small screens
- Touch-friendly tap targets (min 44px)

---

### Technical Details

**Files created**:
- `src/components/layout/DashboardLayout.tsx`
- `src/components/layout/DashboardHeader.tsx`  
- `src/components/layout/DashboardSidebar.tsx`
- `src/components/agent/AgentSidebar.tsx`

**Files modified**:
- `src/main.tsx` — whitespace fix to clear tagger cache
- `src/App.tsx` — whitespace fix to clear tagger cache
- `src/index.css` — minor token refinements
- `src/pages/worker/WorkerDashboard.tsx` — use DashboardLayout
- `src/pages/employer/EmployerDashboard.tsx` — use DashboardLayout
- `src/pages/admin/AdminDashboard.tsx` — use DashboardLayout
- `src/pages/agent/AgentDashboard.tsx` — full rebuild with sidebar + proper layout
- `src/components/Header.tsx` — minor style polish
- `src/components/HeroSection.tsx` — copy and layout refinements
- Existing sidebar files (`WorkerSidebar`, `EmployerSidebar`, `AdminSidebar`) — refactored to use shared `DashboardSidebar`

**Approach**: I'll implement this in 2-3 messages — Phase 1+2+3 first, then Phase 4+5. Each phase builds on the previous without breaking existing functionality.

