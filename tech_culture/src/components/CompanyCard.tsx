import type { Company } from "../types";

interface CompanyCardProps {
  company: Company;
  onSelect: (id: string) => void;
}

export function CompanyCard({ company, onSelect }: CompanyCardProps) {
  return (
    <button
      type="button"
      className="company-card"
      title={company.nom}
      onClick={() => onSelect(company.id)}
    >
      {company.logo ? (
        <img className="company-card__logo" src={company.logo} alt={company.nom} />
      ) : (
        <strong>{company.nom}</strong>
      )}
    </button>
  );
}
