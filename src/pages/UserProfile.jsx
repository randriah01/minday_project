import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  Star, Shield, Car, MapPin, Clock, CheckCircle, ArrowLeft,
  Phone, Package, Calendar, MessageCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { StarDisplay } from "@/components/StarRating";
import LeaveReviewModal from "@/components/LeaveReviewModal";

export default function UserProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("id");
  const userEmail = urlParams.get("email");

  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (userId) {
      base44.entities.User.filter({ id: userId }).then((res) => { if (res?.[0]) setProfileUser(res[0]); });
    } else if (userEmail) {
      base44.entities.User.filter({ email: userEmail }).then((res) => { if (res?.[0]) setProfileUser(res[0]); });
    }
  }, [userId, userEmail]);

  const { data: reviews = [] } = useQuery({
    queryKey: ["userReviews", profileUser?.email],
    queryFn: () => base44.entities.UserReview.filter({ reviewed_user_email: profileUser.email }, "-created_date", 50),
    enabled: !!profileUser?.email,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ["userTrips", profileUser?.email],
    queryFn: () => base44.entities.Trip.filter({ driver_email: profileUser.email }, "-created_date", 10),
    enabled: !!profileUser?.email,
  });

  const { data: parcels = [] } = useQuery({
    queryKey: ["userParcels", profileUser?.email],
    queryFn: () => base44.entities.ParcelTransport.filter({ user_email: profileUser.email }, "-created_date", 10),
    enabled: !!profileUser?.email,
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ["userVehicles", profileUser?.email],
    queryFn: () => base44.entities.Vehicle.filter({ driver_email: profileUser.email }),
    enabled: !!profileUser?.email,
  });

  if (!profileUser) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-2 border-[#1A3C6E] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : null;

  const isOwnProfile = currentUser?.email === profileUser.email;
  const alreadyReviewed = reviews.some(r => r.reviewer_email === currentUser?.email);
  const canReview = currentUser && !isOwnProfile && !alreadyReviewed;

  const TABS = [
    { id: "reviews", label: `Avis (${reviews.length})` },
    { id: "trips", label: `Trajets (${trips.length})` },
    { id: "parcels", label: `Colis (${parcels.length})` },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <button onClick={() => window.history.back()} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Top banner */}
          <div className="h-24 bg-gradient-to-r from-[#1A3C6E] to-[#2B5BA8]" />
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] border-4 border-white flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-lg">
                {profileUser.photo_url
                  ? <img src={profileUser.photo_url} alt="" className="w-full h-full object-cover" />
                  : profileUser.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              {canReview && (
                <button
                  onClick={() => setReviewModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1A3C6E] text-white rounded-xl text-sm font-semibold hover:bg-[#2B5BA8] transition-colors shadow-sm"
                >
                  <Star className="w-4 h-4" /> Laisser un avis
                </button>
              )}
              {alreadyReviewed && (
                <span className="text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-xl flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Avis déposé
                </span>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900">{profileUser.full_name}</h1>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {profileUser.city && (
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {profileUser.city}
                </span>
              )}
              {profileUser.created_date && (
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Membre depuis {format(new Date(profileUser.created_date), "MMMM yyyy", { locale: fr })}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className="bg-[#1A3C6E]/10 text-[#1A3C6E] border-0">
                {profileUser.role === "driver" ? "🚗 Conducteur" : profileUser.role === "admin" ? "⚙️ Admin" : "👤 Utilisateur"}
              </Badge>
              {profileUser.driver_status === "approved" && (
                <Badge className="bg-green-100 text-green-700 border-0 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Vérifié
                </Badge>
              )}
            </div>

            {/* Rating bar */}
            {avgRating && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                <div className="text-3xl font-bold text-amber-500">{avgRating.toFixed(1)}</div>
                <div>
                  <StarDisplay rating={avgRating} size="md" />
                  <p className="text-xs text-gray-500 mt-0.5">{reviews.length} avis</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Trajets", value: trips.length, icon: Car },
            { label: "Colis", value: parcels.length, icon: Package },
            { label: "Avis", value: reviews.length, icon: Star },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <s.icon className="w-5 h-5 text-[#1A3C6E] mx-auto mb-1.5" />
              <p className="text-xl font-bold text-[#1A3C6E]">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Trust */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1A3C6E]" /> Vérification & confiance
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Permis de conduire", ok: !!profileUser.license_url },
              { label: "Assurance", ok: !!profileUser.insurance_url },
              { label: "Profil approuvé", ok: profileUser.driver_status === "approved" },
              { label: "Téléphone renseigné", ok: !!profileUser.phone },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.ok ? "bg-green-100" : "bg-gray-100"}`}>
                  <CheckCircle className={`w-3.5 h-3.5 ${item.ok ? "text-green-600" : "text-gray-300"}`} />
                </div>
                <span className={item.ok ? "text-gray-800" : "text-gray-400 text-xs"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        {(profileUser.phone || profileUser.bio) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            {profileUser.bio && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-1">À propos</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{profileUser.bio}</p>
              </div>
            )}
            {profileUser.phone && (
              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-[#1A3C6E]" /> Contact
                </h2>
                <a href={`tel:${profileUser.phone}`} className="text-sm text-[#1A3C6E] hover:underline font-medium">
                  {profileUser.phone}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-[#1A3C6E] border-b-2 border-[#1A3C6E]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Aucun avis pour le moment</p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                            {r.reviewer_name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <span className="text-sm font-medium text-gray-800">{r.reviewer_name || "Anonyme"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <StarDisplay rating={r.rating} size="sm" />
                          {r.created_date && (
                            <span className="text-xs text-gray-400">
                              {format(new Date(r.created_date), "d MMM yyyy", { locale: fr })}
                            </span>
                          )}
                        </div>
                      </div>
                      {r.comment && <p className="text-sm text-gray-600 ml-9">{r.comment}</p>}
                      {r.context && (
                        <span className="ml-9 inline-block mt-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                          {r.context === "carpooling" ? "🚗 Covoiturage" : "📦 Colis"}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Trips Tab */}
            {activeTab === "trips" && (
              <div className="space-y-2">
                {trips.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Aucun trajet publié</p>
                ) : (
                  trips.map((trip) => (
                    <Link
                      key={trip.id}
                      to={createPageUrl("TripDetails") + `?id=${trip.id}`}
                      className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 rounded-lg px-2 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-[#1A3C6E] shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{trip.departure_city} → {trip.destination_city}</p>
                          <p className="text-xs text-gray-400">{trip.departure_date && format(new Date(trip.departure_date), "d MMM yyyy", { locale: fr })}</p>
                        </div>
                      </div>
                      <Badge className={
                        trip.status === "completed" ? "bg-green-100 text-green-700" :
                        trip.status === "active" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-600"
                      }>{trip.status}</Badge>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Parcels Tab */}
            {activeTab === "parcels" && (
              <div className="space-y-2">
                {parcels.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-6">Aucune annonce colis</p>
                ) : (
                  parcels.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-[#1A3C6E] shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.departure_location} → {p.destination_location}</p>
                          <p className="text-xs text-gray-400">{p.available_weight_kg} kg · {p.price_per_kg} {p.currency}/kg</p>
                        </div>
                      </div>
                      <Badge className={p.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}>
                        {p.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

      </motion.div>

      {/* Review Modal */}
      <LeaveReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        reviewer={currentUser}
        reviewedUser={profileUser}
        context="carpooling"
      />
    </div>
  );
}