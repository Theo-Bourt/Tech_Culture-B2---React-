import { Network } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useNavigate } from "react-router-dom";
import { countCountries, filterByCountry } from "../algorithms/filter";
import { findSingleMatch, searchCompanies } from "../algorithms/search";
import { CompanyGrid } from "../components/CompanyGrid";
import { CompanyLinks } from "../components/CompanyLinks";
import { CompanySidebar } from "../components/CompanySidebar";
import { CountryFilter } from "../components/CountryFilter";
import { SearchBar } from "../components/SearchBar";
import { WorldMap } from "../components/WorldMap";
import { useCompanies } from "../hooks/useCompanies";
import { linkedIds, relationsOf } from "../lib/ecosystem";
import {
  boundsOf,
  COUNTRY_MAX_ZOOM,
  FIT_PADDING,
  isInValley,
  LOCATE_ZOOM,
  MOVE_DURATION,
  NARROW_MAP_WIDTH,
  VALLEY_BOUNDS,
  VALLEY_PADDING,
  VALLEY_PADDING_NARROW,
  WORLD_VIEW,
} from "../lib/mapView";
import type { Company } from "../types";

export function HomePage() {
  const { companies, relations } = useCompanies();
  const navigate = useNavigate();
  const mapRef = useRef<MapLibreMap>(null);

  // --- État ---
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [showLinks, setShowLinks] = useState(false);
  const [valleyZoom, setValleyZoom] = useState(false);

  // --- Données dérivées ---
  const countries = useMemo(() => countCountries(companies), [companies]);
  const countryCompanies = useMemo(
    () => filterByCountry(companies, country),
    [companies, country],
  );
  const results = useMemo(
    () => searchCompanies(countryCompanies, query),
    [countryCompanies, query],
  );
  const selectedRelations = useMemo(
    () => (showLinks && selectedId ? relationsOf(relations, selectedId) : []),
    [relations, selectedId, showLinks],
  );
  // Les partenaires restent sur la carte même si la recherche les écarte des cartes
  const mapCompanies = useMemo(() => {
    const partnerIds = linkedIds(selectedRelations);
    return companies.filter(
      (company) => results.includes(company) || partnerIds.includes(company.id),
    );
  }, [companies, results, selectedRelations]);
  // Dans la vallée, le zoom sur une entreprise montre aussi ses voisines
  const showCloseLabels =
    valleyZoom ||
    (!showLinks &&
      mapCompanies.some(
        (company) => company.id === selectedId && isInValley(company),
      ));

  // --- Mouvements de la carte ---
  const showWorld = () => {
    setValleyZoom(false);
    mapRef.current?.flyTo({ ...WORLD_VIEW, duration: MOVE_DURATION });
  };

  const zoomOnValley = () => {
    setValleyZoom(true);
    const map = mapRef.current;
    if (!map) return;
    const narrow = map.getContainer().clientWidth < NARROW_MAP_WIDTH;
    map.fitBounds(VALLEY_BOUNDS, {
      padding: narrow ? VALLEY_PADDING_NARROW : VALLEY_PADDING,
      duration: MOVE_DURATION,
    });
  };

  const fitCountry = (pool: Company[]) => {
    mapRef.current?.fitBounds(boundsOf(pool), {
      padding: FIT_PADDING,
      maxZoom: COUNTRY_MAX_ZOOM,
      duration: MOVE_DURATION,
    });
  };

  // --- Sélection ---
  /** Sélectionne l'entreprise et cadre la carte sur elle et ses partenaires. */
  const focusOnLinks = (company: Company) => {
    setSelectedId(company.id);
    setValleyZoom(false);
    const partnerIds = linkedIds(relationsOf(relations, company.id));
    const points = companies.filter(
      (candidate) =>
        candidate.id === company.id || partnerIds.includes(candidate.id),
    );
    mapRef.current?.fitBounds(boundsOf(points), {
      padding: FIT_PADDING,
      maxZoom: LOCATE_ZOOM,
      duration: MOVE_DURATION,
    });
  };

  const leaveSelection = () => {
    setSelectedId(null);
    showWorld();
  };

  const locateCompany = (company: Company) => {
    if (showLinks) {
      focusOnLinks(company);
    } else {
      setSelectedId(company.id);
      setValleyZoom(false);
      mapRef.current?.flyTo({
        center: [company.siege.lng, company.siege.lat],
        zoom: LOCATE_ZOOM,
      });
    }
    // Sur petit écran, la carte peut être hors de vue quand on clique sur une case
    mapRef.current
      ?.getContainer()
      .scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const locateCompanyById = (id: string) => {
    const company = companies.find((candidate) => candidate.id === id);
    if (company) locateCompany(company);
  };

  const goToCompany = (id: string) => navigate(`/entreprise/${id}`);




  // --- Écosystème, recherche et filtre ---
  const toggleLinks = () => {
    const next = !showLinks;
    setShowLinks(next);
    const current =
      companies.find((company) => company.id === selectedId) ??
      findSingleMatch(countryCompanies, query);
    if (!next) {
      leaveSelection();
    } else if (current) {
      focusOnLinks(current);
    } else {
      showWorld();
    }
  };

  /** En mode écosystème, suit l'entreprise désignée par la recherche et le filtre. */
  const followFilters = (pool: Company[], value: string) => {
    if (!showLinks) return;
    const single = findSingleMatch(pool, value);
    const found = searchCompanies(pool, value);
    if (single) {
      if (single.id !== selectedId) focusOnLinks(single);
    } else if (selectedId && !found.some((company) => company.id === selectedId)) {
      leaveSelection();
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    followFilters(countryCompanies, value);
  };

  const handleCountryChange = (next: string | null) => {
    setCountry(next);
    const pool = filterByCountry(companies, next);
    // Une entreprise écartée par le filtre ne doit pas rester sélectionnée
    const keepsSelection = pool.some((company) => company.id === selectedId);
    if (!keepsSelection) setSelectedId(null);
    setValleyZoom(false);

    if (showLinks && findSingleMatch(pool, query)) {
      followFilters(pool, query);
    } else if (showLinks && keepsSelection) {
      // L'écosystème affiché reste cadré sur ses partenaires
    } else if (!next) {
      showWorld();
    } else {
      fitCountry(pool);
    }
  };

  // --- Rendu ---
  return (
    <div className="home-layout">
      <div className="home-layout__main">
        <h1>Les géants de la tech</h1>
        <p>Clique sur une entreprise pour la situer sur la carte.</p>

        <div className="home-tools">
          <SearchBar value={query} onChange={handleQueryChange} />
          <button
            type="button"
            className="home-tools__toggle"
            aria-pressed={showLinks}
            onClick={toggleLinks}
          >
            <Network size={18} />
            {showLinks ? "Masquer l'écosystème" : "Voir l'écosystème"}
          </button>
        </div>
        <CountryFilter
          countries={countries}
          selected={country}
          onChange={handleCountryChange}
        />
        <p className="search-count" aria-live="polite">
          {(query || country) && describeResults(results.length, query, country)}
        </p>

        <WorldMap
          mapRef={mapRef}
          companies={mapCompanies}
          relations={showLinks && selectedId ? selectedRelations : null}
          selectedId={selectedId}
          showCloseLabels={showCloseLabels}
          showValleyArea={valleyZoom}
          canZoomValley={mapCompanies.some(isInValley)}
          onZoomValley={zoomOnValley}
          onResetView={leaveSelection}
          onLocate={locateCompany}
          onClosePopup={() => setSelectedId(null)}
          onSelect={goToCompany}
        />
        {showLinks && (
          <CompanyLinks
            companies={companies}
            relations={selectedRelations}
            selectedId={selectedId}
          />
        )}
        <CompanyGrid companies={results} onSelect={locateCompanyById} />
      </div>

      <CompanySidebar
        companies={countryCompanies}
        country={country}
        selectedId={selectedId}
        onSelect={locateCompanyById}
      />
    </div>
  );
}

function describeResults(
  count: number,
  query: string,
  country: string | null,
): string {
  if (count === 0) {
    const where = country ? ` pour ce pays : ${country}` : "";
    return `Aucune entreprise ne correspond à « ${query} »${where}.`;
  }
  return `${count} ${count > 1 ? "entreprises trouvées" : "entreprise trouvée"}`;
}
