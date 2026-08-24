import { RouteShell } from "@/components/shared/route-shell";

export default function AskPage() {
  return (
    <RouteShell
      eyebrow="Step 1 · Question"
      title="What do you want to know?"
      description="Phase 1–2 will capture your question here. This screen is a shell so routing stays stable."
    />
  );
}
