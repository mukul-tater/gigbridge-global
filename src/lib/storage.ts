import { supabase } from "@/integrations/supabase/client";

/**
 * Given a stored file URL or path that lives in the (private) `worker-documents`
 * bucket, return a freshly-signed temporary URL that the browser can open.
 *
 * Accepts:
 *  - Full Supabase public URL (e.g. `.../storage/v1/object/public/worker-documents/<path>`)
 *  - Full Supabase signed URL (returned as-is if not yet expired logic-wise — we just resign)
 *  - A raw object path inside the bucket (e.g. `<userId>/123-resume.pdf`)
 */
export async function getWorkerDocumentSignedUrl(
  urlOrPath: string,
  expiresInSeconds = 60 * 60
): Promise<string> {
  if (!urlOrPath) throw new Error("Missing file reference");

  let path = urlOrPath;

  // Extract the object path if a full Supabase storage URL was passed in.
  const marker = "/worker-documents/";
  const idx = urlOrPath.indexOf(marker);
  if (idx !== -1) {
    path = urlOrPath.substring(idx + marker.length);
    // Strip any query string from signed URLs
    const q = path.indexOf("?");
    if (q !== -1) path = path.substring(0, q);
    path = decodeURIComponent(path);
  }

  const { data, error } = await supabase.storage
    .from("worker-documents")
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) {
    throw new Error(error?.message || "Could not generate file link");
  }

  return data.signedUrl;
}