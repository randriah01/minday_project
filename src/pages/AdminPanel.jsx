import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users, Car, Banknote, Shield,
  CheckCircle, Activity, Settings, Percent
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DocumentReviewCard from "@/components/driver/DocumentReviewCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [settingsForm, setSettingsForm] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => {
      if (u.role !== "admin") {
        window.location.href = "/Home";
        return;
      }
      setUser(u);
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: users = [] } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => base44.entities.User.list("-created_date", 200),
    enabled: !!user,
  });

  const { data: trips = [] } = useQuery({
    queryKey: ["adminTrips"],
    queryFn: () => base44.entities.Trip.list("-created_date", 200),
    enabled: !!user,
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ["adminBookings"],
    queryFn: () => base44.entities.Booking.list("-created_date", 200),
    enabled: !!user,
  });

  const { data: settings = [] } = useQuery({
    queryKey: ["platformSettings"],
    queryFn: () => base44.entities.PlatformSettings.list(),
    enabled: !!user,
  });
  const platformSettings = settings[0];

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["allSubscriptions"],
    queryFn: () => base44.entities.Subscription.list("-created_date", 200),
    enabled: !!user,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data) => {
      if (platformSettings) {
        await base44.entities.PlatformSettings.update(platformSettings.id, data);
      } else {
        await base44.entities.PlatformSettings.create(data);
      }
    },
    onSuccess: () => queryClient.invalidateQueries(["platformSettings"]),
  });

  useEffect(() => {
    if (platformSettings && !settingsForm) {
      setSettingsForm({
        commission_percentage: platformSettings.commission_percentage ?? 10,
        commission_enabled: platformSettings.commission_enabled ?? true,
        subscription_monthly_price: platformSettings.subscription_monthly_price ?? 15000,
        subscription_yearly_price: platformSettings.subscription_yearly_price ?? 150000,
        subscription_commission_rate: platformSettings.subscription_commission_rate ?? 5,
      });
    }
  }, [platformSettings]);

  if (!user) return null;

  const totalRevenue = bookings
    .filter((b) => b.booking_status === "confirmed")
    .reduce((sum, b) => sum + (b.total_price || 0), 0);

  const activeDrivers = [...new Set(trips.filter((t) => t.status === "active").map((t) => t.driver_email))].length;

  // Popular routes
  const routeCounts = {};
  trips.forEach((t) => {
    const key = `${t.departure_city} → ${t.destination_city}`;
    routeCounts[key] = (routeCounts[key] || 0) + 1;
  });
  const popularRoutes = Object.entries(routeCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, count]) => ({ name: name.length > 20 ? name.substring(0, 20) + "..." : name, trajets: count }));

  const formatPrice = (p) => new Intl.NumberFormat("fr-MG").format(p) + " Ar";

  const statCards = [
    { icon: Users, label: "Utilisateurs", value: users.length, color: "bg-blue-500" },
    { icon: Car, label: "Trajets total", value: trips.length, color: "bg-[#1A3C6E]" },
    { icon: Activity, label: "Conducteurs actifs", value: activeDrivers, color: "bg-green-500" },
    { icon: Banknote, label: "Volume transactions", value: formatPrice(totalRevenue), color: "bg-purple-500" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="w-6 h-6 text-[#1A3C6E]" />
        <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
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

      <Tabs defaultValue="users">
        <TabsList className="bg-gray-100 rounded-xl p-1 mb-6">
          <TabsTrigger value="users" className="rounded-lg text-sm">Utilisateurs</TabsTrigger>
          <TabsTrigger value="trips" className="rounded-lg text-sm">Trajets</TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-lg text-sm">Réservations</TabsTrigger>
          <TabsTrigger value="stats" className="rounded-lg text-sm">Statistiques</TabsTrigger>
          <TabsTrigger value="verification" className="rounded-lg text-sm">Vérification docs</TabsTrigger>
          <TabsTrigger value="monetization" className="rounded-lg text-sm">Monétisation</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Nom</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Email</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Rôle</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Documents conducteur</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Inscription</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] flex items-center justify-center text-white text-xs font-bold">
                              {u.full_name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{u.full_name || "–"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-500">{u.email}</td>
                        <td className="px-5 py-3">
                          <Badge className={
                            u.role === "admin" ? "bg-red-100 text-red-700" :
                            u.role === "driver" ? "bg-blue-100 text-blue-700" :
                            "bg-gray-100 text-gray-700"
                          }>
                            {u.role || "user"}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          {(u.license_url || u.insurance_url) ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {u.driver_status === "pending" && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">En attente</span>}
                                {u.driver_status === "approved" && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approuvé</span>}
                                {u.driver_status === "rejected" && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Rejeté</span>}
                              </div>
                              <div className="flex gap-2 mt-1">
                                {u.license_url && (
                                  <a href={u.license_url} target="_blank" rel="noreferrer" className="text-xs text-[#1A3C6E] hover:underline">Permis</a>
                                  )}
                                  {u.insurance_url && (
                                    <a href={u.insurance_url} target="_blank" rel="noreferrer" className="text-xs text-[#1A3C6E] hover:underline">Assurance</a>
                                )}
                              </div>
                              {u.driver_status === "pending" && (
                                <div className="flex gap-1 mt-1">
                                  <button
                                    onClick={async () => {
                                      await base44.entities.User.update(u.id, { driver_status: "approved" });
                                      queryClient.invalidateQueries(["adminUsers"]);
                                    }}
                                    className="text-xs bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600 transition-colors"
                                  >✓ Approuver</button>
                                  <button
                                    onClick={async () => {
                                      await base44.entities.User.update(u.id, { driver_status: "rejected" });
                                      queryClient.invalidateQueries(["adminUsers"]);
                                    }}
                                    className="text-xs bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 transition-colors"
                                  >✗ Rejeter</button>
                                </div>
                              )}
                            </div>
                          ) : <span className="text-xs text-gray-400">–</span>}
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-400">
                          {u.created_date ? new Date(u.created_date).toLocaleDateString("fr") : "–"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trips">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Trajet</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Conducteur</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Date</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Prix</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trips.map((t) => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">{t.departure_city} → {t.destination_city}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{t.driver_name || t.driver_email}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{t.departure_date}</td>
                        <td className="px-5 py-3 text-sm font-medium text-[#1A3C6E]">{formatPrice(t.price_per_seat)}</td>
                        <td className="px-5 py-3">
                          <Badge className={
                            t.status === "active" ? "bg-green-100 text-green-700" :
                            t.status === "cancelled" ? "bg-red-100 text-red-700" :
                            "bg-gray-100 text-gray-700"
                          }>{t.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bookings">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Passager</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Trajet</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Places</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Montant</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Paiement</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-sm text-gray-900">{b.passenger_name || b.passenger_email}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{b.trip_departure_city} → {b.trip_destination_city}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{b.seats_reserved}</td>
                        <td className="px-5 py-3 text-sm font-medium text-[#1A3C6E]">{formatPrice(b.total_price)}</td>
                        <td className="px-5 py-3 text-sm text-gray-500">{b.payment_method}</td>
                        <td className="px-5 py-3">
                          <Badge className={
                            b.booking_status === "confirmed" ? "bg-green-100 text-green-700" :
                            b.booking_status === "pending" ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          }>{b.booking_status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Itinéraires les plus populaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={popularRoutes} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={180} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="trajets" fill="#1A3C6E" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <div className="space-y-6">
            {users.filter(u => u.license_url || u.insurance_url || u.technical_inspection_url).length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>Aucun document soumis pour vérification</p>
              </div>
            ) : (
              users
                .filter(u => u.license_url || u.insurance_url || u.technical_inspection_url)
                .map(u => (
                  <div key={u.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 bg-gray-50 border-b border-gray-100">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] flex items-center justify-center text-white text-sm font-bold">
                        {u.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.full_name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                      <div className="ml-auto">
                        <Badge className={
                          u.driver_status === "approved" ? "bg-green-100 text-green-700" :
                          u.driver_status === "flagged" ? "bg-orange-100 text-orange-700" :
                          u.driver_status === "rejected" ? "bg-red-100 text-red-700" :
                          "bg-yellow-100 text-yellow-700"
                        }>{u.driver_status || "pending"}</Badge>
                      </div>
                    </div>
                    <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {u.license_url && (
                        <DocumentReviewCard
                          user={u}
                          docType="license"
                          docLabel="Permis de conduire"
                          docUrl={u.license_url}
                          verData={u.license_verification}
                          onUpdate={() => queryClient.invalidateQueries(["adminUsers"])}
                        />
                      )}
                      {u.insurance_url && (
                        <DocumentReviewCard
                          user={u}
                          docType="insurance"
                          docLabel="Assurance véhicule"
                          docUrl={u.insurance_url}
                          verData={u.insurance_verification}
                          onUpdate={() => queryClient.invalidateQueries(["adminUsers"])}
                        />
                      )}
                      {u.technical_inspection_url && (
                        <DocumentReviewCard
                          user={u}
                          docType="technical_inspection"
                          docLabel="Visite technique"
                          docUrl={u.technical_inspection_url}
                          verData={u.technical_inspection_verification}
                          onUpdate={() => queryClient.invalidateQueries(["adminUsers"])}
                        />
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="monetization">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commission settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Percent className="w-4 h-4 text-[#1A3C6E]" /> Commission par trajet
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsForm && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Activer la commission</span>
                      <button
                        onClick={() => setSettingsForm(f => ({ ...f, commission_enabled: !f.commission_enabled }))}
                        className={`w-11 h-6 rounded-full transition-colors ${settingsForm.commission_enabled ? "bg-[#1A3C6E]" : "bg-gray-200"}`}
                      >
                        <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform mx-0.5 ${settingsForm.commission_enabled ? "translate-x-5" : "translate-x-0"}`} />
                      </button>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Taux de commission (%)</label>
                      <input
                        type="number"
                        value={settingsForm.commission_percentage}
                        onChange={e => setSettingsForm(f => ({ ...f, commission_percentage: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Commission réduite abonnés (%)</label>
                      <input
                        type="number"
                        value={settingsForm.subscription_commission_rate}
                        onChange={e => setSettingsForm(f => ({ ...f, subscription_commission_rate: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20"
                      />
                    </div>
                    <button
                      onClick={() => updateSettingsMutation.mutate(settingsForm)}
                      disabled={updateSettingsMutation.isPending}
                      className="w-full bg-[#1A3C6E] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2B5BA8] transition-colors disabled:opacity-50"
                    >
                      {updateSettingsMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                    </button>
                  </>
                )}
                {!settingsForm && (
                  <button
                    onClick={() => setSettingsForm({ commission_percentage: 10, commission_enabled: true, subscription_monthly_price: 15000, subscription_yearly_price: 150000, subscription_commission_rate: 5 })}
                    className="w-full bg-[#1A3C6E] text-white py-2.5 rounded-xl text-sm font-semibold"
                  >
                    Initialiser les paramètres
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Subscription settings */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-[#1A3C6E]" /> Plans d'abonnement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsForm && (
                  <>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Prix mensuel (Ariary)</label>
                      <input
                        type="number"
                        value={settingsForm.subscription_monthly_price}
                        onChange={e => setSettingsForm(f => ({ ...f, subscription_monthly_price: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Prix annuel (Ariary)</label>
                      <input
                        type="number"
                        value={settingsForm.subscription_yearly_price}
                        onChange={e => setSettingsForm(f => ({ ...f, subscription_yearly_price: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20"
                      />
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-sm text-gray-600">
                      <p className="font-semibold text-[#1A3C6E] mb-1">Abonnements actifs : {subscriptions.filter(s => s.status === "active").length}</p>
                      <p>Revenu abonnements : {formatPrice(subscriptions.filter(s => s.status === "active").reduce((a, s) => a + (s.amount_paid || 0), 0))}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Revenue summary */}
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-[#1A3C6E]" /> Revenus de la plateforme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Volume total transactions", value: formatPrice(totalRevenue) },
                    { label: "Commissions estimées (10%)", value: formatPrice(Math.round(totalRevenue * ((platformSettings?.commission_percentage || 10) / 100))) },
                    { label: "Revenu abonnements", value: formatPrice(subscriptions.reduce((a, s) => a + (s.amount_paid || 0), 0)) },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#EEF4FF] rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                      <p className="text-xl font-bold text-[#1A3C6E]">{item.value}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}