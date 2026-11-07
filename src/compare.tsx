import { useState } from "react";
import { BANKS, METRICS, QUARTERS } from "./data";
import { bankName, fmt, val } from "./calc";
import { NIM_INCLUDES_TRADING } from "./meta";
import Help from "./help";
import { Dot } from "./bits";

export default function Compare({ q, a: first }: { q: number; a: string }) {
  const [a, setA] = useState(first);
  const [b, setB] = useState(first === "ry" ? "td" : "ry");
  const rows = METRICS.map((m) => {
    const x = val(a, m.key, q), y = val(b, m.key, q);
    const win = x === null || y === null || x === y ? null : (m.higherIsBetter ? x > y : x < y) ? a : b;
    return { m, x, y, win, tie: x !== null && x === y };
  });
  const wa = rows.filter((r) => r.win === a).length, wb = rows.filter((r) => r.win === b).length;
  const sel = (v: string, set: (s: string) => void, label: string) => (
    <label>{label} <select autoComplete="off" value={v} onChange={(e) => set(e.target.value)}>{BANKS.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
  );
  return (
    <section aria-labelledby="cmp">
      <h2 id="cmp">Head to head ({QUARTERS[q]})</h2>
      <div className="row">{sel(a, setA, "Bank A")}{sel(b, setB, "Bank B")}</div>
      <p aria-live="polite"><b>{bankName(a)}</b> leads on {wa}, <b>{bankName(b)}</b> leads on {wb}, ties or missing data on {rows.length - wa - wb}.</p>
      <div className="scroll">
        <table>
          <caption>{bankName(a)} vs. {bankName(b)}</caption>
          <thead><tr><th scope="col">Metric</th><th scope="col"><Dot id={a} />{bankName(a)}</th><th scope="col"><Dot id={b} />{bankName(b)}</th><th scope="col">Better</th></tr></thead>
          <tbody>
            {rows.map(({ m, x, y, win, tie }) => (
              <tr key={m.key}>
                <th scope="row">{m.label} <Help k={m.key} /></th>
                <td>{fmt(x, m)}</td><td>{fmt(y, m)}</td>
                <td>{win ? `✓ ${bankName(win)}` : tie ? "Tie" : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(NIM_INCLUDES_TRADING.includes(a) !== NIM_INCLUDES_TRADING.includes(b)) && <p className="note">NIM is measured differently for these two banks, so treat that row with caution.</p>}
    </section>
  );
}