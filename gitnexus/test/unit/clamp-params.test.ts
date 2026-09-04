/**
 * Unit tests: numeric parameter clamping for MCP tool arguments.
 *
 * The MCP SDK does not enforce `minimum`/`maximum` from a tool's inputSchema, so the
 * backend must clamp the values it advertises as clamped (`impact.maxDepth` 1-32,
 * `impact.minConfidence` 0-1).
 */
import { describe, it, expect } from 'vitest';
import { clampInt, clampNumber } from '../../src/mcp/local/clamp.js';

describe('clampNumber', () => {
  it('returns the fallback for missing/blank values', () => {
    expect(clampNumber(undefined, 0, 1, 0.5)).toBe(0.5);
    expect(clampNumber(null, 0, 1, 0.5)).toBe(0.5);
    expect(clampNumber('', 0, 1, 0.5)).toBe(0.5);
  });

  it('returns the fallback for non-numeric and non-finite values', () => {
    expect(clampNumber('abc', 0, 1, 0.25)).toBe(0.25);
    expect(clampNumber(NaN, 0, 1, 0.25)).toBe(0.25);
    expect(clampNumber(Infinity, 0, 1, 0.25)).toBe(0.25);
    expect(clampNumber({}, 0, 1, 0.25)).toBe(0.25);
  });

  it('clamps out-of-range values into [min, max]', () => {
    expect(clampNumber(-5, 0, 1, 0)).toBe(0);
    expect(clampNumber(42, 0, 1, 0)).toBe(1);
  });

  it('passes in-range values through unchanged', () => {
    expect(clampNumber(0.7, 0, 1, 0)).toBe(0.7);
    expect(clampNumber(0, 0, 1, 0.5)).toBe(0);
  });

  it('accepts numeric strings', () => {
    expect(clampNumber('0.4', 0, 1, 0)).toBeCloseTo(0.4);
  });
});

describe('clampInt', () => {
  it('applies the documented impact.maxDepth contract (1-32, default 3)', () => {
    expect(clampInt(undefined, 1, 32, 3)).toBe(3);
    // Previously `params.maxDepth || 3`: 0 silently became 3 instead of the schema minimum.
    expect(clampInt(0, 1, 32, 3)).toBe(1);
    // Previously -1 produced an empty blast radius (loop body never ran).
    expect(clampInt(-1, 1, 32, 3)).toBe(1);
    // Previously 5000 issued 5000 sequential per-depth Cypher round-trips.
    expect(clampInt(5000, 1, 32, 3)).toBe(32);
    expect(clampInt(7, 1, 32, 3)).toBe(7);
  });

  it('truncates fractional depths toward zero, then clamps', () => {
    expect(clampInt(4.9, 1, 32, 3)).toBe(4);
    expect(clampInt(0.9, 1, 32, 3)).toBe(1);
  });
});
