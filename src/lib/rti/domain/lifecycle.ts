import { RtiDomainError } from "./errors";

export const RTI_STATUSES = [
  "drafted",
  "submitted",
  "received",
  "processing",
  "additional_information",
  "response_ready",
  "response_received",
  "appeal_prepared",
  "appeal_submitted",
] as const;

export type RtiStatus = (typeof RTI_STATUSES)[number];

export const APPEAL_STATUSES = ["prepared", "submitted"] as const;
export type AppealStatus = (typeof APPEAL_STATUSES)[number];

const ALLOWED: Record<RtiStatus, readonly RtiStatus[]> = {
  drafted: ["submitted"],
  submitted: ["received"],
  received: ["processing"],
  processing: ["additional_information", "response_ready"],
  additional_information: ["processing"],
  response_ready: ["response_received"],
  response_received: ["appeal_prepared"],
  appeal_prepared: ["appeal_submitted"],
  appeal_submitted: [],
};

export const EVENT_COPY: Record<RtiStatus, string> = {
  drafted: "Draft created. Nothing has been filed.",
  submitted: "Mock filing recorded. A DEMO registration number was issued.",
  received: "The selected public authority is marked as having received the request.",
  processing: "The request is marked as under process in this demo.",
  additional_information: "Additional information was requested in this demo timeline.",
  response_ready: "A synthetic response is ready to view.",
  response_received: "Synthetic response documents are available.",
  appeal_prepared: "A first-appeal draft was prepared from unanswered items.",
  appeal_submitted: "A mock first appeal was recorded. Not filed with Government of India.",
};

export function canTransition(from: RtiStatus, to: RtiStatus): boolean {
  return ALLOWED[from].includes(to);
}

export function assertTransition(from: RtiStatus, to: RtiStatus): void {
  if (from === to) {
    throw new RtiDomainError(
      "INVALID_STATUS_TRANSITION",
      `Request is already ${from}.`,
    );
  }

  if (!canTransition(from, to)) {
    throw new RtiDomainError(
      "INVALID_STATUS_TRANSITION",
      `Cannot move from ${from} to ${to}.`,
    );
  }
}

export function statusPathTo(target: RtiStatus): RtiStatus[] {
  const path: RtiStatus[] = ["drafted"];
  const walk: Record<RtiStatus, RtiStatus | null> = {
    drafted: null,
    submitted: "drafted",
    received: "submitted",
    processing: "received",
    additional_information: "processing",
    response_ready: "processing",
    response_received: "response_ready",
    appeal_prepared: "response_received",
    appeal_submitted: "appeal_prepared",
  };

  const stack: RtiStatus[] = [];
  let cursor: RtiStatus | null = target;
  while (cursor && cursor !== "drafted") {
    stack.push(cursor);
    cursor = walk[cursor];
  }

  return path.concat(stack.reverse());
}
