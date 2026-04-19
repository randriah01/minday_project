export const MADAGASCAR_CITIES = [
  "Antananarivo",
  "Toamasina",
  "Antsirabe",
  "Fianarantsoa",
  "Mahajanga",
  "Toliara",
  "Antsiranana",
  "Ambanja",
  "Ambatondrazaka",
  "Ambilobe",
  "Ambositra",
  "Amparafaravola",
  "Analalava",
  "Andapa",
  "Anjozorobe",
  "Ankazobe",
  "Antsirabe II",
  "Arivonimamo",
  "Bekily",
  "Belo sur Tsiribihina",
  "Betafo",
  "Fandriana",
  "Farafangana",
  "Fénérive Est",
  "Ihosy",
  "Ilakaka",
  "Maintirano",
  "Manakara",
  "Mananjary",
  "Maroantsetra",
  "Miandrivazo",
  "Moramanga",
  "Morombe",
  "Morondava",
  "Nosy Be",
  "Sainte-Marie",
  "Sambava",
  "Tsiroanomandidy",
  "Vangaindrano",
  "Vatomandry",
  "Vohemar",
  "Manjakandriana",
  "Miarinarivo"
];

export const CITY_COORDINATES = {
  "Antananarivo":    { lat: -18.8792, lng: 47.5079 },
  "Toamasina":       { lat: -18.1443, lng: 49.3958 },
  "Antsirabe":       { lat: -19.8659, lng: 47.0333 },
  "Fianarantsoa":    { lat: -21.4416, lng: 47.0856 },
  "Mahajanga":       { lat: -15.7167, lng: 46.3167 },
  "Toliara":         { lat: -23.3500, lng: 43.6667 },
  "Antsiranana":     { lat: -12.2795, lng: 49.2913 },
  "Morondava":       { lat: -20.2833, lng: 44.2833 },
  "Nosy Be":         { lat: -13.3333, lng: 48.2667 },
  "Sambava":         { lat: -14.2667, lng: 50.1667 },
  "Manakara":        { lat: -22.1333, lng: 48.0167 },
  "Moramanga":       { lat: -18.9333, lng: 48.2333 },
  "Ambanja":         { lat: -13.6833, lng: 48.4500 },
  "Maroantsetra":    { lat: -15.4333, lng: 49.7333 },
  "Farafangana":     { lat: -22.8167, lng: 47.8333 },
  "Ihosy":           { lat: -22.4000, lng: 46.1167 },
  "Ambatondrazaka":  { lat: -17.8333, lng: 48.4167 },
  "Ambilobe":        { lat: -13.1833, lng: 49.0500 },
  "Ambositra":       { lat: -20.5167, lng: 47.2500 },
  "Analalava":       { lat: -14.6333, lng: 47.7667 },
  "Andapa":          { lat: -14.6500, lng: 49.6500 },
  "Anjozorobe":      { lat: -18.4000, lng: 47.8667 },
  "Ankazobe":        { lat: -18.3167, lng: 47.1167 },
  "Arivonimamo":     { lat: -19.0167, lng: 47.1833 },
  "Fandriana":       { lat: -20.2333, lng: 47.3667 },
  "Ihosy":           { lat: -22.4000, lng: 46.1167 },
  "Ilakaka":         { lat: -22.5167, lng: 45.0667 },
  "Maintirano":      { lat: -18.0500, lng: 44.0333 },
  "Mananjary":       { lat: -21.2333, lng: 48.3500 },
  "Miandrivazo":     { lat: -19.5167, lng: 45.4500 },
  "Morombe":         { lat: -21.7500, lng: 43.3667 },
  "Sainte-Marie":    { lat: -17.0000, lng: 49.8500 },
  "Tsiroanomandidy": { lat: -18.7667, lng: 46.0500 },
  "Vangaindrano":    { lat: -23.3500, lng: 47.6000 },
  "Vatomandry":      { lat: -19.3333, lng: 48.9833 },
  "Vohemar":         { lat: -13.3667, lng: 50.0000 },
  "Manjakandriana":  { lat: -18.9167, lng: 47.7833 },
  "Miarinarivo":     { lat: -19.0000, lng: 46.7333 },
  "Amparafaravola":  { lat: -17.5500, lng: 48.2167 },
  "Bekily":          { lat: -24.2333, lng: 45.3333 },
  "Belo sur Tsiribihina": { lat: -19.6833, lng: 44.5333 },
  "Betafo":          { lat: -19.8333, lng: 46.8500 },
};

/**
 * National Road network — intermediate waypoints along Madagascar's RN routes.
 * These allow us to draw realistic road-following polylines without an external routing API.
 */
