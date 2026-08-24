export class RtiDomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "RtiDomainError";
    this.code = code;
  }
}
