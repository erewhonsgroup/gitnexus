/**
 * Numeric clamping for caller-supplied MCP tool arguments.
 *
 * The MCP SDK does not enforce `minimum`/`maximum` from a tool's `inputSchema`, so any
 * range a tool description advertises has to be applied by the backend itself.
 */

/**
 * Clamp a caller-supplied numeric parameter into [min, max].
 * Missing, blank, non-numeric, and non-finite values fall back to `fallback`.
 */
export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (value === undefined || value === null || value === '' || !Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/** Integer variant of {@link clampNumber} (truncates toward zero before clamping). */
export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = clampNumber(value, min, max, fallback);
  return Math.min(max, Math.max(min, Math.trunc(n)));
}
