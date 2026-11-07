import type { CSSProperties } from "react";
import { CartesianGrid, Line, LineChart, LabelList, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";
import { BANKS, QUARTERS, type MetricKey } from "./data";
import { bankName, edge, metric, rank, val } from "./calc";
import { Dot } from "./bits";

const tip = { background: "var(--card)", border: "1px solid var(--line)", color: "var(--fg)" };

export function Gap({ mk, bank }: { mk: MetricKey; bank: string }) {
  const m = metric(mk), n = bankName(bank);
  const data = QUARTERS.map((q, i) => ({ q, edge: edge(mk, i, bank) }));
  const a = data[0].edge, z = data[data.length - 1].edge;
  return (
    <section aria-labelledby="gap">
      <h2 id="gap">{n}’s edge vs. the peer average: {m.label}</h2>
      <p className="note">Above zero: {n} is better than the average of the other five. Below zero: worse.</p>
      {a !== null && z !== null && (
        <p>{QUARTERS[0]}: {a.toFixed(2)}{m.unit}. {QUARTERS[QUARTERS.length - 1]}: {z.toFixed(2)}{m.unit}. The gap has {z - a >= 0 ? "improved" : "widened"} by {Math.abs(z - a).toFixed(2)}.</p>
      )}
      <div role="img" aria-label={`Line chart of ${n}'s ${m.label} edge over peers across ${QUARTERS.length} quarters.`} style={{ "--glowc": `var(--c-${bank})` } as CSSProperties}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="q" stroke="var(--mut)" tickLine={false} axisLine={false} minTickGap={24} /><YAxis stroke="var(--mut)" tickLine={false} axisLine={false} tickCount={5} />
            <ReferenceLine y={0} stroke="var(--mut)" />
            <Tooltip contentStyle={tip} />
            <Line type="monotone" strokeLinecap="round" className="glow" dataKey="edge" name="Edge vs peers" stroke={`var(--c-${bank})`} strokeWidth={3} dot={{ r: 3 }} connectNulls isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function Scat({ q, bank, focus }: { q: number; bank: string; focus: boolean }) {
  const pts = BANKS.map((b) => ({ id: b.id, name: b.name, x: val(b.id, "efficiency", q), y: val(b.id, "roe", q) })).filter((p) => p.x !== null && p.y !== null);
  return (
    <section aria-labelledby="sc">
      <h2 id="sc">Efficiency vs. ROE ({QUARTERS[q]})</h2>
      <p className="note">Further left (leaner) and higher (more profitable) is better. Each bank is labelled.</p>
      <div role="img" aria-label={`Scatter plot: ${pts.map((p) => `${p.name} efficiency ${p.x}%, ROE ${p.y}%`).join("; ")}.`}>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 36, right: 40, bottom: 20, left: 10 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis type="number" dataKey="x" name="Efficiency ratio" unit="%" domain={[(min: number) => Math.floor(min - 1), (max: number) => Math.ceil(max + 1)]} stroke="var(--mut)" tickLine={false} />
            <YAxis type="number" dataKey="y" name="ROE" unit="%" domain={[(min: number) => Math.floor(min - 1), (max: number) => Math.ceil(max + 1.5)]} stroke="var(--mut)" tickLine={false} />
            <Tooltip contentStyle={tip} cursor={{ strokeDasharray: "3 3" }} />
            {pts.map((p) => (
              <Scatter key={p.id} name={p.name} data={[p]} fill={`var(--c-${p.id})`} fillOpacity={focus && p.id !== bank ? 0.3 : 1} isAnimationActive={false}>
                <LabelList dataKey="name" content={(p: { x?: number | string; y?: number | string; value?: unknown }) => (
                  <text x={Number(p.x)} y={Number(p.y) - 14} textAnchor="middle" fill="var(--fg)" fontSize={13} fontWeight={600}>{String(p.value)}</text>
                )} />
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function Heat({ mk, bank, focus }: { mk: MetricKey; bank: string; focus: boolean }) {
  const m = metric(mk);
  return (
    <section aria-labelledby="ht">
      <h2 id="ht">Rank heatmap: {m.label}</h2>
      <p className="note">1 = best of the six that quarter. Darker blue means a better rank.</p>
      <div className="scroll">
        <table className="heat">
          <caption>{m.label} rank by bank and quarter</caption>
          <thead><tr><th scope="col">Bank</th>{QUARTERS.map((n) => <th key={n} scope="col">{n}</th>)}</tr></thead>
          <tbody>
            {BANKS.map((b) => (
              <tr key={b.id} className={focus && b.id === bank ? "focusrow" : ""}>
                <th scope="row"><Dot id={b.id} />{b.name}</th>
                {QUARTERS.map((n, i) => {
                  const r = rank(mk, b.id, i);
                  return <td key={n} style={{ background: r ? `color-mix(in srgb, var(--accent) ${(7 - r) * 7}%, var(--card))` : undefined }}>{r ?? "–"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}