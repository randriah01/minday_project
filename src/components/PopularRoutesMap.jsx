import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { getRoadWaypoints, CITY_COORDINATES } from "@/components/MadagascarCities";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { ArrowRight, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const POPULAR_ROUTES = [
  { from: "Antananarivo", to: "Toamasina",   color: "#D4A520", label: "RN2" },
  { from: "Antananarivo", to: "Antsirabe",   color: "#3B82F6", label: "RN7" },
  { from: "Antananarivo", to: "Fianarantsoa",color: "#10B981", label: "RN7" },
  { from: "Antananarivo", to: "Mahajanga",   color: "#8B5CF6", label: "RN4" },
  { from: "Antananarivo", to: "Toliara",     color: "#EF4444", label: "RN7" },
  { from: "Fianarantsoa", to: "Toliara",     color: "#F97316", label: "RN7" },
  { from: "Antsiranana",  to: "Ambanja",     color: "#06B6D4", label: "RN6" },
];

const makeIcon = (color) =>
  new L.DivIcon({
    html: `<div style="background:${color};width:10px;height:10px;border-radius:50%;border:2px solid white;box-shadow:0 1px 6px ${color}80"></div>`,
    className: "",
    iconSize: [10, 10],
    iconAnchor: [5, 5],
  });

// Collect unique cities
const ALL_CITIES = [...new Set(POPULAR_ROUTES.flatMap((r) => [r.from, r.to]))];

function FitMadagascar() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([[-25.5, 43.0], [-11.5, 50.5]], { padding: [16, 16] });
  }, [map]);
  return null;
}

export default function PopularRoutesMap() {
  const [activeRoute, setActiveRoute] = useState(null);

  return (
    <div className="relative">
      {/* Map */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md" style={{ height: "420px" }}>
        <MapContainer
          center={[-18.5, 46.8]}
          zoom={6}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='© <a href="https://carto.com/">CARTO</a>'
            maxZoom={19}
          />
          <FitMadagascar />

          {POPULAR_ROUTES.map((route, i) => {
            const wp = getRoadWaypoints(route.from, route.to);
            if (!wp) return null;
            const pts = wp.map((p) => [p.lat, p.lng]);
            const isActive = activeRoute === i;
            return (
              <React.Fragment key={i}>
                {/* White outline */}
                <Polyline
                  positions={pts}
                  pathOptions={{ color: "#fff", weight: isActive ? 8 : 5, opacity: 0.7, lineCap: "round", lineJoin: "round" }}
                  eventHandlers={{ click: () => setActiveRoute(i === activeRoute ? null : i) }}
                />
                {/* Colored route */}
                <Polyline
                  positions={pts}
                  pathOptions={{ color: route.color, weight: isActive ? 5 : 3, opacity: isActive ? 1 : 0.75, lineCap: "round", lineJoin: "round" }}
                  eventHandlers={{ click: () => setActiveRoute(i === activeRoute ? null : i) }}
                >
                  <Popup>
                    <div className="text-sm font-semibold" style={{ color: route.color }}>{route.label}</div>
                    <div className="font-medium text-gray-900">{route.from} → {route.to}</div>
                    <Link
                      to={createPageUrl("SearchTrips") + `?from=${route.from}&to=${route.to}`}
                      className="text-xs text-[#D4A520] hover:underline mt-1 block"
                    >
                      Voir les trajets →
                    </Link>
                  </Popup>
                </Polyline>
              </React.Fragment>
            );
          })}

          {/* City dots */}
          {ALL_CITIES.map((city) => {
            const coord = CITY_COORDINATES[city];
            if (!coord) return null;
            const routeIdx = POPULAR_ROUTES.findIndex((r) => r.from === city || r.to === city);
            const color = routeIdx >= 0 ? POPULAR_ROUTES[routeIdx].color : "#D4A520";
            return (
              <Marker key={city} position={[coord.lat, coord.lng]} icon={makeIcon(color)}>
                <Popup>
                  <div className="font-semibold text-gray-900 text-sm">{city}</div>
                  <Link
                    to={createPageUrl("SearchTrips") + `?from=${city}`}
                    className="text-xs text-[#D4A520] hover:underline"
                  >
                    Trajets depuis {city} →
                  </Link>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Route legend */}
      <div className="mt-3 flex flex-wrap gap-2">
        {POPULAR_ROUTES.map((route, i) => (
          <Link
            key={i}
            to={createPageUrl("SearchTrips") + `?from=${route.from}&to=${route.to}`}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:shadow-md ${
              activeRoute === i ? "shadow-md scale-105" : ""
            }`}
            style={{
              borderColor: route.color + "40",
              backgroundColor: route.color + "10",
              color: route.color,
            }}
            onMouseEnter={() => setActiveRoute(i)}
            onMouseLeave={() => setActiveRoute(null)}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: route.color }}
            />
            {route.from} <ArrowRight className="w-3 h-3" /> {route.to}
            <span className="opacity-60 text-[10px]">{route.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}