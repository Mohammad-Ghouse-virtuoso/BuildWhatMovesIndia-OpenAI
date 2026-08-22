"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { PERSONA_LABELS, type Persona } from "@/lib/contracts";

const destinations: Record<Persona, string> = {
  citizen: "/citizen",
  officer: "/officer",
  admin: "/admin",
};

export function PersonaSwitcher() {
  const pathname = usePathname();

  function isActive(persona: Persona) {
    return pathname.startsWith(destinations[persona]);
  }

  function rememberPersona(persona: Persona) {
    document.cookie = `civic-persona=${persona}; Path=/; Max-Age=2592000; SameSite=Lax`;
  }

  return (
    <nav
      aria-label="Switch demo persona"
      className="flex flex-wrap items-center gap-2"
    >
      {(Object.keys(destinations) as Persona[]).map((persona) => (
        <Button
          key={persona}
          asChild
          size="sm"
          variant={isActive(persona) ? "primary" : "secondary"}
        >
          <Link href={destinations[persona]} onClick={() => rememberPersona(persona)}>
            {PERSONA_LABELS[persona]}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
