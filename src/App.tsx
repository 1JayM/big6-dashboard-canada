import { useEffect, useLayoutEffect, useMemo, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { BANKS, QUARTERS, METRICS, DATA, type MetricKey } from "./data";
import { INFO, NIM_INCLUDES_TRADING, REPO_URL } from "./meta";
import { DASH, bankName, metric, val, fmt, mean, rank, avgRank } from "./calc";
import { Gap, Scat, Heat } from "./analysis";
import { Note, Sources } from "./extras";
import Compare from "./compare";
import Help from "./help";
import { Icon, Count, Dot } from "./bits";

const dec = (n: number) => (String(n).split(".")[1] ?? "").length;
const TABS = [["overview", "Overview"], ["rankings", "Rankings"], ["trends", "Trends"], ["compare", "Compare"], ["analysis", "Analysis"]] as const;
type Tab = (typeof TABS)[number][0];
const readTab = (): Tab => TABS.find((t) => t[0] === window.location.hash.slice(1))?.[0] ?? "overview";

function Change({ b, k, i }: { b: string; k: MetricKey; i: number }) {
  const v = val(b, k, i), p = i > 0 ? val(b, k, i - 1) : null;
  if (v === null || p === null || v === p) return null;
  const d = v - p, good = metric(k).higherIsBetter ? d > 0 : d < 0;
  return (
    <span className={`chg ${good ? "good" : "bad"}`}>
      {d > 0 ? "▲" : "▼"} {Math.abs(d).toFixed(2)}
      <span className="sr"> {good ? "improved" : "worsened"} versus prior quarter</span>
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>(readTab);
  const [q, setQ] = useState(QUARTERS.length - 1);
  const [mk, setMk] = useState<MetricKey>("roe");
  const [bank, setBank] = useState("bns");
  const [focus, setFocus] = useState(true);
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "avg", dir: 1 });
  const [off, setOff] = useState<string[]>([]);
  const [asTable, setAsTable] = useState(false);
  const [dark, setDark] = useState(() => window.matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  useEffect(() => {
    const f = () => setTab(readTab());
    window.addEventListener("hashchange", f);
    return () => window.removeEventListener("hashchange", f);
  }, []);
  const go = (t: Tab) => { window.location.hash = t; };
  const [pill, setPill] = useState({ x: 0, w: 0 });
  useLayoutEffect(() => {
    const place = () => { const el = document.getElementById(`tab-${tab}`); if (el) setPill({ x: el.offsetLeft, w: el.offsetWidth }); };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [tab]);
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const n = TABS.length;
    const j = e.key === "ArrowRight" ? (i + 1) % n : e.key === "ArrowLeft" ? (i - 1 + n) % n : e.key === "Home" ? 0 : e.key === "End" ? n - 1 : -1;
    if (j < 0) return;
    e.preventDefault(); go(TABS[j][0]); document.getElementById(`tab-${TABS[j][0]}`)?.focus();
  };

  const m = metric(mk), bn = bankName(bank);
  const others = BANKS.filter((b) => b.id !== bank);
  const spot = METRICS.map((x) => {
    const v = val(bank, x.key, q);
    const avg = mean(others.map((p) => val(p.id, x.key, q)).filter((n): n is number => n !== null));
    const gap = v !== null && avg !== null ? v - avg : null;
    return { x, v, r: rank(x.key, bank, q), avg, gap, good: gap !== null && (x.higherIsBetter ? gap > 0 : gap < 0) };
  });
  const ranked = spot.filter((s) => s.r !== null && s.x.key !== "nim");
  const best = [...ranked].sort((a, b) => a.r! - b.r!)[0];
  const worst = [...ranked].sort((a, b) => b.r! - a.r!)[0];
  const avgR = avgRank(bank, q);
  const yoy = q >= 4 && val(bank, "roe", q) !== null && val(bank, "roe", q - 4) !== null ? val(bank, "roe", q)! - val(bank, "roe", q - 4)! : null;

  const toggleSort = (key: string) => setSort((s) => ({ key, dir: s.key === key && s.dir === 1 ? -1 : 1 }));
  const sorted = useMemo(() => {
    const f = (id: string, name: string) => (sort.key === "name" ? name : sort.key === "avg" ? avgRank(id, q) : rank(sort.key as MetricKey, id, q));
    return [...BANKS].sort((x, y) => {
      const a = f(x.id, x.name), c = f(y.id, y.name);
      if (a === null) return 1;
      if (c === null) return -1;
      return (a < c ? -1 : a > c ? 1 : 0) * sort.dir;
    });
  }, [q, sort]);
  const ariaSort = (k: string) => (sort.key === k ? (sort.dir === 1 ? "ascending" : "descending") : "none");

  const chartData = QUARTERS.map((name, i) => ({ q: name, ...Object.fromEntries(BANKS.map((b) => [b.id, val(b.id, mk, i)])) }));
  const shown = BANKS.filter((b) => !off.includes(b.id));
  const exportCsv = () => {
    const lines = [["Bank", "Metric", ...QUARTERS].join(",")];
    BANKS.forEach((b) => METRICS.forEach((x) => lines.push([b.name, `${x.label} (${x.unit.trim()})`, ...DATA[b.id][x.key].map((v) => v ?? "")].join(","))));
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "big6-banks.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="wrap">
      <a className="skip" href="#main">Skip to content</a>
      <header>
        <div>
          <h1>Big 6 Canadian Banks Dashboard</h1>
          <p className="sub">Compares RBC, TD, BMO, Scotiabank, CIBC and National Bank on profitability, efficiency, capital and credit quality. Data through Q3 2026 (quarter ended July 31, 2026).</p>
          <p className="note">Built with React, TypeScript and Recharts. <button className="linklike" onClick={() => go("analysis")}>Sources and definitions</button>{REPO_URL && <> · <a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a></>}</p>
        </div>
        <div className="row">
          <button onClick={exportCsv}>Export CSV</button>
          <button aria-pressed={dark} onClick={() => setDark(!dark)}>Dark mode</button>
        </div>
      </header>

      <div className="bar" role="region" aria-label="View controls">
        <label>Quarter <select autoComplete="off" value={q} onChange={(e) => setQ(Number(e.target.value))}>{QUARTERS.map((n, i) => <option key={n} value={i}>{n}</option>)}</select></label>
        <label>Metric <select autoComplete="off" value={mk} onChange={(e) => setMk(e.target.value as MetricKey)}>{METRICS.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select></label>
        <label>Bank <select autoComplete="off" value={bank} onChange={(e) => setBank(e.target.value)}>{BANKS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
        <label className="chk"><input type="checkbox" autoComplete="off" checked={focus} onChange={() => setFocus(!focus)} /> Focus mode</label>
      </div>
      <p className="strip" role="status">
        <b>{bn}</b> ({QUARTERS[q]}): {avgR === null ? "no data yet" : <>average rank {avgR.toFixed(1)} of 6{best && <> · strongest {best.x.label} (#{best.r})</>}{worst && <> · weakest {worst.x.label} (#{worst.r})</>}</>}
      </p>

      <div className="tabs" role="tablist" aria-label="Dashboard sections">
        <span className="pill" aria-hidden="true" style={{ transform: `translateX(${pill.x}px)`, width: pill.w }} />
        {TABS.map(([id, label], i) => (
          <button key={id} id={`tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`panel-${id}`} tabIndex={tab === id ? 0 : -1}
            onClick={() => go(id)} onKeyDown={(e) => onTabKey(e, i)}><Icon n={id} /> {label}</button>
        ))}
      </div>

      <main id="main" className="panel" key={tab} role="tabpanel" aria-labelledby={`tab-${tab}`}>
        {tab === "overview" && (
          <>
            <h2 id="spot" className="pagehead">{bn} vs. the other five ({QUARTERS[q]})</h2>
            <div className="bento">
              <div className="tile hero" style={{ "--glowc": `var(--c-${bank})` } as CSSProperties}>
                <div className="lab"><Icon n="trophy" /> Average rank</div>
                <div className="huge">{avgR === null ? "–" : <><span className="sr">{avgR.toFixed(1)}</span><span aria-hidden="true"><Count v={avgR} /></span></>}<span className="of"> / 6</span></div>
                <p className="note">{bn} across ROE, efficiency, CET1 and PCL. NIM is left out because banks define it differently.</p>
              </div>
              {spot.map(({ x, v, r, avg, gap, good }) => (
                <div key={x.key} className={`tile t-${x.key}`}>
                  <div className="lab"><span className="ico"><Icon n={x.key} size={16} /></span>{x.label} <Help k={x.key} /></div>
                  <div className="big">{v === null ? "–" : <><span className="sr">{fmt(v, x)}</span><span aria-hidden="true"><Count v={v} dec={dec(v)} />{x.unit}</span></>}</div>
                  <div className="rk">{r ? `Rank ${r} of 6` : "No data"}</div>
                  {gap !== null && avg !== null && (
                    <div className={good ? "good" : "bad"}>{good ? "▲ Better" : "▼ Worse"} than peers ({avg.toFixed(2)}{x.unit}) by {Math.abs(gap).toFixed(2)}</div>
                  )}
                </div>
              ))}
              <div className="tile t-take">
                <div className="lab"><Icon n="analysis" size={16} /> Takeaways</div>
                <ul className="ins">
                  {best && <li>Strongest metric: {best.x.label}, ranked {best.r} of 6.</li>}
                  {worst && <li>Weakest metric: {worst.x.label}, ranked {worst.r} of 6.</li>}
                  {yoy !== null && <li>ROE is {yoy >= 0 ? "up" : "down"} {Math.abs(yoy).toFixed(1)} points versus a year earlier.</li>}
                  {!best && <li>Enter data in data.ts to see takeaways.</li>}
                </ul>
              </div>
            </div>
          </>
        )}

        {tab === "rankings" && (
          <>
            <section aria-labelledby="rank">
              <h2 id="rank">Ranking ({QUARTERS[q]})</h2>
              <p className="note">Click a column heading to sort. Rank 1 is best. Arrows show change from the prior quarter.</p>
              <div className="scroll">
                <table className="rtable">
                  <caption>Bank rankings by metric, {QUARTERS[q]}</caption>
                  <thead>
                    <tr>
                      <th scope="col" aria-sort={ariaSort("name")}><button onClick={() => toggleSort("name")}>Bank</button></th>
                      {METRICS.map((x) => (
                        <th key={x.key} scope="col" aria-sort={ariaSort(x.key)}><button onClick={() => toggleSort(x.key)}>{x.label}</button><Help k={x.key} /></th>
                      ))}
                      <th scope="col" aria-sort={ariaSort("avg")} title="Average rank across all metrics except NIM"><button onClick={() => toggleSort("avg")}>Avg rank</button></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((b) => {
                      const a = avgRank(b.id, q);
                      return (
                        <tr key={b.id} className={focus && b.id === bank ? "hl" : ""}>
                          <th scope="row"><Dot id={b.id} />{b.name}</th>
                          {METRICS.map((x) => (
                            <td key={x.key} data-label={x.label}>
                              {fmt(val(b.id, x.key, q), x)}{x.key === "nim" && NIM_INCLUDES_TRADING.includes(b.id) ? "*" : ""}
                              {rank(x.key, b.id, q) && <span className="rk"> #{rank(x.key, b.id, q)}</span>}
                              <Change b={b.id} k={x.key} i={q} />
                            </td>
                          ))}
                          <td data-label="Avg rank">{a === null ? "–" : a.toFixed(1)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="note">* TD and CIBC report NIM including trading assets, so it is not comparable with the other four. Average rank leaves NIM out for that reason.</p>
            </section>
            <Heat mk={mk} bank={bank} focus={focus} />
          </>
        )}

        {tab === "trends" && (
          <>
            <section aria-labelledby="trend">
              <h2 id="trend">{m.label} over time</h2>
              <p className="note">{INFO[mk]}</p>
              <div className="row" role="group" aria-label="Choose banks to show">
                {BANKS.map((b, i) => (
                  <label key={b.id}>
                    <input type="checkbox" autoComplete="off" checked={!off.includes(b.id)} onChange={() => setOff(off.includes(b.id) ? off.filter((o) => o !== b.id) : [...off, b.id])} />{" "}
                    <svg width="32" height="10" aria-hidden="true"><line x1="0" y1="5" x2="32" y2="5" stroke={`var(--c-${b.id})`} strokeWidth="3" strokeDasharray={DASH[i]} /></svg> {b.name}
                  </label>
                ))}
                <button aria-pressed={asTable} onClick={() => setAsTable(!asTable)}>View as table</button>
              </div>
              {asTable ? (
                <div className="scroll">
                  <table>
                    <caption>{m.label} by quarter</caption>
                    <thead><tr><th scope="col">Quarter</th>{shown.map((b) => <th key={b.id} scope="col"><Dot id={b.id} />{b.name}</th>)}</tr></thead>
                    <tbody>{QUARTERS.map((n, i) => <tr key={n}><th scope="row">{n}</th>{shown.map((b) => <td key={b.id}>{fmt(val(b.id, mk, i), m)}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              ) : (
                <div role="img" aria-label={`Line chart of ${m.label} for ${shown.map((b) => b.name).join(", ")} over ${QUARTERS.length} quarters. Use View as table for the values.`} style={{ "--glowc": `var(--c-${bank})` } as CSSProperties}>
                  <ResponsiveContainer width="100%" height={340}>
                    <ComposedChart data={chartData} accessibilityLayer margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fillg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" style={{ stopColor: `var(--c-${bank})`, stopOpacity: 0.35 }} />
                          <stop offset="100%" style={{ stopColor: `var(--c-${bank})`, stopOpacity: 0 }} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--line)" />
                      <XAxis dataKey="q" stroke="var(--mut)" tickLine={false} axisLine={false} minTickGap={24} />
                      <YAxis domain={["auto", "auto"]} stroke="var(--mut)" tickLine={false} axisLine={false} tickCount={5} unit={m.unit.trim() === "%" ? "%" : ""} />
                      <Tooltip contentStyle={{ background: "color-mix(in srgb, var(--card) 85%, transparent)", border: "1px solid var(--line)", borderRadius: 14, color: "var(--fg)", backdropFilter: "blur(14px)" }} />
                      {focus && !off.includes(bank) && <Area dataKey={bank} stroke="none" fill="url(#fillg)" connectNulls isAnimationActive={false} legendType="none" tooltipType="none" />}
                      {BANKS.map((b, i) => {
                        const dim = focus && b.id !== bank;
                        return !off.includes(b.id) && (
                          <Line key={b.id} type="monotone" dataKey={b.id} name={b.name} stroke={`var(--c-${b.id})`} strokeDasharray={DASH[i]} strokeOpacity={dim ? 0.45 : 1}
                            strokeLinecap="round" className={focus && b.id === bank ? "glow" : undefined}
                            strokeWidth={focus ? (b.id === bank ? 3.5 : 1.75) : 2.5} dot={dim ? false : { r: 3 }} connectNulls isAnimationActive={false} />
                        );
                      })}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
            <Gap mk={mk} bank={bank} />
            <Scat q={q} bank={bank} focus={focus} />
          </>
        )}

        {tab === "compare" && <Compare key={bank} q={q} a={bank} />}

        {tab === "analysis" && (
          <>
            <Note key={bank} q={q} bank={bank} />
            <Sources />
          </>
        )}
      </main>
    </div>
  );
}