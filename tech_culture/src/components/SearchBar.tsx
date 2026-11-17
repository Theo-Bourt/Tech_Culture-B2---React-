import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-bar" role="search">
      <Search className="search-bar__icon" size={18} />
      <input
        className="search-bar__input"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Entreprise, pays, secteur, dirigeant…"
        aria-label="Rechercher une entreprise"
      />
      {value && (
        <button
          type="button"
          className="search-bar__clear"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

