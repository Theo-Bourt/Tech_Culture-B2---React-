import type { Leader } from "../types";

interface CompanyLeadersProps {
  leaders: Leader[];
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

export function CompanyLeaders({ leaders }: CompanyLeadersProps) {
  return (
    <section className="company-panel">
      <h2 className="company-panel__title">Direction</h2>
      <ul className="leaders">
        {leaders.map((leader) => (
          <li key={leader.nom} className="leader">
            {leader.photo ? (
              <img className="leader__photo" src={leader.photo} alt="" />
            ) : (
              <span className="leader__photo leader__photo--initials" aria-hidden="true">
                {initials(leader.nom)}
              </span>
            )}
            <div>
              <strong className="leader__name">{leader.nom}</strong>
              <span className="leader__role">
                {leader.titre} depuis {leader.depuis}
              </span>
              {leader.credit && (
                <a
                  className="leader__credit"
                  href={leader.credit.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Photo : {leader.credit.auteur}, {leader.credit.licence}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
