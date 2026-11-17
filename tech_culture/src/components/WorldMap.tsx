import { RotateCcw, ZoomIn } from "lucide-react";
import { useMemo, useState, type Ref } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import {
  Map,
  MapGeoJSON,
  MapMarker,
  MapPopup,
  MapRoute,
  MarkerContent,
  MarkerLabel,
  MarkerTooltip,
} from "@/components/ui/map";
import siliconValley from "../data/siliconValley.json";
import { DIRECTION_COLORS, type LinkDirection } from "../lib/ecosystem";
import { START_CENTER, START_ZOOM } from "../lib/mapView";
import type { Company, CompanyRelation } from "../types";

interface WorldMapProps {
  companies: Company[];
  // Liens de l'entreprise sélectionnée, ou null s'il n'y a rien à tracer
  relations: CompanyRelation[] | null;
  // Affiche aussi le nom des sièges voisins, lisibles seulement une fois zoomé
  showCloseLabels: boolean;
  // Vrai si au moins une entreprise affichée se trouve dans la Silicon Valley
  canZoomValley: boolean;
  // Dessine le contour de la Silicon Valley
  showValleyArea: boolean;
  onZoomValley: () => void;
  onResetView: () => void;
  mapRef: Ref<MapLibreMap>;
  selectedId: string | null;
  onLocate: (company: Company) => void;
  onClosePopup: () => void;
  onSelect: (id: string) => void;
}

// Violet de la palette : à distinguer des couleurs de l'écosystème
const VALLEY_COLOR = "#6250d6";
const VALLEY_FILL = { "fill-color": VALLEY_COLOR, "fill-opacity": 0.08 };
const VALLEY_LINE = {
  "line-color": VALLEY_COLOR,
  "line-width": 2,
  "line-dasharray": [2, 1.5],
};
const CURVE_BEND = 0.2;
const CURVE_SAMPLES = 48;
// En degrés : plus près, les noms se chevauchent quand on n'a pas zoomé
const CROWDED_DISTANCE = 7;
// Côté du nom une fois zoomé sur la Silicon Valley : ces sièges sont si proches
// que leurs noms se chevaucheraient s'ils étaient tous au-dessus du point
const VALLEY_LABEL_SIDES: Record<string, "top" | "bottom" | "left" | "right"> = {
  anthropic: "top",
  salesforce: "right",
  openai: "left",
  meta: "top",
  broadcom: "left",
  alphabet: "right",
  google: "bottom",
  nvidia: "right",
  apple: "bottom",
};

/**
 * Courbe entre deux sièges, avec son milieu et son sens pour y poser une flèche.
 * Elle reste sur la carte affichée : Taïwan rejoint la Californie vers l'ouest,
 * sans sortir par le bord pour traverser le Pacifique.
 */
function curveBetween(from: [number, number], to: [number, number]) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const controlX = (from[0] + to[0]) / 2 - dy * CURVE_BEND;
  const controlY = (from[1] + to[1]) / 2 + dx * CURVE_BEND;

  const coordinates: [number, number][] = [];
  for (let step = 0; step <= CURVE_SAMPLES; step += 1) {
    const t = step / CURVE_SAMPLES;
    const rest = 1 - t;
    coordinates.push([
      rest * rest * from[0] + 2 * rest * t * controlX + t * t * to[0],
      rest * rest * from[1] + 2 * rest * t * controlY + t * t * to[1],
    ]);
  }

  const [longitude, latitude] = coordinates[CURVE_SAMPLES / 2];
  // La projection de la carte étire les latitudes loin de l'équateur
  const stretch = 1 / Math.cos((latitude * Math.PI) / 180);
  const angle = (Math.atan2(-dy * stretch, dx) * 180) / Math.PI;
  return { coordinates, longitude, latitude, angle };
}

