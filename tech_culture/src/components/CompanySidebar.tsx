import type { Company, CompanyCategory } from "../types";

interface CompanySidebarProps {
  companies: Company[];
  // Pays du filtre actif, repris dans le titre
  country: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const CATEGORY_ORDER: CompanyCategory[] = [
  "IA",
  "Puces",
  "Logiciels et cloud",
  "Internet",
  "Matériel",
];

export function CompanySidebar({
  companies,
  country,
  selectedId,
  onSelect,
}: CompanySidebarProps) {
  return (
    <aside className="company-side" aria-label="Toutes les entreprises par catégorie">
      <h2 className="company-side__title">
        {country ? `Entreprises : ${country}` : "Toutes les entreprises"}
      </h2>
      {CATEGORY_ORDER.map((category) => {
        const members = companies.filter(
          (company) => company.categorie === category,
        );
        if (members.length === 0) return null;
        return (
          <section key={category} className="company-side__group">
            <h3 className="company-side__category">
              {category}
              <span className="company-side__count">{members.length}</span>
            </h3>
            <ul className="company-side__list">
              {members.map((company) => (
                <li key={company.id}>
                  <button
                    type="button"
                    className="company-side__item"
                    aria-pressed={company.id === selectedId}
                    onClick={() => onSelect(company.id)}
                  >
                    <span className="company-side__name">{company.nom}</span>
                    <span className="company-side__country">{company.pays}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </aside>
  );
}
