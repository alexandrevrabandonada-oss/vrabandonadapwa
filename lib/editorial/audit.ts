import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { EditorialAuditEventType, EditorialStatus } from "@/lib/editorial/types";

export function resolveEditorialAuditEventType(
  fromStatus: string | null,
  toStatus: string,
): EditorialAuditEventType {
  if (!fromStatus && toStatus === "draft") {
    return "draft_created";
  }

  if (fromStatus === "draft" && toStatus === "in_review") {
    return "sent_to_review";
  }

  if (fromStatus === "in_review" && toStatus === "draft") {
    return "returned_to_draft";
  }

  if (toStatus === "published") {
    return "published";
  }

  if (fromStatus === "published" && toStatus !== "published") {
    return toStatus === "archived" ? "archived" : "unpublished";
  }

  if (toStatus === "archived") {
    return "archived";
  }

  return "content_updated";
}

export async function recordEditorialAuditEvent(input: {
  editorialItemId: string;
  actorEmail: string | null;
  eventType: EditorialAuditEventType;
  fromStatus: EditorialStatus | string | null;
  toStatus: EditorialStatus | string | null;
  note?: string | null;
}) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("editorial_audit_log").insert({
    editorial_item_id: input.editorialItemId,
    actor_email: input.actorEmail,
    event_type: input.eventType,
    from_status: input.fromStatus,
    to_status: input.toStatus,
    note: input.note ?? null,
  });

  if (error) {
    throw error;
  }
}
