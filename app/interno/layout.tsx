import type { ReactNode } from "react";

import { InternalWorkspaceShell } from "@/components/internal-workspace-shell";

// Área autenticada depende de sessão e de Supabase em runtime, não no build.
export const dynamic = "force-dynamic";

export default function InternalLayout({ children }: { children: ReactNode }) {
  return <InternalWorkspaceShell>{children}</InternalWorkspaceShell>;
}
