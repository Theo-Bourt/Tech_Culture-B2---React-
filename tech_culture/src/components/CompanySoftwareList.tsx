import type { CompanySoftware } from "../types";

interface CompanySoftwareListProps {
  software: CompanySoftware;
}

export function CompanySoftwareList({ software }: CompanySoftwareListProps) {
  return (
    <section className="company-panel software">
      <div>
        <h2 className="company-panel__title">Logiciels développés</h2>
        {software.crees.length > 0 && (
          <ul className="software__list">
            {software.crees.map((name) => (
              <li key={name} className="software__chip">
                {name}
              </li>
            ))}
          </ul>
        )}
        {software.noteCrees && <p className="software__note">{software.noteCrees}</p>}
      </div>

      <div>
        <h2 className="company-panel__title">Logiciels utilisés</h2>
        {software.utilises.length > 0 ? (
          <ul className="software__list">
            {software.utilises.map((tool) => (
              <li key={tool.nom}>
                <a
                  className="software__chip software__chip--link"
                  href={tool.source}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tool.nom}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="software__note">
            L'entreprise ne documente pas publiquement ses outils internes.
          </p>
        )}
        {software.noteUtilises && (
          <p className="software__note">{software.noteUtilises}</p>
        )}
      </div>
    </section>
  );
}
