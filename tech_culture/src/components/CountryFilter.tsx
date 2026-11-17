import type { CountryCount } from "../algorithms/filter";

interface CountryFilterProps {
  countries: CountryCount[];
  selected: string | null;
  onChange: (country: string | null) => void;
}

export function CountryFilter({ countries, selected, onChange }: CountryFilterProps) {
  return (
    <div className="country-filter" role="group" aria-label="Filtrer par pays">
      <button
        type="button"
        className="country-filter__chip"
        aria-pressed={selected === null}
        onClick={() => onChange(null)}
      >
        Tous les pays
      </button>
      {countries.map(({ pays, total }) => (
        <button
          key={pays}
          type="button"
          className="country-filter__chip"
          aria-pressed={selected === pays}
          // Un second clic sur le pays actif retire le filtre
          onClick={() => onChange(selected === pays ? null : pays)}
        >
          {pays}
          <span className="country-filter__count">{total}</span>
        </button>
      ))}
    </div>
  );
}
