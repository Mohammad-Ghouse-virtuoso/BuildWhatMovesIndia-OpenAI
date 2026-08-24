"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";

const links = [
  { href: "/ask", label: "Ask" },
  { href: "/my-rti", label: "My RTIs" },
  { href: "/learn", label: "Learn" },
] as const;

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Ask India" className="flex flex-wrap items-center gap-2">
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(`${link.href}/`);

        return (
          <Button
            key={link.href}
            asChild
            size="sm"
            variant={active ? "primary" : "secondary"}
          >
            <Link href={link.href}>{link.label}</Link>
          </Button>
        );
      })}
    </nav>
  );
}
