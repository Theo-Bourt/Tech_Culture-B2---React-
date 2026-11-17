import { Link } from "react-router-dom";
import { DIRECTION_COLORS, ofCompany, type LinkDirection } from "../lib/ecosystem";
import type { Company, CompanyRelation } from "../types";

interface CompanyLinksProps {
  companies: Company[];
  relations: CompanyRelation[];
  selectedId: string | null;
}

export function CompanyLinks({
  companies,
  relations,
  selectedId,
}: CompanyLinksProps) {
  const nameOf = (id: string) =>
    companies.find((company) => company.id === id)?.nom ?? id;

  if (!selectedId) {
    return (
      <section className="links" aria-label="Écosystème des entreprises">
        <p className="links__help">
          Clique sur une entreprise, ou recherche-la, pour afficher son
          écosystème sur la carte.
        </p>
      </section>
    );
  }

  const name = nameOf(selectedId);
  const groups: {
    direction: LinkDirection;
    title: string;
    items: CompanyRelation[];
  }[] = [
    {
      direction: "incoming",
      title: `Vers ${name} : ce que ${name} reçoit`,
      items: relations.filter((relation) => relation.cible === selectedId),
    },
    {
      direction: "outgoing",
      title: `Depuis ${name} : ce que ${name} fournit`,
      items: relations.filter((relation) => relation.source === selectedId),
    },
  ];

  return (
    <section className="links" aria-label={`Écosystème ${ofCompany(name)}`}>
      <div className="links__list-header">
        <h2 className="links__list-title">Écosystème {ofCompany(name)}</h2>
      </div>
      <p className="links__help">
        Chaque flèche part du fournisseur ou de la plateforme. Survole un trait
        pour le décrire.
      </p>
      {groups
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <div key={group.direction} className="links__group">
            <h3 className="links__group-title">
              <span
                className="links__swatch"
                style={{ background: DIRECTION_COLORS[group.direction] }}
              />
              {group.title}
            </h3>
            <ul className="links__list">
              {group.items.map((relation) => (
                <li
                  key={`${relation.source}-${relation.cible}`}
                  className="links__item"
                >
                  <span className="links__pair">
                    <Link to={`/entreprise/${relation.source}`}>
                      {nameOf(relation.source)}
                    </Link>
                    {" → "}
                    <Link to={`/entreprise/${relation.cible}`}>
                      {nameOf(relation.cible)}
                    </Link>
                  </span>
                  <span className="links__description">
                    {relation.description}{" "}
                    <a href={relation.lien} target="_blank" rel="noreferrer">
                      Source
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </section>
  );
}
