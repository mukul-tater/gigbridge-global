
## Fix build error and enhance worker comparison panel

### Goal
Make the employer worker-search page compile again, then upgrade the comparison panel so employers can visually compare candidates faster using video/thumb status, document verification, skills, and trust signals side-by-side.

### Immediate build fix
1. Update `src/pages/employer/SearchWorkers.tsx` so the initial `useState<WorkerFilters>` object uses the complete expanded filter shape.
2. Align the filter property names everywhere:
   - Keep the current `WorkerFilters` interface from `WorkerSearchFilters.tsx`
   - Ensure the page initializes all required fields: `hasVideo`, `verifiedDocs`, `hasCertifications`, `certificationKeyword`, `ecrStatus`, `primaryWorkType`, `skillLevel`, `languages`, `openToRelocation`, `preferredShift`
3. Avoid stale object-shape issues by using the existing `DEFAULT_FILTERS` constant consistently for reset and initialization.

### Comparison panel upgrade
1. Expand `CompareWorker` in `src/components/employer/WorkerComparisonDrawer.tsx` to include visual comparison data:
   - `video_url`
   - `document_flags` or normalized document status map
   - `verification_score`
   - `trust_summary`
2. Update the comparison drawer header from a plain table header into candidate cards:
   - Avatar/name
   - Role + skill level
   - Video thumbnail/available badge
   - Quick trust score such as `4/6 verified`
   - Remove button
3. Add side-by-side visual rows:
   - Intro video: thumbnail/play-style tile when available, muted “No video” state when missing
   - Documents: Passport / Visa / ID / Police / Medical badges with clear green/grey status
   - Certifications: count + verified indicator
   - Experience: years with stronger visual emphasis
   - Skills: top skill chips
   - Languages and relocation
4. Keep comparison limited to 4 workers and preserve the existing floating “Compare” button behavior.
5. Add responsive behavior:
   - Horizontal scroll on small screens
   - Sticky criteria column
   - Minimum column width so comparison remains readable

### Search page wiring
1. Pass `video_url` into `compareWorkers` instead of only `has_video`.
2. Normalize document labels so comparison rows show clean names like `Passport`, `Visa`, `ID`, `Police`, `Medical`.
3. Keep profile access rules unchanged:
   - Search results remain anonymized
   - Contact/profile access stays governed by existing backend rules

### Validation
1. Run TypeScript/build after changes.
2. Confirm the original TS2769 error is gone.
3. Confirm `/employer/search-workers` renders:
   - Filters
   - Worker cards
   - Compare checkbox
   - Floating compare button
   - Enhanced side-by-side comparison panel
