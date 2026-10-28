import { authorizePrivateDocuments, PRIVATE_BUCKET } from "@/lib/media/private-server";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" };

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const context = await authorizePrivateDocuments();
    if (!context) return new Response("Indisponível", { status: 403, headers });
    const { id } = await params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return new Response("Indisponível", { status: 404, headers });
    const { data: doc, error } = await context.service.from("private_editorial_documents").select("object_path,mime_type").eq("id", id).maybeSingle();
    if (error || !doc) return new Response("Indisponível", { status: 404, headers });
    const { data: signed, error: signedError } = await context.service.storage.from(PRIVATE_BUCKET).createSignedUrl(doc.object_path, 60);
    if (signedError || !signed?.signedUrl) return new Response("Indisponível", { status: 503, headers });
    const file = await fetch(signed.signedUrl, { cache: "no-store", redirect: "error" });
    if (!file.ok || !file.body) return new Response("Indisponível", { status: 503, headers });
    const { error: auditError } = await context.service.from("private_document_events").insert({ document_id: id, actor_id: context.user.id, action: "accessed" });
    if (auditError) return new Response("Indisponível", { status: 503, headers });
    return new Response(file.body, { headers: { ...headers, "Content-Type": doc.mime_type, "Content-Disposition": 'attachment; filename="documento-interno"' } });
  } catch {
    return new Response("Indisponível", { status: 503, headers });
  }
}
