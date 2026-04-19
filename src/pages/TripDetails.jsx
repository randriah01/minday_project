import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import {
  Clock, Users, Star, ArrowLeft, Car,
  Phone, Calendar, CheckCircle, Upload, Radio, Shield, Info
} from "lucide-react";
import RouteMap from "@/components/RouteMap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

export default function TripDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("id");
  const [user, setUser] = useState(null);
  const [seats, setSeats] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [booking, setBooking] = useState(false);
  const [transactionProof, setTransactionProof] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [driverUser, setDriverUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", tripId],
    queryFn: async () => {
      const trips = await base44.entities.Trip.filter({ id: tripId });
      return trips[0];
    },
    enabled: !!tripId,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["platformSettings"],
    queryFn: () => base44.entities.PlatformSettings.list(),
  });
  const platformSettings = settings[0] || { commission_percentage: 10, commission_enabled: true };

  useEffect(() => {
    if (trip?.driver_email) {
      base44.entities.User.filter({ email: trip.driver_email }).then((res) => {
        if (res?.[0]) setDriverUser(res[0]);
      }).catch(() => {});
    }
  }, [trip?.driver_email]);

  const { data: reviews = [] } = useQuery({
    queryKey: ["userReviews", trip?.driver_email],
    queryFn: () => base44.entities.UserReview.filter({ reviewed_user_email: trip.driver_email }, "-created_date", 10),
    enabled: !!trip?.driver_email,
  });

  const bookMutation = useMutation({
    mutationFn: async () => {
      const seatsNum = parseInt(seats);
      const totalPrice = seatsNum * trip.price_per_seat;
      const bookingData = {
        trip_id: trip.id,
        passenger_email: user.email,
        passenger_name: user.full_name,
        driver_email: trip.driver_email,
        seats_reserved: seatsNum,
        total_price: totalPrice,
        payment_method: paymentMethod,
        payment_status: "pending",
        booking_status: "pending",
        trip_departure_city: trip.departure_city,
        trip_destination_city: trip.destination_city,
        trip_departure_date: trip.departure_date,
        trip_departure_time: trip.departure_time,
      };
      if (transactionProof) bookingData.transaction_reference = transactionProof;
      await base44.entities.Booking.create(bookingData);
      await base44.entities.Trip.update(trip.id, {
        available_seats: trip.available_seats - seatsNum,
        status: trip.available_seats - seatsNum <= 0 ? "full" : "active",
      });
      await base44.entities.Notification.create({
        user_email: trip.driver_email,
        title: "Nouvelle réservation",
        message: `${user.full_name} a réservé ${seatsNum} place(s) pour ${trip.departure_city} → ${trip.destination_city}`,
        type: "booking",
      });
    },
    onSuccess: () => {
      setBooking(true);
      queryClient.invalidateQueries(["trip", tripId]);
    },
  });

  const formatPrice = (price) => new Intl.NumberFormat("fr-MG").format(price) + " Ar";

  const seatsNum = parseInt(seats);
  const subtotal = seatsNum * (trip?.price_per_seat || 0);
  const commissionAmount = platformSettings.commission_enabled
    ? Math.round(subtotal * platformSettings.commission_percentage / 100)
    : 0;
  const totalWithFee = subtotal + commissionAmount;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-40 bg-gray-100 rounded-2xl" />
              <div className="h-48 bg-gray-100 rounded-2xl" />
            </div>
            <div className="h-64 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Trajet introuvable</h2>
        <Link to={createPageUrl("SearchTrips")} className="text-[#1A3C6E] hover:underline text-sm">
          Retour à la recherche
        </Link>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="bg-[#F4F7FB] min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <Link to={createPageUrl("SearchTrips")} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour aux résultats
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Détails du trajet</h1>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-4">

            {/* Route Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-stretch gap-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="w-3 h-3 rounded-full border-2 border-[#1A3C6E]" />
                  <div className="flex-1 w-px bg-gray-300 min-h-[40px]" />
                  <div className="w-3 h-3 rounded-full bg-[#1A3C6E]" />
                </div>
                <div className="flex-1">
                  <div className="mb-4">
                    <p className="text-xl font-bold text-gray-900">{trip.departure_city}</p>
                    {trip.departure_time && (
                      <p className="text-sm text-gray-500 mt-0.5">{trip.departure_time} · {trip.departure_date && format(new Date(trip.departure_date), "EEEE d MMMM yyyy", { locale: fr })}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{trip.destination_city}</p>
                  </div>
                </div>
              </div>

              {trip.notes && (
                <div className="mt-4 flex items-start gap-2 text-sm text-gray-600 bg-blue-50 rounded-xl p-3">
                  <Info className="w-4 h-4 text-[#1A3C6E] shrink-0 mt-0.5" />
                  {trip.notes}
                </div>
              )}
            </div>

            {/* Map */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700">Itinéraire sur carte</h3>
                <Link to={createPageUrl("LiveTracking") + `?trip=${trip.id}`} className="flex items-center gap-1.5 text-xs text-[#1A3C6E] font-medium hover:underline">
                  <Radio className="w-3.5 h-3.5" /> Suivi en direct
                </Link>
              </div>
              <RouteMap
                departureCity={trip.departure_city}
                destinationCity={trip.destination_city}
                driverPosition={trip.driver_lat && trip.driver_lng ? { lat: trip.driver_lat, lng: trip.driver_lng } : null}
                height="220px"
              />
            </div>

            {/* Driver Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] flex items-center justify-center text-white text-xl font-bold overflow-hidden">
                    {driverUser?.photo_url
                      ? <img src={driverUser.photo_url} alt="" className="w-full h-full object-cover" />
                      : trip.driver_name?.[0]?.toUpperCase() || "D"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">{trip.driver_name || "Conducteur"}</p>
                    {avgRating && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold text-gray-700">{avgRating}/5</span>
                        <span className="text-xs text-gray-400">· {reviews.length} avis</span>
                      </div>
                    )}
                  </div>
                </div>
                <Link
                to={createPageUrl("UserProfile") + `?email=${trip.driver_email}`}
                className="text-xs text-[#1A3C6E] font-medium border border-[#1A3C6E]/20 px-3 py-1.5 rounded-xl hover:bg-[#EEF4FF] transition-colors"
                >
                Voir profil
                </Link>
              </div>

              <div className="space-y-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-[#1A3C6E]" />
                  <span>{driverUser?.driver_status === "approved" ? "Conducteur vérifié ✓" : "Profil vérifié"}</span>
                </div>
                {driverUser?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-[#1A3C6E]" />
                    <a href={`tel:${driverUser.phone}`} className="text-[#1A3C6E] font-medium hover:underline">{driverUser.phone}</a>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-[#1A3C6E]" />
                  <span>Max. {trip.available_seats} place{trip.available_seats > 1 ? "s" : ""} disponible{trip.available_seats > 1 ? "s" : ""}</span>
                </div>
                {trip.vehicle_info && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Car className="w-4 h-4 text-[#1A3C6E]" />
                    <span>{trip.vehicle_info}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Avis sur le conducteur</h3>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">{review.reviewer_name}</span>
                      </div>
                      {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Booking */}
          <div className="space-y-4">
            {/* Summary card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <p className="text-sm font-semibold text-gray-500 mb-3">
                Aller · {trip.departure_date && format(new Date(trip.departure_date), "EEEE d MMMM", { locale: fr })}
              </p>

              {/* Route mini */}
              <div className="flex items-stretch gap-3 mb-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="w-2 h-2 rounded-full border-2 border-[#1A3C6E]" />
                  <div className="flex-1 w-px bg-gray-200 min-h-[28px]" />
                  <div className="w-2 h-2 rounded-full bg-[#1A3C6E]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{trip.departure_city}</p>
                  <p className="text-xs text-gray-400 my-1">{trip.departure_time}</p>
                  <p className="text-sm font-semibold text-gray-900">{trip.destination_city}</p>
                </div>
              </div>

              {/* Driver mini */}
              <div className="flex items-center gap-2 pb-4 mb-4 border-b border-gray-50">
                <Car className="w-4 h-4 text-gray-400" />
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] flex items-center justify-center text-white text-xs font-bold">
                  {trip.driver_name?.[0]?.toUpperCase() || "D"}
                </div>
                <span className="text-sm font-medium text-gray-700">{trip.driver_name || "Conducteur"}</span>
                {avgRating && <span className="text-xs text-gray-400 ml-auto">★ {avgRating}</span>}
              </div>

              {booking ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-800 mb-1">Réservation envoyée !</h3>
                  <p className="text-xs text-green-600 mb-4">Le conducteur va confirmer votre réservation.</p>
                  <Link to={createPageUrl("MyTrips")} className="block text-center bg-[#1A3C6E] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#2B5BA8] transition-colors">
                    Voir mes réservations
                  </Link>
                </div>
              ) : user && trip.driver_email !== user.email && trip.available_seats > 0 && trip.status === "active" ? (
                <>
                  {/* Seat selector */}
                  <div className="mb-3">
                    <label className="text-xs text-gray-500 block mb-1.5">Nombre de places</label>
                    <Select value={seats} onValueChange={setSeats}>
                      <SelectTrigger className="rounded-xl border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: Math.min(trip.available_seats, 4) }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{i + 1} place{i > 0 ? "s" : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Payment method */}
                  <div className="mb-4">
                    <label className="text-xs text-gray-500 block mb-1.5">Mode de paiement</label>
                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                      <SelectTrigger className="rounded-xl border-gray-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MVola">MVola</SelectItem>
                        <SelectItem value="Orange Money">Orange Money</SelectItem>
                        <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                        <SelectItem value="Cash">Espèces</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price breakdown */}
                  <div className="bg-blue-50 rounded-xl p-3 mb-4 space-y-1.5 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>{seats} place(s) × {formatPrice(trip.price_per_seat)}</span>
                      <span className="font-medium text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    {platformSettings.commission_enabled && (
                      <div className="flex justify-between text-gray-500 text-xs">
                        <span>Frais de service ({platformSettings.commission_percentage}%)</span>
                        <span>{formatPrice(commissionAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-blue-100">
                      <span>Total</span>
                      <span className="text-[#1A3C6E]">{formatPrice(totalWithFee)}</span>
                    </div>
                  </div>

                  {/* Mobile money info */}
                  {paymentMethod !== "Cash" && (
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                      <p className="text-xs font-semibold text-[#1A3C6E] mb-2 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" /> Paiement {paymentMethod}
                      </p>
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span>Numéro :</span>
                          <span className="font-semibold">{driverUser?.mobile_money_number || "À confirmer"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Montant :</span>
                          <span className="font-bold text-[#1A3C6E]">{formatPrice(totalWithFee)}</span>
                        </div>
                      </div>
                      {/* Proof upload */}
                      <div className="mt-2 pt-2 border-t border-blue-100">
                        {transactionProof ? (
                          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Preuve téléchargée
                            <button onClick={() => setTransactionProof(null)} className="ml-auto text-red-500 hover:underline">Supprimer</button>
                          </div>
                        ) : (
                          <label className={`flex items-center gap-2 px-2 py-1.5 border border-dashed rounded-lg cursor-pointer text-xs text-gray-500 transition-colors ${uploadingProof ? "border-[#1A3C6E]" : "border-gray-200 hover:border-[#1A3C6E]/50"}`}>
                            {uploadingProof
                              ? <><div className="w-3.5 h-3.5 border-2 border-[#1A3C6E] border-t-transparent rounded-full animate-spin" /> Chargement...</>
                              : <><Upload className="w-3.5 h-3.5" /> Preuve de paiement (optionnel)</>
                            }
                            <input type="file" accept="image/*" className="hidden" disabled={uploadingProof} onChange={async (e) => {
                              const file = e.target.files[0];
                              if (!file) return;
                              setUploadingProof(true);
                              const { file_url } = await base44.integrations.Core.UploadFile({ file });
                              setTransactionProof(file_url);
                              setUploadingProof(false);
                            }} />
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => bookMutation.mutate()}
                    disabled={bookMutation.isPending}
                    className="w-full bg-[#1A3C6E] hover:bg-[#2B5BA8] text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                  >
                    {bookMutation.isPending ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Réservation...</>
                    ) : (
                      "Demande de réservation"
                    )}
                  </button>
                </>
              ) : !user ? (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">Connectez-vous pour réserver</p>
                  <button onClick={() => base44.auth.redirectToLogin()} className="w-full bg-[#1A3C6E] text-white py-3 rounded-xl text-sm font-semibold hover:bg-[#2B5BA8] transition-colors">
                    Se connecter
                  </button>
                </div>
              ) : trip.status === "full" ? (
                <div className="text-center py-3">
                  <p className="text-sm font-semibold text-red-600 bg-red-50 rounded-xl py-3">Trajet complet</p>
                </div>
              ) : null}
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}