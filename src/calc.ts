import { BANKS, METRICS, DATA, type MetricKey } from "./data";

export const DASH = ["", "7 3", "2 3", "9 3 2 3", "1 4", "12 4"];
export const metric = (k: MetricKey) => METRICS.find((x) => x.key === k)!;
export const val = (b: string, k: MetricKey, i: number) => DATA[b][k][i];
export const fmt = (v: number | null, m: (typeof METRICS)[number]) => (v === null ? "–" : `${v}${m.unit}`);
export const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

export function rank(k: MetricKey, b: string, i: number): number | null {
  const m = metric(k), v = val(b, k, i);
  if (v === null) return null;
  return BANKS.filter((o) => { const w = val(o.id, k, i); return w !== null && (m.higherIsBetter ? w > v : w < v); }).length + 1;
}
// Average rank excludes NIM because its definition differs between banks.
export function avgRank(b: string, i: number): number | null {
  const rs = METRICS.filter((m) => m.key !== "nim").map((m) => rank(m.key, b, i));
  return rs.some((r) => r === null) ? null : mean(rs as number[]);
}
export const bankName = (id: string) => BANKS.find((b) => b.id === id)!.name;
// A bank's edge over the average of the other five. Positive always means better.
export function edge(k: MetricKey, i: number, id = "bns"): number | null {
  const v = val(id, k, i);
  const a = mean(BANKS.filter((o) => o.id !== id).map((o) => val(o.id, k, i)).filter((n): n is number => n !== null));
  if (v === null || a === null) return null;
  return metric(k).higherIsBetter ? v - a : a - v;
}