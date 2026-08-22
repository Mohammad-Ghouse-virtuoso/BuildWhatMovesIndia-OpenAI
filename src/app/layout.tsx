import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Civic Intelligence",
    template: "%s · Civic Intelligence",
  },
  description:
    "A synthetic prototype that turns municipal complaints into clearer civic intelligence.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