export function WorldMap({
  companies,
  relations,
  showCloseLabels,
  showValleyArea,
  canZoomValley,
  onZoomValley,
  onResetView,
  mapRef,
  selectedId,
  onLocate,
  onClosePopup,
  onSelect,
}: WorldMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const selected = companies.find((company) => company.id === selectedId);

  const links = useMemo(
    () =>
      (relations ?? []).flatMap((relation) => {
        const source = companies.find((c) => c.id === relation.source);
        const target = companies.find((c) => c.id === relation.cible);
        if (!source || !target) return [];
        const direction: LinkDirection =
          relation.cible === selectedId ? "incoming" : "outgoing";
        return [
          {
            id: `${relation.source}-${relation.cible}`,
            direction,
            relation,
            sourceName: source.nom,
            targetName: target.nom,
            curve: curveBetween(
              [source.siege.lng, source.siege.lat],
              [target.siege.lng, target.siege.lat],
            ),
          },
        ];
      }),
    [relations, companies, selectedId],
  );
  const hovered = links.find((link) => link.id === hoveredId);
  const hasDirection = (direction: LinkDirection) =>
    links.some((link) => link.direction === direction);
  const linkedIds = new Set(
    (relations ?? []).flatMap((relation) => [relation.source, relation.cible]),
  );
  const isCrowded = (company: Company) =>
    companies.some(
      (other) =>
        other.id !== company.id &&
        linkedIds.has(other.id) &&
        Math.hypot(
          other.siege.lng - company.siege.lng,
          other.siege.lat - company.siege.lat,
        ) < CROWDED_DISTANCE,
    );

  return (
    <div className="world-map h-[420px] w-full overflow-hidden rounded-xl border">
      <Map
        ref={mapRef}
        center={START_CENTER}
        zoom={START_ZOOM}
        onViewportChange={(viewport) =>
          setIsAtStart(
            Math.abs(viewport.center[0] - START_CENTER[0]) < 0.5 &&
              Math.abs(viewport.center[1] - START_CENTER[1]) < 0.5 &&
              Math.abs(viewport.zoom - START_ZOOM) < 0.05,
          )
        }
      >
        {showValleyArea && (
          <MapGeoJSON
            id="silicon-valley"
            data={siliconValley as GeoJSON.Feature}
            fillPaint={VALLEY_FILL}
            linePaint={VALLEY_LINE}
          />
        )}
        {links.map((link) => (
          <MapRoute
            // Le sens fait partie de la clé : un même trait change de couleur selon
            // l'entreprise choisie, et il faut alors le redessiner
            key={`${link.id}-${link.direction}`}
            id={`company-link-${link.id}-${link.direction}`}
            coordinates={link.curve.coordinates}
            color={DIRECTION_COLORS[link.direction]}
            width={3}
            opacity={0.9}
            onMouseEnter={() => setHoveredId(link.id)}
            onMouseLeave={() => setHoveredId(null)}
          />
        ))}
        {links.map((link) => (
          <MapMarker
            key={link.id}
            longitude={link.curve.longitude}
            latitude={link.curve.latitude}
          >
            <MarkerContent>
              <svg
                className="world-map__arrow"
                data-link={link.id}
                width="14"
                height="14"
                viewBox="0 0 12 12"
                style={{ transform: `rotate(${link.curve.angle}deg)` }}
                aria-hidden="true"
              >
                <path
                  d="M 1 1 L 11 6 L 1 11 Z"
                  fill={DIRECTION_COLORS[link.direction]}
                />
              </svg>
            </MarkerContent>
          </MapMarker>
        ))}
        {companies.map((company) => {
          const isLinked = linkedIds.has(company.id);
          return (
            <MapMarker
              key={company.id}
              longitude={company.siege.lng}
              latitude={company.siege.lat}
              onClick={() => onLocate(company)}
            >
              <MarkerContent>
                <div
                  data-company={company.id}
                  className={`size-4 rounded-full border-2 border-white bg-blue-600 shadow-lg${
                    relations && !isLinked ? " opacity-30" : ""
                  }`}
                />
                {(showCloseLabels || (isLinked && !isCrowded(company))) && (
                  <MarkerLabel
                    className={`world-map__label world-map__label--${
                      (showCloseLabels && VALLEY_LABEL_SIDES[company.id]) || "top"
                    }`}
                  >
                    {company.nom}
                  </MarkerLabel>
                )}
              </MarkerContent>
              <MarkerTooltip>{company.nom}</MarkerTooltip>
            </MapMarker>
          );
        })}
        {selected && (
          <MapPopup
            key={selected.id}
            longitude={selected.siege.lng}
            latitude={selected.siege.lat}
            closeButton
            closeOnClick={false}
            onClose={onClosePopup}
          >
            <div className="space-y-2 p-1 pr-4">
              <strong>{selected.nom}</strong>
              <p>{selected.siege.ville}</p>
              <button
                type="button"
                className="text-blue-600 underline"
                onClick={() => onSelect(selected.id)}
              >
                Voir la fiche
              </button>
            </div>
          </MapPopup>
        )}
      </Map>
      <div className="world-map__actions">
        {canZoomValley && !showValleyArea && (
          <button type="button" className="world-map__zoom" onClick={onZoomValley}>
            <ZoomIn size={16} />
            <span>
              <span className="world-map__zoom-prefix">Zoomer sur la </span>
              Silicon Valley
            </span>
          </button>
        )}
        {(!isAtStart || selected) && (
          <button type="button" className="world-map__zoom" onClick={onResetView}>
            <RotateCcw size={16} />
            Vue de départ
          </button>
        )}
      </div>
      {(showValleyArea || (selected && links.length > 0)) && (
        <div className="world-map__legend" data-testid="ecosystem-legend">
          {showValleyArea && (
            <span className="world-map__legend-row">
              <span
                className="world-map__legend-line world-map__legend-line--dashed"
                style={{ borderColor: VALLEY_COLOR }}
              />
              Silicon Valley : comtés de San Mateo et de Santa Clara
            </span>
          )}
          {selected && hasDirection("incoming") && (
            <span className="world-map__legend-row">
              <span
                className="world-map__legend-line"
                style={{ background: DIRECTION_COLORS.incoming }}
              />
              Vers {selected.nom}
            </span>
          )}
          {selected && hasDirection("outgoing") && (
            <span className="world-map__legend-row">
              <span
                className="world-map__legend-line"
                style={{ background: DIRECTION_COLORS.outgoing }}
              />
              Depuis {selected.nom}
            </span>
          )}
        </div>
      )}
      {hovered && (
        <p className="world-map__caption">
          <strong>
            {hovered.sourceName} → {hovered.targetName}
          </strong>{" "}
          {hovered.relation.description}
        </p>
      )}
    </div>
  );
}
