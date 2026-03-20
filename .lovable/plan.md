

## Fix Build Errors — Node.js Type Definitions

There are 3 build errors caused by references to `NodeJS` namespace and `process` global, which aren't available in a Vite/browser TypeScript config.

### Changes

1. **`src/lib/utils.ts`** (line 12): Replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>`

2. **`src/hooks/use-debounce.ts`** (line 29): Replace `NodeJS.Timeout` with `ReturnType<typeof setTimeout>`

3. **`src/components/ErrorBoundary.tsx`** (line 57): Replace `process.env.NODE_ENV` with `import.meta.env.DEV`

These are standard Vite-compatible replacements — no behavior changes, just type fixes.

