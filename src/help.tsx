import { useState } from "react";
import type { MetricKey } from "./data";
import { metric } from "./calc";
import { INFO } from "./meta";

export default function Help({ k }: { k: MetricKey }) {
  const [o, setO] = useState(false);
  return (
    <span className="help">
      <button type="button" aria-label={`About ${metric(k).label}`} aria-expanded={o}
        onClick={() => setO(!o)} onBlur={() => setO(false)} onKeyDown={(e) => e.key === "Escape" && setO(false)}>ⓘ</button>
      <span role="note" className={o ? "pop show" : "pop"}>{INFO[k]}</span>
    </span>
  );
}