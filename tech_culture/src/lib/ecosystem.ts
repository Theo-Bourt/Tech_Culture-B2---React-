import type { CompanyRelation } from "../types";

export type LinkDirection = "incoming" | "outgoing";

// Paire de la palette du site, vérifiée pour le daltonisme : `incoming` va vers
// l'entreprise choisie, `outgoing` part d'elle.
export const DIRECTION_COLORS: Record<LinkDirection, string> = {
  incoming: "#eb6834",
  outgoing: "#2a78d6",
};

/** « de TSMC », mais « d'Apple » : le français élide devant une voyelle. */
export function ofCompany(name: string): string {
  return /^[aeiouy]/i.test(name) ? `d'${name}` : `de ${name}`;
}

/** Les relations où l'entreprise apparaît, comme source ou comme cible. */
export function relationsOf(
  relations: CompanyRelation[],
  companyId: string,
): CompanyRelation[] {
  return relations.filter(
    (relation) => relation.source === companyId || relation.cible === companyId,
  );
}

/** Les identifiants des entreprises reliées par ces relations, l'entreprise choisie comprise. */
export function linkedIds(relations: CompanyRelation[]): string[] {
  return relations.flatMap((relation) => [relation.source, relation.cible]);
}
