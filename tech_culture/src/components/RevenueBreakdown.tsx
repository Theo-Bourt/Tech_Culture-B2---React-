import { formatPercent, formatRevenue } from "../lib/format";
import type { Company } from "../types";

interface RevenueBreakdownProps {
  company: Company;
}

export function RevenueBreakdown({ company }: RevenueBreakdownProps) {
  const { exercice, source, segments, note } = company.activites;
  const summary = segments
    .map((segment) => `${segment.nom} : ${formatPercent(segment.part)}`)
    .join(", ");

  return (
    <section className="company-panel">
      <h2 className="company-panel__title">Activités</h2>
      {company.chiffreAffaires > 0 && (
        <p className="revenue__total">
          {segments.length > 0 ? "Part de chaque activité dans les " : "Chiffre d'affaires de "}
          <strong>{formatRevenue(company)}</strong>
          {segments.length > 0 && " de chiffre d'affaires"}
        </p>
      )}

      {segments.length > 0 && (
        <>
          <div className="revenue__bar" role="img" aria-label={summary}>
            {segments.map((segment, index) => (
              <span
                key={segment.nom}
                className="revenue__segment"
                style={{
                  flexBasis: `${segment.part}%`,
                  background: `var(--viz-${index + 1})`,
                }}
                title={`${segment.nom} : ${formatPercent(segment.part)}`}
              />
            ))}
          </div>
          <ul className="revenue__list">
            {segments.map((segment, index) => (
              <li key={segment.nom} className="revenue__row">
                <span
                  className="revenue__swatch"
                  style={{ background: `var(--viz-${index + 1})` }}
                />
                <span className="revenue__name">{segment.nom}</span>
                <span className="revenue__part">{formatPercent(segment.part)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {note && <p className="revenue__note">{note}</p>}
      <p className="revenue__note">
        {exercice && `Exercice clos en ${exercice}. `}
        <a href={source} target="_blank" rel="noreferrer">
          Voir la source
        </a>
      </p>
    </section>
  );
}
