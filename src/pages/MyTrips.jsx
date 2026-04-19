import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import {
  Car, MapPin, Clock, Users, Calendar, CheckCircle, XCircle,
  ArrowRight, Banknote, Star, ChevronDown, ChevronUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function MyTrips() {
  const [user, setUser] = useState(null);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: myTrips = [] } = useQuery({
    queryKey: ["myTrips", user?.email],
    queryFn: () => base44.entities.Trip.filter({ driver_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
  });

  const { data: myBookings = [] } = useQuery({
    queryKey: ["myBookings", user?.email],
    queryFn: () => base44.entities.Booking.filter({ passenger_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
  });

  const { data: bookingsForMyTrips = [] } = useQuery({
    queryKey: ["bookingsForMyTrips", user?.email],
    queryFn: () => base44.entities.Booking.filter({ driver_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status, tripId, seatsReserved }) => {
      await base44.entities.Booking.update(bookingId, { booking_status: status });
      if (status === "rejected" || status === "cancelled") {
        const trip = myTrips.find((t) => t.id === tripId);
        if (trip) {
          await base44.entities.Trip.update(tripId, {
            available_seats: trip.available_seats + seatsReserved,
            status: "active",
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["myTrips"]);
      queryClient.invalidateQueries(["bookingsForMyTrips"]);
    },
  });

  const cancelTripMutation = useMutation({
    mutationFn: async (tripId) => {
      await base44.entities.Trip.update(tripId, { status: "cancelled" });
    },
    onSuccess: () => queryClient.invalidateQueries(["myTrips"]),
  });

  const formatPrice = (price) => new Intl.NumberFormat("fr-MG").format(price) + " Ar";

  const statusColors = {
    active: "bg-green-100 text-green-700",
    full: "bg-blue-100 text-blue-700",
    completed: "bg-gray-100 text-gray-700",
    cancelled: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    active: "Actif",
    full: "Complet",
    completed: "Terminé",
    cancelled: "Annulé",
    pending: "En attente",
    confirmed: "Confirmé",
    rejected: "Refusé",
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes trajets</h1>

      <Tabs defaultValue="bookings">
        <TabsList className="w-full bg-gray-100 rounded-xl p-1 mb-6">
          <TabsTrigger value="bookings" className="flex-1 rounded-lg text-sm">Mes réservations</TabsTrigger>
          <TabsTrigger value="published" className="flex-1 rounded-lg text-sm">Mes publications</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          {myBookings.length === 0 ? (
            <div className="text-center py-16">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune réservation</h3>
              <p className="text-sm text-gray-500 mb-4">Recherchez un trajet pour commencer</p>
              <Link to={createPageUrl("SearchTrips")} className="text-[#1A3C6E] text-sm font-medium hover:underline">Rechercher un trajet</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                        {booking.trip_departure_city}
                        <ArrowRight className="w-4 h-4 text-[#1A3C6E]" />
                        {booking.trip_destination_city}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {booking.trip_departure_date && format(new Date(booking.trip_departure_date), "d MMM", { locale: fr })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {booking.trip_departure_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {booking.seats_reserved} place(s)
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={statusColors[booking.booking_status]}>{statusLabels[booking.booking_status]}</Badge>
                      <p className="text-sm font-semibold text-[#1A3C6E] mt-1">{formatPrice(booking.total_price)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="published">
          {myTrips.length === 0 ? (
            <div className="text-center py-16">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun trajet publié</h3>
              <Link to={createPageUrl("PublishTrip")} className="text-[#1A3C6E] text-sm font-medium hover:underline">Publier un trajet</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myTrips.map((trip) => {
                const tripBookings = bookingsForMyTrips.filter((b) => b.trip_id === trip.id);
                const isExpanded = expandedBooking === trip.id;
                return (
                  <div key={trip.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            {trip.departure_city} <ArrowRight className="w-4 h-4 text-[#1A3C6E]" /> {trip.destination_city}
                          </div>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span>{trip.departure_date && format(new Date(trip.departure_date), "d MMM", { locale: fr })} · {trip.departure_time}</span>
                            <span>{trip.available_seats}/{trip.total_seats} places</span>
                            <span className="font-semibold text-[#1A3C6E]">{formatPrice(trip.price_per_seat)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[trip.status]}>{statusLabels[trip.status]}</Badge>
                          {trip.status === "active" && (
                            <button onClick={() => cancelTripMutation.mutate(trip.id)} className="text-xs text-red-500 hover:text-red-700">Annuler</button>
                          )}
                        </div>
                      </div>

                      {tripBookings.length > 0 && (
                        <button
                          onClick={() => setExpandedBooking(isExpanded ? null : trip.id)}
                          className="mt-3 flex items-center gap-1 text-xs text-[#1A3C6E] font-medium"
                        >
                          {tripBookings.length} réservation(s)
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-50 bg-gray-50/50 overflow-hidden"
                        >
                          <div className="p-4 space-y-2">
                            {tripBookings.map((b) => (
                              <div key={b.id} className="flex items-center justify-between bg-white rounded-xl p-3">
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{b.passenger_name}</p>
                                  <p className="text-xs text-gray-500">{b.seats_reserved} place(s) · {b.payment_method} · {formatPrice(b.total_price)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={statusColors[b.booking_status]}>{statusLabels[b.booking_status]}</Badge>
                                  {b.booking_status === "pending" && (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => updateBookingMutation.mutate({ bookingId: b.id, status: "confirmed", tripId: trip.id, seatsReserved: b.seats_reserved })}
                                        className="p-1.5 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                                      >
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      </button>
                                      <button
                                        onClick={() => updateBookingMutation.mutate({ bookingId: b.id, status: "rejected", tripId: trip.id, seatsReserved: b.seats_reserved })}
                                        className="p-1.5 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                                      >
                                        <XCircle className="w-4 h-4 text-red-600" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}