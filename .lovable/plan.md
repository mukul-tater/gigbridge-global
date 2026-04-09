
Goal: stop the homepage crash, make salary rendering null-safe everywhere, and ensure the live site serves the fixed bundle instead of a stale cached one.

1. Confirm the real root cause
- The current homepage includes `FeaturedJobs`, and that component still formats salary on every featured job card.
- The database already contains active jobs with partial salary data, e.g. an active “Cleaner” job has `salary_min = 100000` and `salary_max = null`.
- The published error stack points to the minified production bundle, which matches the old crash pattern from `FeaturedJobs`.

2. Fix the code path that is crashing
- Update `src/components/FeaturedJobs.tsx` so salary formatting never assumes both values exist.
- Use explicit null checks (`min == null`, `max == null`) instead of truthy checks.
- Support all cases cleanly:
  - both min/max present → show range
  - only min present → show “From …”
  - only max present → show “Up to …”
  - neither present → show “Salary not specified”
- Also only show the “/month” suffix when an actual numeric salary string is being shown.

3. Prevent similar crashes in other screens
- Harden the same pattern in other files that still call `.toLocaleString()` on nullable values:
  - `src/pages/worker/WorkerApplications.tsx`
  - `src/pages/worker/SavedJobs.tsx`
  - `src/pages/Jobs.tsx`
  - `src/pages/employer/SearchWorkers.tsx`
  - `src/pages/worker/WorkerPublicProfile.tsx`
  - `src/pages/employer/ApplicationDetail.tsx`
  - any other salary/expected-salary display using truthy checks instead of null-safe checks
- Best approach: create one shared salary formatter helper and reuse it across job cards, lists, profile views, and application views.

4. Reduce blank-screen risk
- Wrap the routed app with the existing `ErrorBoundary` so a single rendering bug does not take down the whole site.
- This will turn future rendering failures into a fallback screen instead of a broken homepage.

5. Fix stale publish / cache behavior
- The live site is likely still serving an old JS bundle or a cached service worker response.
- The project currently has custom service worker registration in `src/main.tsx` plus PWA plugin setup, so I would align this to one consistent PWA registration approach.
- I would remove duplicate/manual SW behavior if needed and ensure the activation path refreshes users onto the latest assets.

6. Redeploy safely
- After the frontend fix is implemented, publish an updated frontend build so the live `.lovable.app` site receives the corrected bundle.
- Because frontend changes need publishing, I would explicitly republish after the fix.
- I would also validate that the new published bundle no longer references the crashing salary logic.

7. Verification checklist
- Open `/` logged out and confirm homepage loads without a blank screen.
- Confirm featured jobs render correctly for:
  - full salary range
  - only minimum salary
  - only maximum salary
  - missing salary
- Refresh the live site and confirm the same result after service worker/cache update.
- Spot-check Jobs list, Saved Jobs, Worker Applications, public worker profile, employer application detail, and worker search results for the same null-safety issue.

Technical notes
- Current likely trigger: active job record with `salary_max = null`.
- The codebase already shows nullable salary types in several interfaces, so the UI should match that reality.
- Truthy checks like `if (min && max)` are unsafe here because `0` and `null` are treated similarly and partial salary data is valid in this dataset.
- The production error appearing after an earlier “fix” strongly suggests a live publish/cache mismatch in addition to the underlying null-handling gap.
