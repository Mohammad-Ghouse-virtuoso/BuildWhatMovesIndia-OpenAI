import type { ReactNode } from "react";

import { AppShell } from "@/components/shared/app-shell";

export default function CitizenLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AppShell experience="Citizen">{children}</AppShell>;
}
