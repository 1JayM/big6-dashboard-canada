import { useEffect, useRef, useState } from "react";

const P: Record<string, string> = {
  overview: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  rankings: "M8 6h12 M8 12h12 M8 18h12 M3.5 6h.01 M3.5 12h.01 M3.5 18h.01",
  trends: "M3 17l6-6 4 4 8-8 M15 7h6v6",
  compare: "M8 7h12 M16 3l4 4-4 4 M16 17H4 M8 13l-4 4 4 4",
  analysis: "M7 3h8l4 4v14H7z M15 3v4h4 M10 12h6 M10 16h6",
  roe: "M12 2v20 M17 6H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6",
  efficiency: "M13 2L4 14h7l-1 8 9-12h-7z",
  nim: "M19 5L5 19 M6.5 6.5h.01 M17.5 17.5h.01",
  cet1: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  pcl: "M12 3l10 18H2z M12 10v5 M12 18h.01",
  trophy: "M8 21h8 M12 17v4 M7 4h10v5a5 5 0 01-10 0z M7 6H4v1a3 3 0 003 3 M17 6h3v1a3 3 0 01-3 3",
};

export function Icon({ n, size = 18 }: { n: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[n] ?? ""} />
    </svg>
  );
}

// Counts up to a value; shows the final number immediately when reduced motion is on.
export function Count({ v, dec = 1 }: { v: number; dec?: number }) {
  const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [x, setX] = useState(reduce ? v : 0);
  const from = useRef(reduce ? v : 0);
  useEffect(() => {
    if (reduce) { setX(v); return; }
    const a = from.current, t0 = performance.now();
    let id = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / 800), cur = a + (v - a) * (1 - Math.pow(1 - p, 3));
      setX(cur); from.current = cur;
      if (p < 1) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [v, reduce]);
  return <>{x.toFixed(dec)}</>;
}

export function Dot({ id }: { id: string }) {
  return <i className="dot" style={{ background: `var(--c-${id})` }} aria-hidden="true" />;
}