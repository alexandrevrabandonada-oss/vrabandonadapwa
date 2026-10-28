import { authorizePrivateDocuments } from "@/lib/media/private-server";
import { auditPrivateStorage } from "@/lib/media/private-reconcile";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Vary": "Cookie",
};

export async function GET() {
  try {
    const context = await authorizePrivateDocuments();
    if (!context) return Response.json({ status: "forbidden" }, { status: 403, headers: responseHeaders });
    const result = await auditPrivateStorage(context.service);
    return Response.json({ status: "ok", ...result }, { status: 200, headers: responseHeaders });
  } catch {
    // Não expor stack, objeto ou detalhes das tabelas em erro.
    return Response.json({ status: "unavailable" }, { status: 503, headers: responseHeaders });
  }
}
