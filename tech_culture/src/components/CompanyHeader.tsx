import { formatRevenue } from "../lib/format";
import type { Company } from "../types";

interface CompanyHeaderProps {
  company: Company;
}

export function CompanyHeader({ company }: CompanyHeaderProps) {
  return (
    <header className="company-header">
      <p className="company-header__lead">{company.description}</p>
      <ul className="company-header__points">
        {company.pointsCles.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      <dl className="company-header__facts">
        <div>
          <dt>Secteur</dt>
          <dd>{company.secteur}</dd>
        </div>
        <div>
          <dt>Siège</dt>
          <dd>
            {company.siege.ville}, {company.pays}
          </dd>
        </div>
        <div>
          <dt>Fondation</dt>
          <dd>{company.fondation}</dd>
        </div>
        {company.chiffreAffaires > 0 && (
          <div>
            <dt>Chiffre d'affaires</dt>
            <dd>{formatRevenue(company)}</dd>
          </div>
        )}
        {company.capitalisation > 0 && (
          <div>
            <dt>Capitalisation</dt>
            <dd>
              {company.capitalisation.toLocaleString("fr-FR")} Md$
            </dd>
          </div>
        )}
        {company.effectifs > 0 && (
          <div>
            <dt>Effectifs</dt>
            <dd>{company.effectifs.toLocaleString("fr-FR")}</dd>
          </div>
        )}
      </dl>
    </header>
  );
}
