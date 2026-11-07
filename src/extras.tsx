import { useState } from "react";
import { METRICS, QUARTERS } from "./data";
import { bankName, edge, rank } from "./calc";

const SRC: [string, string][] = [
  ["Scotiabank", "https://www.scotiabank.com/content/dam/scotiabank/corporate/quarterly-reports/2026/q3/Q326_Supplementary_Financial_Information-EN.pdf"],
  ["RBC", "https://www.rbc.com/investor-relations/_assets-custom/pdf/26q3supp.pdf"],
  ["TD", "https://www.td.com/content/dam/tdcom/canada/about-td/pdf/quarterly-results/2026/q3/2026-q3-financial-supppack-en.pdf"],
  ["BMO", "https://www.bmo.com/ir/qtrinfo/1/2026-q3/SuppQ326.pdf"],
  ["CIBC", "https://www.cibc.com/content/dam/cibc-public-assets/about-cibc/investor-relations/pdfs/quarterly-results/2026/q326financials-en.pdf"],
  ["National Bank", "https://www.nbc.ca/content/dam/bnc/a-propos-de-nous/relations-investisseurs/resultats-trimestriels/2026/suppack-q3-2026.pdf"],
];
const sgn = (n: number) => `${n >= 0 ? "+" : "−"}${Math.abs(n).toFixed(2)}`;

export function Note({ q, bank }: { q: number; bank: string }) {
  const [text, setText] = useState(() => { try { return localStorage.getItem(`big6-note-${bank}`) ?? ""; } catch { return ""; } });
  const save = (v: string) => { setText(v); try { localStorage.setItem(`big6-note-${bank}`, v); } catch { /* storage unavailable */ } };
  const facts = METRICS.filter((m) => m.key !== "nim").flatMap((m) => {
    const r = rank(m.key, bank, q), e = edge(m.key, q, bank), e0 = edge(m.key, 0, bank);
    if (r === null || e === null || e0 === null) return [];
    return [`${m.label}: rank ${r} of 6. Edge vs peers ${sgn(e)}${m.unit} (${sgn(e0)}${m.unit} in ${QUARTERS[0]}), so its relative position has ${e - e0 >= 0 ? "improved" : "worsened"}.`];
  });
  return (
    <section aria-labelledby="an">
      <h2 id="an">Analyst note: {bankName(bank)} vs. peers</h2>
      <p className="note">The facts below update from the data. The write-up is yours: say what is driving the gaps and what you would watch next.</p>
      <ul className="ins">{facts.length ? facts.map((f) => <li key={f}>{f}</li>) : <li>Enter data to generate facts.</li>}</ul>
      <label htmlFor="note"><h3>Your view (saved in this browser)</h3></label>
      <textarea id="note" rows={7} value={text} onChange={(e) => save(e.target.value)} placeholder="One paragraph: where Scotiabank stands, why, and what would change your view." />
    </section>
  );
}

export function Sources() {
  return (
    <section aria-labelledby="src">
      <h2 id="src">Sources and definitions</h2>
      <p className="note">Data through Q3 2026 (quarter ended July 31, 2026). Fiscal year ends October 31. Figures were transcribed from these PDFs in October 2026, so check any number you quote against the source.</p>
      <ul className="ins">{SRC.map(([n, u]) => <li key={n}><a href={u} target="_blank" rel="noreferrer">{n}: Q3 2026 supplementary financial information (PDF)</a></li>)}</ul>
      <ul className="ins">
        <li>ROE and efficiency ratio are adjusted figures. CET1 is as reported.</li>
        <li>PCL ratio is total provision for credit losses as basis points of average loans. CIBC’s was calculated from its reported dollar figures.</li>
        <li>NIM: Scotiabank, RBC, BMO and National Bank use ex-trading measures. TD and CIBC only publish NIM including trading, so it is not comparable.</li>
        <li>Quarters with one-off items (for example National Bank Q2 2025 PCL, BMO Q4 2024) are real, not errors.</li>
      </ul>
    </section>
  );
}