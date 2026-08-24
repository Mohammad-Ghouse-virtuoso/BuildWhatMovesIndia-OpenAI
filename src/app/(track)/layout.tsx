import type { ReactNode } from "react";

import { AppShell } from "@/components/shared/app-shell";

export default function TrackLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
