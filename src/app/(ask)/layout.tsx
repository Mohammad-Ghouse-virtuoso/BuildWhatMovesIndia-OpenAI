import type { ReactNode } from "react";

import { AppShell } from "@/components/shared/app-shell";

export default function AskLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
