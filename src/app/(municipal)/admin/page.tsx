import { RouteShell } from "@/components/shared/route-shell";

export default function AdminHome() {
  return (
    <RouteShell
      description="This route will reuse municipal components for city pulse, ward comparison, department pressure, and SLA health."
      eyebrow="Administrator view"
      title="What is happening across the city?"
    />
  );
}
