export function createId(prefix = "id"): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createPublicId(): string {
  const year = new Date().getUTCFullYear();
  const token = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `CIV-${year}-${token}`;
}
