import { RtiDomainError } from "./errors";
import { REGISTRATION_PREFIX } from "./constants";

const SERIAL_PATTERN = /^DEMO\/RTI\/2026\/(\d{6})$/;

export function formatRegistrationNumber(serial: number): string {
  if (!Number.isInteger(serial) || serial < 1 || serial > 999_999) {
    throw new RtiDomainError(
      "INVALID_REGISTRATION_SERIAL",
      "Registration serial must be an integer from 1 to 999999.",
    );
  }

  return `${REGISTRATION_PREFIX}${String(serial).padStart(6, "0")}`;
}

export function parseRegistrationSerial(registrationNumber: string): number | null {
  const match = SERIAL_PATTERN.exec(registrationNumber);
  return match ? Number(match[1]) : null;
}

export function nextRegistrationNumber(existing: readonly string[]): string {
  let max = 0;
  for (const value of existing) {
    const serial = parseRegistrationSerial(value);
    if (serial !== null && serial > max) {
      max = serial;
    }
  }

  return formatRegistrationNumber(max + 1);
}
