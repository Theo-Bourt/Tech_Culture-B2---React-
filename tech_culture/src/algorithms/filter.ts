import type { Company } from "../types";

export interface CountryCount {
  pays: string;
  total: number;
}

/** Les pays présents et leur nombre d'entreprises, du plus représenté au moins représenté. */
export function countCountries(companies: Company[]): CountryCount[] {
  const totals = new Map<string, number>();
  for (const company of companies) {
    totals.set(company.pays, (totals.get(company.pays) ?? 0) + 1);
  }
  return [...totals]
    .map(([pays, total]) => ({ pays, total }))
    .sort((a, b) => b.total - a.total || a.pays.localeCompare(b.pays, "fr"));
}

/** Sans pays choisi (null), toutes les entreprises sont gardées. */
export function filterByCountry(
  companies: Company[],
  country: string | null,
): Company[] {
  return country
    ? companies.filter((company) => company.pays === country)
    : companies;
}
