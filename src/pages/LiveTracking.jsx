import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import RouteMap from "@/components/RouteMap";
import {
  ArrowLeft, Navigation, Shield, AlertCircle, CheckCircle,
  MapPin, Clock, Wifi, WifiOff, Car
} from "lucide-react";
import { motion } from "framer-motion";

export default function LiveTracking() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("trip");
  const [user, setUser] = useState(null);
  const [driverPosition, setDriverPosition] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [isDriver, setIsDriver] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
    }).catch(() => base44.auth.redirectToLogin());
    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const { data: trip } = useQuery({
    queryKey: ["trackingTrip", tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: tripId });
      return trips[0];
    },
    enabled: !!tripId,
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (user && trip) {
      setIsDriver(user.email === trip.driver_email);
    }
  }, [user, trip]);

  // Subscribe to real-time location updates via entity subscription
  useEffect(() => {
    if (!tripId || !consentGiven) return;

    const unsubscribe = base44.entities.Trip.subscribe((event) => {
      if (event.id === tripId && event.data?.driver_lat && event.data?.driver_lng) {
        setDriverPosition({ lat: event.data.driver_lat, lng: event.data.driver_lng });
        setWsConnected(true);
      }
    });

    return () => unsubscribe();
  }, [tripId, consentGiven]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
      return;
    }
    setTracking(true);
    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setDriverPosition({ lat, lng });
        // Save to trip entity for real-time broadcast
        if (trip?.id) {
          await base44.entities.Trip.update(trip.id, {
            driver_lat: lat,
            driver_lng: lng,
          });
        }
      },
      (err) => {
        console.error(err);
        setTracking(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setTracking(false);
    // Clear driver position from trip
    if (trip?.id) {
      base44.entities.Trip.update(trip.id, { driver_lat: null, driver_lng: null });
    }
  };

  if (!user || !trip) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#D4A520] border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    );
  }

  if (!consentGiven) {
    return (
      <div className="max-w-lg mx-auto px-4 py-10">
        <Link to={createPageUrl("TripDetails") + `?id=${tripId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#D4A520]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Navigation className="w-8 h-8 text-[#D4A520]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Suivi GPS en temps réel</h2>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            {isDriver
              ? "Activez le suivi GPS pour que vos passagers puissent suivre votre position en temps réel. Votre localisation sera partagée uniquement pendant ce trajet."
              : "Suivez la position du conducteur en temps réel pour votre sécurité. La localisation est partagée uniquement pendant le trajet actif."}
          </p>
          <div className="space-y-2 text-left mb-6">
            {[
              "Données chiffrées et sécurisées",
              "Suivi arrêté automatiquement à la fin du trajet",
              "Accès limité aux passagers et admin",
              "Consentement requis de toutes les parties",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setConsentGiven(true)}
              className="w-full bg-[#D4A520] hover:bg-[#B8891A] text-white font-semibold py-3.5 rounded-xl transition-all text-sm"
            >
              J'accepte et je continue
            </button>
            <Link
              to={createPageUrl("TripDetails") + `?id=${tripId}`}
              className="block w-full text-center py-3 text-sm text-gray-500 hover:text-gray-700"
            >
              Annuler
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <Link to={createPageUrl("TripDetails") + `?id=${tripId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour au trajet
      </Link>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Suivi en direct</h1>
          <p className="text-sm text-gray-500">{trip.departure_city} → {trip.destination_city}</p>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full ${driverPosition ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
          {driverPosition ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {driverPosition ? "En direct" : "En attente"}
        </div>
      </div>

      {/* Map */}
      <div className="mb-4">
        <RouteMap
          departureCity={trip.departure_city}
          destinationCity={trip.destination_city}
          driverPosition={driverPosition}
          height="400px"
        />
      </div>

      {/* Driver controls */}
      {isDriver && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Car className="w-4 h-4 text-[#D4A520]" /> Contrôles conducteur
          </h3>
          {!tracking ? (
            <button
              onClick={startTracking}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
            >
              <Navigation className="w-4 h-4" /> Démarrer le partage de position
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl px-4 py-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Partage GPS actif — vos passagers peuvent vous suivre
              </div>
              <button
                onClick={stopTracking}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl transition-all text-sm"
              >
                Arrêter le partage de position
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Passenger view */}
      {!isDriver && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-[#D4A520]" />
            <span className="font-medium text-gray-900">Suivi sécurisé</span>
          </div>
          {!driverPosition ? (
            <p className="text-sm text-gray-500 mt-2">
              En attente que le conducteur active le partage GPS...
            </p>
          ) : (
            <p className="text-sm text-green-700 mt-2">
              Le conducteur partage sa position en temps réel.
            </p>
          )}
        </div>
      )}

      {/* Safety notice */}
      <div className="mt-3 flex items-start gap-2 text-xs text-gray-400">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
        En cas d'urgence, contactez les autorités locales. Le partage s'arrête automatiquement à la fin du trajet.
      </div>
    </div>
  );
}