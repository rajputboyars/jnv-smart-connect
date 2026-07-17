import crypto from "crypto";

/**
 * Generates a human-readable, collision-resistant document number (invoice,
 * receipt, donation receipt, purchase order, certificate, ...) without a
 * database round-trip counter — avoids the race condition a
 * count-then-increment approach would have under concurrent requests.
 */
export function generateDocumentNumber(prefix: string): string {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randPart = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${datePart}-${randPart}`;
}

/** Splits a total into `count` parts that sum exactly to `total`, rounded to 2 decimals. */
export function splitAmount(total: number, count: number): number[] {
  const base = Math.round((total / count) * 100) / 100;
  const parts = new Array(count).fill(base);
  const drift = Math.round((total - base * count) * 100) / 100;
  parts[count - 1] = Math.round((parts[count - 1] + drift) * 100) / 100;
  return parts;
}
