import type { Company } from "../types";

/** Minuscules et sans accents : « etats » doit trouver « États-Unis ». */
function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/**
 * L'entreprise que la recherche désigne sans ambiguïté, sinon null. Un seul nom
 * correspondant suffit : « mistral » désigne Mistral AI, même si ASML utilise ses modèles.
 */
export function findSingleMatch(companies: Company[], query: string): Company | null {
  const matches = searchCompanies(companies, query);
  if (matches.length === 1) return matches[0];
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return null;
  const byName = matches.filter((company) =>
    words.every((word) => normalize(company.nom).includes(word)),
  );
  return byName.length === 1 ? byName[0] : null;
}

/**
 * Garde les entreprises qui contiennent tous les mots de la recherche, dans leur
 * nom, pays, secteur, catégorie, ville, description, activités, dirigeants, services ou logiciels.
 * Les entreprises dont le nom correspond passent en premier.
 */
export function searchCompanies(companies: Company[], query: string): Company[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return companies;

  const matches = companies.filter((company) => {
    const text = normalize(
      [
        company.nom,
        company.pays,
        company.secteur,
        company.siege.ville,
        company.categorie,
        company.description,
        ...company.dirigeants.map((leader) => leader.nom),
        ...company.activites.segments.map((segment) => segment.nom),
        ...company.services,
        ...company.logiciels.crees,
        ...company.logiciels.utilises.map((tool) => tool.nom),
      ].join(" "),
    );
    return words.every((word) => text.includes(word));
  });

  const nameMatches = (company: Company) =>
    words.every((word) => normalize(company.nom).includes(word));

  return [
    ...matches.filter(nameMatches),
    ...matches.filter((company) => !nameMatches(company)),
  ];
}
