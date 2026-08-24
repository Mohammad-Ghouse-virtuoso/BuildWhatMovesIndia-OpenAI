import type { RtiEventDto } from "@/lib/rti/contracts/dtos";
import type { RtiStatus } from "@/lib/rti/domain/lifecycle";
import { EVENT_COPY } from "@/lib/rti/domain/lifecycle";

import { STATUS_LABEL, formatIst } from "./copy";

interface TimelineProps {
  current: RtiStatus;
  events: RtiEventDto[];
}

export function Timeline({ current, events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        {STATUS_LABEL[current]}. {EVENT_COPY[current]}
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {events.map((event, index) => {
        const done = index < events.length - 1 || event.type === current;
        return (
          <li className="flex gap-3" key={event.id}>
            <span
              aria-hidden
              className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                done ? "bg-civic-700" : "bg-slate-300"
              }`}
            />
            <div>
              <p className="text-sm font-semibold text-civic-900">
                {STATUS_LABEL[event.type]}
              </p>
              <p className="text-xs text-slate-500">{formatIst(event.timestamp)}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{event.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
