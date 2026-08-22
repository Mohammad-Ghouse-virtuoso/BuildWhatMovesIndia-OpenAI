import type { ReactNode } from "react";

import { AppShell } from "@/components/shared/app-shell";

export default function MunicipalLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AppShell experience="Municipal Operations">{children}</AppShell>;
}
