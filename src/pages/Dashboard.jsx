import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import {
  Car, Banknote, Users, Star, TrendingUp, MapPin, ArrowRight,
  Calendar, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: myTrips = [] } = useQuery({
    queryKey: ["dashTrips", user?.email],
    queryFn: () => base44.entities.Trip.filter({ driver_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const { data: myBookingsAsPassenger = [] } = useQuery({
    queryKey: ["dashBookingsPassenger", user?.email],
    queryFn: () => base44.entities.Booking.filter({ passenger_email: user.email }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const { data: driverBookings = [] } = useQuery({
    queryKey: ["dashDriverBookings", user?.email],
    queryFn: () => base44.entities.Booking.filter({ driver_email: user.email, booking_status: "confirmed" }, "-created_date", 100),
    enabled: !!user?.email,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["dashReviews", user?.email],
    queryFn: () => base44.entities.Review.filter({ reviewed_user_email: user.email }),
    enabled: !!user?.email,
  });

  if (!user) return null;

  const totalEarnings = driverBookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const totalSpent = myBookingsAsPassenger
    .filter((b) => b.booking_status === "confirmed")
    .reduce((sum, b) => sum + (b.total_price || 0), 0);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "–";

  const formatPrice = (p) => new Intl.NumberFormat("fr-MG").format(p) + " Ar";

  // Chart: bookings by status
  const bookingsByStatus = ["confirmed", "pending", "rejected", "cancelled"].map((status) => ({
    name: status === "confirmed" ? "Confirmé" : status === "pending" ? "En attente" : status === "rejected" ? "Refusé" : "Annulé",
    value: driverBookings.concat(myBookingsAsPassenger).filter((b) => b.booking_status === status).length,
  }));

  const PIE_COLORS = ["#D4A520", "#F0D668", "#EF4444", "#9CA3AF"];

  const statCards = [
    { icon: Car, label: "Trajets publiés", value: myTrips.length, color: "bg-[#D4A520]" },
    { icon: Banknote, label: "Revenus", value: formatPrice(totalEarnings), color: "bg-green-500" },
    { icon: TrendingUp, label: "Dépenses trajet", value: formatPrice(totalSpent), color: "bg-blue-500" },
    { icon: Star, label: "Note moyenne", value: avgRating, color: "bg-purple-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1">Bienvenue, {user.full_name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Réservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bookingsByStatus.filter((b) => b.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {bookingsByStatus.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {bookingsByStatus.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                  {s.name}: {s.value}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {myTrips.slice(0, 5).map((trip) => (
                <Link
                  key={trip.id}
                  to={createPageUrl("TripDetails") + `?id=${trip.id}`}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#D4A520]/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#D4A520]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{trip.departure_city} → {trip.destination_city}</p>
                      <p className="text-xs text-gray-400">{trip.departure_date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-[#D4A520]">{formatPrice(trip.price_per_seat)}</span>
                </Link>
              ))}
              {myTrips.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400">Aucune activité</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}