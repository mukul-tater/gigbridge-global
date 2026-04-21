

## Enhanced Worker Search for Employer Portal

Upgrade the existing `/employer/search-workers` page (already in the employer portal sidebar) into a powerful candidate-discovery tool. Employers will be able to filter by experience, skills, video proof, verified documents, certifications, languages, work type, and more — with richer worker cards that surface trust signals at a glance.

### What's new for employers

**New filter categories** (added to the left sidebar):
- **Video proof available** — only show workers who uploaded a self-intro/skills video
- **Verified documents** — Passport / Visa / ID / Police clearance / Medical
- **Certifications** — has any verified certification (with name search)
- **Primary work type** — Welder, Electrician, Mason, Driver, HVAC, Scaffolder, etc.
- **Skill level** — Beginner / Intermediate / Expert
- **Languages spoken** — multi-select (English, Hindi, Arabic, Tagalog, Bengali, Nepali, etc.)
- **Open to relocation** toggle
- **Preferred shift** — Day / Night / Rotational
- **ECR status** — ECR / ECNR / Not Checked
- **Sort by** — Best Match, Most Experience, Recently Active, Most Verified

**Richer worker cards**:
- Inline **video thumbnail with play button** (opens a quick preview modal) when worker has a video
- Verification badges row (Passport ✓, Visa ✓, ID ✓, Certs ✓, Video ✓) with green checks
- Certifications count chip (e.g. "3 certified skills")
- Top skills with proficiency level

**Quick-action improvements**:
- "Compare" checkbox on each card → side-by-side comparison drawer for up to 4 workers
- Active filter chips above results (with one-click remove)
- Result count + applied-filter summary
- Empty state suggests broadening filters

### Technical changes

1. **DB function update** — extend `public.list_public_workers` to also return:
   - `video_url` (latest from `worker-videos` storage / `worker_documents` of type `video`)
   - `verified_documents` (array of doc types where `verification_status = 'verified'`)
   - `certifications_count` (count from `worker_certifications`)
   - `languages` (from `worker_profiles.languages`)
   - `open_to_relocation`, `preferred_shift`, `ecr_status`
   - `last_active_at` (from `worker_profiles.updated_at`)
   - Stays anonymized (first name + last initial) and stays SECURITY DEFINER so RLS isn't broken

2. **`WorkerFilters` interface** — extend with the new fields above (defaults preserve existing behavior)

3. **`WorkerSearchFilters.tsx`** — add new sections grouped in collapsible accordions:
   - Trust & Verification (video, docs, certs, ECR)
   - Skills & Experience (work type, skill level, certifications)
   - Preferences (languages, relocation, shift)
   Existing filters (keyword, nationality, location, salary, experience, passport/visa, availability) remain unchanged.

4. **`SearchWorkers.tsx`**:
   - Apply new filters in `handleSearch` against the extended dataset
   - Add **active filter chip strip** above results
   - Add **sort dropdown** wired to actual logic (currently cosmetic)
   - Add **Compare** checkbox + bottom-sheet `WorkerComparisonDrawer` (mirrors existing `JobComparisonDrawer` pattern)
   - Add **video preview modal** (uses `Dialog` + `<video controls>`) on thumbnail click

5. **New component** — `src/components/employer/WorkerComparisonDrawer.tsx` (side-by-side spec table for up to 4 workers).

6. **No new routes / no nav changes** — the page already lives at `/employer/search-workers` and is accessible from the employer sidebar (and the dashboard "Search Workers" link).

### Trust & access guarantees (unchanged)
- Worker names stay anonymized in search results
- Full profile, contact, and unmasked video only unlock after worker applies to one of the employer's jobs (existing RLS)
- "Contact" button continues to be gated by application/interview relationship

### Out of scope
- No new tables
- No changes to worker-side flows
- No changes to homepage / public worker browsing
- Real video uploads still depend on workers having uploaded videos; cards gracefully hide the thumbnail when none exists

### Rollout
Single-pass implementation: 1 migration (RPC update) + 3 file edits + 1 new component.

