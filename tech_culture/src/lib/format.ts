import type { Company } from "../types";

export function formatRevenue(company: Company): string {
  return `${company.chiffreAffaires.toLocaleString("fr-FR")} Md${company.devise ?? "$"}`;
}

export function formatPercent(part: number): string {
  return `${part.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`;
}
