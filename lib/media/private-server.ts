import "server-only";

import { isAdminEmailAllowed } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service";

export const PRIVATE_BUCKET = "editorial-private";

export async function authorizePrivateDocuments() {
  if (process.env.VR_PRIVATE_DOCUMENTS_ENABLED !== "true") return null;
  const userClient = await createSupabaseServerClient();
  const { data: { user }, error } = await userClient.auth.getUser();
  if (error || !user?.id || !user.email || !(await isAdminEmailAllowed(user.email))) return null;
  const service = createSupabaseServiceClient();
  const { data: bucket, error: bucketError } = await service.storage.getBucket(PRIVATE_BUCKET);
  if (bucketError || !bucket || bucket.public) return null;
  return { user, userClient, service };
}
