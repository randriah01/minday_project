import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Star, Shield, Car, MapPin, Clock, CheckCircle, ArrowLeft, Phone, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { StarDisplay } from "@/components/StarRating";

export default function DriverProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const driverEmail = urlParams.get("email");
  const [driverUser, setDriverUser] = useState(null);

  useEffect(() => {
    if (driverEmail) {
      base44.entities.User.filter({ email: driverEmail }).then((res) => {
        if (res?.[0]) setDriverUser(res[0]);
      });
    }
  }, [driverEmail]);

  const { data: reviews = [] } = useQuery({
    queryKey: ["userReviews", driverEmail],
    queryFn: () => base44.entities.UserReview.filter({ reviewed_user_email: driverEmail }, "-created_date", 20),
    enabled: !!driverEmail,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ["driverTrips", driverEmail],
    queryFn: () => base44.entities.Trip.filter({ driver_email: driverEmail }, "-created_date", 10),
    enabled: !!driverEmail,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["driverVehicles", driverEmail],
    queryFn: () => base44.entities.Vehicle.filter({ driver_email: driverEmail }),
    enabled: !!driverEmail,
  });

  if (!driverUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-[#1A3C6E] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const completedTrips = trips.filter(t => t.status === "completed").length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
      <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

        {/* Driver Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0 overflow-hidden">
              {driverUser.photo_url
                ? <img src={driverUser.photo_url} alt="" className="w-full h-full object-cover" />
                : driverUser.full_name?.[0]?.toUpperCase() || "D"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">{driverUser.full_name}</h1>
              {driverUser.city && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" /> {driverUser.city}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="bg-[#1A3C6E]/10 text-[#1A3C6E] border-0">Conducteur</Badge>
                {driverUser.driver_status === "approved" && (
                  <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Vérifié
                  </Badge>
                )}
                {avgRating && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{avgRating}</span>
                    <span className="text-gray-400">({reviews.length} avis)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-50">
            <div className="text-center">
              <p className="text-xl font-bold text-[#1A3C6E]">{trips.length}</p>
              <p className="text-xs text-gray-500">Trajets</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#1A3C6E]">{reviews.length}</p>
              <p className="text-xs text-gray-500">Avis</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-[#1A3C6E]">{avgRating || "—"}</p>
              <p className="text-xs text-gray-500">Note / 5</p>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1A3C6E]" /> Vérification & confiance
          </h2>
          <div className="space-y-2">
            {[
              { label: "Permis de conduire", ok: !!driverUser.license_url },
              { label: "Assurance véhicule", ok: !!driverUser.insurance_url },
              { label: "Visite technique", ok: !!driverUser.technical_inspection_url },
              { label: "Profil approuvé", ok: driverUser.driver_status === "approved" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.ok ? "bg-green-100" : "bg-gray-100"}`}>
                  <CheckCircle className={`w-3.5 h-3.5 ${item.ok ? "text-green-600" : "text-gray-300"}`} />
                </div>
                <span className={item.ok ? "text-gray-800" : "text-gray-400"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        {driverUser.phone && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#1A3C6E]" /> Contact
            </h2>
            <a href={`tel:${driverUser.phone}`} className="flex items-center gap-3 text-sm text-[#1A3C6E] hover:underline font-medium">
              <Phone className="w-4 h-4" /> {driverUser.phone}
            </a>
          </div>
        )}

        {/* Bio */}
        {driverUser.bio && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">À propos</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{driverUser.bio}</p>
          </div>
        )}

        {/* Vehicles */}
        {vehicles.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Car className="w-4 h-4 text-[#1A3C6E]" /> Véhicule{vehicles.length > 1 ? "s" : ""}
            </h2>
            <div className="space-y-3">
              {vehicles.map((v) => (
                <div key={v.id} className="flex items-center gap-3">
                  {v.photo_url ? (
                    <img src={v.photo_url} alt="" className="w-14 h-10 rounded-xl object-cover" />
                  ) : (
                    <div className="w-14 h-10 rounded-xl bg-[#EEF4FF] flex items-center justify-center">
                      <Car className="w-5 h-5 text-[#1A3C6E]" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{v.brand} {v.model}</p>
                    <p className="text-xs text-gray-500">{v.plate_number} · {v.color} · {v.seats} places</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Trips */}
        {trips.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1A3C6E]" /> Trajets récents
            </h2>
            <div className="space-y-2">
              {trips.slice(0, 5).map((trip) => (
                <Link
                  key={trip.id}
                  to={createPageUrl("TripDetails") + `?id=${trip.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-1 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{trip.departure_city} → {trip.destination_city}</p>
                    <p className="text-xs text-gray-400">{trip.departure_date && format(new Date(trip.departure_date), "d MMM yyyy", { locale: fr })}</p>
                  </div>
                  <Badge className={
                    trip.status === "completed" ? "bg-green-100 text-green-700" :
                    trip.status === "active" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-600"
                  }>{trip.status}</Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Avis passagers ({reviews.length})</h2>
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">{r.reviewer_name}</span>
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}