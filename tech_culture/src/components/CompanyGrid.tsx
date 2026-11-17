import type { Company } from "../types";
import { CompanyCard } from "./CompanyCard";

interface CompanyGridProps {
  companies: Company[];
  onSelect: (id: string) => void;
}

export function CompanyGrid({ companies, onSelect }: CompanyGridProps) {
  return (
    <div className="company-grid">
      {companies.map((company) => (
        <CompanyCard key={company.id} company={company} onSelect={onSelect} />
      ))}
    </div>
  );
}



// Version simple : une seule grille. Plus tard, cette liste deviendra des
// groupes (CompanyGroup[]) produits par algorithms/groupBy.ts.