export const RN_WAYPOINTS = {
  // RN2: Antananarivo → Toamasina (Route nationale principale)
  "Antananarivo|Toamasina": [
    { lat: -18.8792, lng: 47.5079 }, // Tana
    { lat: -18.9333, lng: 47.7833 }, // Manjakandriana
    { lat: -18.9333, lng: 48.2333 }, // Moramanga
    { lat: -18.8000, lng: 48.6000 }, // Brickaville area
    { lat: -18.1443, lng: 49.3958 }, // Toamasina
  ],
  // RN7: Antananarivo → Antsirabe → Ambositra → Fianarantsoa → Ihosy → Toliara
  "Antananarivo|Antsirabe": [
    { lat: -18.8792, lng: 47.5079 },
    { lat: -19.0167, lng: 47.1833 }, // Arivonimamo
    { lat: -19.8659, lng: 47.0333 }, // Antsirabe
  ],
  "Antananarivo|Fianarantsoa": [
    { lat: -18.8792, lng: 47.5079 },
    { lat: -19.0167, lng: 47.1833 },
    { lat: -19.8659, lng: 47.0333 }, // Antsirabe
    { lat: -20.5167, lng: 47.2500 }, // Ambositra
    { lat: -21.4416, lng: 47.0856 }, // Fianarantsoa
  ],
  "Antananarivo|Toliara": [
    { lat: -18.8792, lng: 47.5079 },
    { lat: -19.0167, lng: 47.1833 },
    { lat: -19.8659, lng: 47.0333 },
    { lat: -20.5167, lng: 47.2500 },
    { lat: -21.4416, lng: 47.0856 },
    { lat: -22.4000, lng: 46.1167 }, // Ihosy
    { lat: -22.5167, lng: 45.0667 }, // Ilakaka
    { lat: -23.3500, lng: 43.6667 }, // Toliara
  ],
  "Antsirabe|Fianarantsoa": [
    { lat: -19.8659, lng: 47.0333 },
    { lat: -20.2333, lng: 47.3667 }, // Fandriana
    { lat: -20.5167, lng: 47.2500 }, // Ambositra
    { lat: -21.4416, lng: 47.0856 },
  ],
  "Fianarantsoa|Toliara": [
    { lat: -21.4416, lng: 47.0856 },
    { lat: -22.4000, lng: 46.1167 }, // Ihosy
    { lat: -22.5167, lng: 45.0667 }, // Ilakaka
    { lat: -23.3500, lng: 43.6667 },
  ],
  // RN4: Antananarivo → Mahajanga
  "Antananarivo|Mahajanga": [
    { lat: -18.8792, lng: 47.5079 },
    { lat: -18.3167, lng: 47.1167 }, // Ankazobe
    { lat: -18.7667, lng: 46.0500 }, // Tsiroanomandidy
    { lat: -17.5000, lng: 46.5000 }, // Mid RN4
    { lat: -15.7167, lng: 46.3167 }, // Mahajanga
  ],
  // RN6: Antsiranana → Ambanja → Mahajanga area
  "Antsiranana|Ambanja": [
    { lat: -12.2795, lng: 49.2913 },
    { lat: -12.8000, lng: 49.2000 },
    { lat: -13.1833, lng: 49.0500 }, // Ambilobe
    { lat: -13.6833, lng: 48.4500 }, // Ambanja
  ],
  "Antsiranana|Mahajanga": [
    { lat: -12.2795, lng: 49.2913 },
    { lat: -13.1833, lng: 49.0500 },
    { lat: -13.6833, lng: 48.4500 },
    { lat: -14.6333, lng: 47.7667 }, // Analalava
    { lat: -15.7167, lng: 46.3167 },
  ],
  // RN5: Toamasina → Fénérive Est → Sambava → Antsiranana (côte est)
  "Toamasina|Sambava": [
    { lat: -18.1443, lng: 49.3958 },
    { lat: -17.8333, lng: 49.4000 },
    { lat: -15.4333, lng: 49.7333 }, // Maroantsetra area
    { lat: -14.2667, lng: 50.1667 }, // Sambava
  ],
};

/**
 * Returns road waypoints for a city pair, or falls back to straight line.
 */
export function getRoadWaypoints(from, to) {
  const key1 = `${from}|${to}`;
  const key2 = `${to}|${from}`;
  if (RN_WAYPOINTS[key1]) return RN_WAYPOINTS[key1];
  if (RN_WAYPOINTS[key2]) return [...RN_WAYPOINTS[key2]].reverse();
  // Fallback: straight line with coords
  const fromCoord = CITY_COORDINATES[from];
  const toCoord = CITY_COORDINATES[to];
  if (!fromCoord || !toCoord) return null;
  return [fromCoord, toCoord];
}

export default MADAGASCAR_CITIES;