import type { ReactNode } from "react";

import { InternalWorkspaceShell } from "@/components/internal-workspace-shell";

export default function InternalLayout({ children }: { children: ReactNode }) {
  return <InternalWorkspaceShell>{children}</InternalWorkspaceShell>;
}
