import type { MetricKey } from "./data";

export const INFO: Record<MetricKey, string> = {
  roe: "Adjusted return on common equity: profit earned per dollar of shareholder equity. Higher is better.",
  efficiency: "Adjusted expenses as a share of revenue (TD is net of insurance expenses). Lower means leaner.",
  nim: "Net interest margin: the spread earned on lending and investing. Definitions differ by bank (see the note). Higher is better.",
  cet1: "Common Equity Tier 1 ratio: core capital relative to risk-weighted assets, a buffer against losses. Higher is better.",
  pcl: "Provision for credit losses in basis points of average loans: the expected cost of bad loans. Lower is better.",
};

// Banks whose NIM only exists including trading assets, so it is not comparable with the ex-trading banks.
export const NIM_INCLUDES_TRADING = ["td", "cm"];

// Paste your GitHub repo link here once it exists; the header link appears automatically.
export const REPO_URL = "";