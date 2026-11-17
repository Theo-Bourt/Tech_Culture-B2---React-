import type { Company } from "../types";

export type Bounds = [[number, number], [number, number]];

// Vue de la carte à l'ouverture de la page, et celle que rétablit « Vue de départ »
export const START_CENTER: [number, number] = [0, 30];
export const START_ZOOM = 1;
export const WORLD_VIEW = { center: START_CENTER, zoom: START_ZOOM };

export const MOVE_DURATION = 1200;
export const FIT_PADDING = 70;
// Assez proche pour distinguer Santa Clara et Cupertino, voisines de quelques kilomètres
export const LOCATE_ZOOM = 10;
// Pour un pays à une seule entreprise : on voit le pays, pas seulement la ville
export const COUNTRY_MAX_ZOOM = 4;

// Le contour de la Silicon Valley, plus San Francisco au nord pour ses entreprises.
// Un cadrage plutôt qu'un zoom fixe : tout reste visible, même sur un écran étroit.
export const VALLEY_BOUNDS: Bounds = [
  [-122.5195, 36.8992],
  [-121.2154, 37.7897],
];
// Marges pour les noms, les boutons et les crédits de la carte
export const VALLEY_PADDING = { top: 56, bottom: 44, left: 70, right: 40 };
// Sur un écran étroit, la largeur limite le zoom : on réduit les marges latérales
// pour écarter les points, et la légende passe en haut
export const VALLEY_PADDING_NARROW = { top: 96, bottom: 44, left: 44, right: 10 };
export const NARROW_MAP_WIDTH = 500;

/** De San Francisco à Cupertino : là où les sièges sont trop voisins sans zoomer. */
export function isInValley(company: Company): boolean {
  const { lat, lng } = company.siege;
  return lat > 37.2 && lat < 37.9 && lng > -122.6 && lng < -121.8;
}

/** Le plus petit rectangle qui contient tous les sièges. */
export function boundsOf(companies: Company[]): Bounds {
  const longitudes = companies.map((company) => company.siege.lng);
  const latitudes = companies.map((company) => company.siege.lat);
  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ];
}
