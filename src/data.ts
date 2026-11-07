// Fiscal quarters (Canadian banks' year ends Oct 31). Oldest -> newest.
export const QUARTERS = [
  "Q4 2024", "Q1 2025", "Q2 2025", "Q3 2025",
  "Q4 2025", "Q1 2026", "Q2 2026", "Q3 2026",
];

export const BANKS = [
  { id: "bns", name: "Scotiabank", color: "#EC111A" },
  { id: "ry", name: "RBC", color: "#1f5fa8" },
  { id: "td", name: "TD", color: "#2e9e4f" },
  { id: "bmo", name: "BMO", color: "#0079c1" },
  { id: "cm", name: "CIBC", color: "#8e1b3a" },
  { id: "na", name: "National Bank", color: "#e07b00" },
];

export const METRICS = [
  { key: "roe", label: "ROE", unit: "%", higherIsBetter: true },
  { key: "efficiency", label: "Efficiency ratio", unit: "%", higherIsBetter: false },
  { key: "nim", label: "NIM", unit: "%", higherIsBetter: true },
  { key: "cet1", label: "CET1 ratio", unit: "%", higherIsBetter: true },
  { key: "pcl", label: "PCL ratio", unit: " bps", higherIsBetter: false },
] as const;

export type MetricKey = (typeof METRICS)[number]["key"];
type Series = (number | null)[];

const empty = (): Series => Array(QUARTERS.length).fill(null);
const row = () => ({ roe: empty(), efficiency: empty(), nim: empty(), cet1: empty(), pcl: empty() });

// Basis used for every bank: ROE and efficiency ratio ADJUSTED; CET1 as reported;
// PCL = total PCL on loans as % of average net loans (bps).
// NIM definitions differ by bank, so the exact line used is noted per bank. VERIFY these.
export const DATA: Record<string, Record<MetricKey, Series>> = {
  // Source: Scotiabank Q3 2026 Supplementary Financial Information, p.1 Highlights
  // Productivity ratio = efficiency ratio. NIM as reported (2.49% in Q3/26).
  bns: {
    roe:        [10.6, 11.8, 10.4, 12.4, 12.5, 13.0, 13.2, 14.2],
    efficiency: [56.1, 54.5, 55.7, 53.7, 54.3, 52.3, 52.5, 52.5],
    nim:        [2.15, 2.23, 2.31, 2.36, 2.40, 2.45, 2.49, 2.49],
    cet1:       [13.1, 12.9, 13.2, 13.3, 13.2, 13.3, 13.3, 13.1],
    pcl:        [54, 60, 75, 55, 58, 61, 66, 56],
  },
  // Source: RBC Q3 2026 Supplementary Financial Information, pp.2-3 Financial Highlights
  // NIM = "NIM excluding Trading Assets, Trading net interest income and Insurance Assets"
  // (RBC's headline NIM on average earning assets is lower: 1.49% in Q3/26). Check this matches Scotia's definition.
  ry: {
    roe:        [15.1, 17.2, 14.7, 17.7, 17.2, 17.8, 17.4, 18.1],
    efficiency: [57.9, 54.3, 54.5, 53.5, 53.6, 52.1, 53.5, 52.2],
    nim:        [2.17, 2.16, 2.14, 2.09, 2.12, 2.13, 2.11, 2.07],
    cet1:       [13.2, 13.2, 13.2, 13.2, 13.5, 13.7, 13.5, 13.5],
    pcl:        [35, 42, 58, 35, 39, 41, 35, 36],
  },
  // Source: TD Q3 2026 Supplemental Financial Information, pp.3-4 and 6
  // ROE adjusted; efficiency = "adjusted, net of insurance service expenses" (TD's headline measure);
  // NIM = adjusted NIM on average earning assets INCLUDING trading assets, so it is NOT directly comparable
  // to Scotia/RBC ex-trading NIM above. PCL = PCL as % of average net loans.
  td: {
    roe:        [11.7, 13.2, 12.3, 13.2, 12.8, 14.2, 14.4, 16.0],
    efficiency: [61.7, 59.0, 57.6, 57.8, 59.2, 57.1, 57.0, 55.2],
    nim:        [1.74, 1.67, 1.78, 1.83, 1.83, 1.86, 1.96, 1.94],
    cet1:       [13.1, 13.1, 14.9, 14.8, 14.7, 14.5, 14.3, 14.3],
    pcl:        [47, 50, 58, 41, 41, 43, 43, 37],
  },
  // Source: BMO Q3 2026 Supplementary Financial Information, p.6 and p.15
  // ROE and efficiency adjusted. NIM = adjusted NIM excluding Global Markets and Insurance (comparable to the
  // ex-trading NIM used for Scotia/RBC; BMO's headline NIM is lower, 1.60% in Q3/26). PCL = total PCL to average net loans.
  // Reported Q3/26 ROE is only 8.4% because of a large divestiture charge, which is why adjusted is used.
  bmo: {
    roe:        [7.4, 11.3, 9.8, 12.0, 11.8, 12.4, 13.5, 14.0],
    efficiency: [58.3, 56.3, 56.5, 55.8, 56.7, 57.8, 54.4, 54.9],
    nim:        [2.11, 2.13, 2.17, 2.21, 2.30, 2.33, 2.29, 2.26],
    cet1:       [13.6, 13.6, 13.5, 13.5, 13.3, 13.1, 13.0, 13.0],
    pcl:        [91, 58, 63, 47, 44, 44, 45, 41],
  },
  // Source: CIBC Q3 2026 Supplementary Financial Information, pp.4-6
  // ROE and efficiency adjusted. NIM = headline NIM on average interest-earning assets INCLUDING trading
  // (CIBC's ex-trading NIM is higher, e.g. 1.94% in Q3/25 vs 1.58% here), so it is NOT comparable to Scotia/RBC/BMO.
  // PCL = total PCL x4 / average net loans, computed by me (CIBC's own "loan loss ratio" is impaired-only). VERIFY.
  cm: {
    roe:        [13.4, 15.3, 13.9, 14.2, 14.1, 17.4, 16.4, 16.8],
    efficiency: [57.2, 53.1, 54.2, 54.7, 55.0, 51.4, 52.3, 52.7],
    nim:        [1.50, 1.50, 1.54, 1.58, 1.59, 1.61, 1.67, 1.63],
    cet1:       [13.3, 13.5, 13.4, 13.4, 13.3, 13.4, 13.6, 13.4],
    pcl:        [30, 41, 43, 39, 41, 38, 40, 37],
  },
  // Source: National Bank Q3 2026 Supplementary Financial Information, pp.4-6
  // ROE and efficiency adjusted. NIM = "Net interest margin, non-trading - adjusted" (comparable to the ex-trading NIM
  // used for Scotia/RBC/BMO). PCL = PCL as % of average loans (all-in). Q2 2025's 79 bps includes a one-off $230M initial
  // provision on loans acquired with CWB, so it is not an underlying figure.
  na: {
    roe:        [15.9, 17.6, 15.6, 14.1, 14.6, 16.6, 16.8, 16.8],
    efficiency: [54.6, 50.2, 49.3, 52.4, 52.7, 49.3, 50.4, 49.8],
    nim:        [2.26, 2.26, 2.23, 2.22, 2.19, 2.24, 2.16, 2.18],
    cet1:       [13.7, 13.6, 13.4, 13.9, 13.8, 13.7, 13.5, 13.5],
    pcl:        [27, 41, 79, 28, 33, 32, 31, 31],
  },
};