import type { Fen } from "./types";

export function fen(value: number): Fen {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError("Money must be a nonnegative safe integer number of fen.");
  }
  return value as Fen;
}

export function addFen(...values: readonly Fen[]): Fen {
  return fen(values.reduce<number>((total, value) => total + value, 0));
}

export function formatCny(value: Fen): string {
  return `¥${(value / 100).toFixed(2)}`;
}
