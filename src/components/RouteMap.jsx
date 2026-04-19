import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import { getRoadWaypoints, CITY_COORDINATES } from "@/components/MadagascarCities";
import { Route, Clock, MapPin } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const makeIcon = (color, size = 14, glow = "") =>
  new L.DivIcon({
    html: `<div style="background:${color};width:${size}px;height:${size}px;border-radius:50%;border:3px solid white;box-shadow:0 2px 10px ${glow || color + "80"}"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });

const departureIcon = makeIcon("#D4A520", 16, "rgba(212,165,32,0.6)");
const destinationIcon = makeIcon("#1A1A1A", 16, "rgba(0,0,0,0.4)");
const driverIcon = makeIcon("#22c55e", 18, "rgba(34,197,94,0.7)");

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length >= 2) {
      map.fitBounds(L.latLngBounds(positions.map((p) => [p.lat, p.lng])), { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
}

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function totalRouteDistance(waypoints) {
  let dist = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    dist += haversineKm(waypoints[i].lat, waypoints[i].lng, waypoints[i + 1].lat, waypoints[i + 1].lng);
  }
  return Math.round(dist);
}

export default function RouteMap({
  departureCity,
  destinationCity,
  driverPosition = null,
  height = "320px",
  showInfo = true,
}) {
  const waypoints = getRoadWaypoints(departureCity, destinationCity);
  const depCoord = CITY_COORDINATES[departureCity];
  const destCoord = CITY_COORDINATES[destinationCity];

  if (!waypoints || !depCoord || !destCoord) {
    return (
      <div
        className="bg-gray-100 rounded-2xl flex items-center justify-center"
        style={{ height }}
      >
        <div className="text-center text-gray-400">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Itinéraire non disponible</p>
        </div>
      </div>
    );
  }

  const center = [
    waypoints.reduce((s, p) => s + p.lat, 0) / waypoints.length,
    waypoints.reduce((s, p) => s + p.lng, 0) / waypoints.length,
  ];
  const distanceKm = totalRouteDistance(waypoints);
  // Madagascar roads avg ~55 km/h
  const totalMin = Math.round((distanceKm / 55) * 60);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const timeStr = hours > 0 ? `${hours}h${mins > 0 ? mins + "min" : ""}` : `${mins}min`;

  const polylinePoints = waypoints.map((p) => [p.lat, p.lng]);
  const depLatLng = [depCoord.lat, depCoord.lng];
  const destLatLng = [destCoord.lat, destCoord.lng];

  return (
    <div className="space-y-3">
      {showInfo && (
        <div className="flex items-center gap-4 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl px-4 py-2.5 border border-gray-100">
          <div className="flex items-center gap-1.5">
            <Route className="w-4 h-4 text-[#D4A520]" />
            <span className="text-sm font-semibold text-gray-900">{distanceKm} km</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#D4A520]" />
            <span className="text-sm font-semibold text-gray-900">{timeStr}</span>
            <span className="text-xs text-gray-400">via RN</span>
          </div>
          {driverPosition && (
            <>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">Conducteur en direct</span>
              </div>
            </>
          )}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm" style={{ height }}>
        <MapContainer center={center} zoom={7} style={{ width: "100%", height: "100%" }} zoomControl={true}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='© <a href="https://carto.com/">CARTO</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            maxZoom={19}
          />
          <FitBounds positions={waypoints} />

          {/* Shadow / outline polyline */}
          <Polyline
            positions={polylinePoints}
            pathOptions={{ color: "#ffffff", weight: 8, opacity: 0.6, lineCap: "round", lineJoin: "round" }}
          />
          {/* Main route polyline */}
          <Polyline
            positions={polylinePoints}
            pathOptions={{ color: "#D4A520", weight: 4, opacity: 1, lineCap: "round", lineJoin: "round" }}
          />

          {/* Departure */}
          <Marker position={depLatLng} icon={departureIcon}>
            <Popup>
              <div className="font-semibold text-[#D4A520] text-sm">{departureCity}</div>
              <div className="text-xs text-gray-500">Départ</div>
            </Popup>
          </Marker>

          {/* Destination */}
          <Marker position={destLatLng} icon={destinationIcon}>
            <Popup>
              <div className="font-semibold text-gray-900 text-sm">{destinationCity}</div>
              <div className="text-xs text-gray-500">Destination</div>
            </Popup>
          </Marker>

          {/* Live driver */}
          {driverPosition && (
            <Marker position={[driverPosition.lat, driverPosition.lng]} icon={driverIcon}>
              <Popup>
                <div className="font-semibold text-green-700 text-sm">Conducteur</div>
                <div className="text-xs text-gray-500">Position en temps réel</div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}