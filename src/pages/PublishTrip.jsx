import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import CityAutocomplete from "@/components/CityAutocomplete";
import { CITY_COORDINATES } from "@/components/MadagascarCities";
import {
  Navigation, MapPin, Calendar, Clock, Users, Banknote,
  Car, FileText, CheckCircle, ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export default function PublishTrip() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    departure_city: "",
    destination_city: "",
    departure_date: "",
    departure_time: "",
    price_per_seat: "",
    total_seats: "",
    vehicle_id: "",
    notes: "",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {
      base44.auth.redirectToLogin();
    });
  }, []);

  const { data: vehicles = [] } = useQuery({
    queryKey: ["myVehicles", user?.email],
    queryFn: () => base44.entities.Vehicle.filter({ driver_email: user.email }),
    enabled: !!user?.email,
  });

  // Must have uploaded at least license to publish
  const hasUploadedDocs = user?.license_url;
  const canPublish = user?.role === "admin" || !!hasUploadedDocs;
  const hasPendingDocs = user?.driver_status === "pending";

  const publishMutation = useMutation({
    mutationFn: async () => {
      const vehicle = vehicles.find((v) => v.id === form.vehicle_id);
      const depCoords = CITY_COORDINATES[form.departure_city] || {};
      const destCoords = CITY_COORDINATES[form.destination_city] || {};

      await base44.entities.Trip.create({
        driver_email: user.email,
        driver_name: user.full_name,
        vehicle_id: form.vehicle_id,
        vehicle_info: vehicle ? `${vehicle.brand} ${vehicle.model} · ${vehicle.plate_number}` : "",
        departure_city: form.departure_city,
        destination_city: form.destination_city,
        departure_date: form.departure_date,
        departure_time: form.departure_time,
        price_per_seat: parseInt(form.price_per_seat),
        total_seats: parseInt(form.total_seats),
        available_seats: parseInt(form.total_seats),
        status: "active",
        notes: form.notes,
        departure_lat: depCoords.lat,
        departure_lng: depCoords.lng,
        destination_lat: destCoords.lat,
        destination_lng: destCoords.lng,
      });

      // Update user role to driver if not already
      if (user.role !== "driver" && user.role !== "admin") {
        await base44.auth.updateMe({ role: "driver" });
      }
    },
    onSuccess: () => setSuccess(true),
  });

  const updateForm = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  if (!user) return null;

  if (!canPublish) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <FileText className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Documents requis</h2>
        <p className="text-gray-500 mb-2 text-sm">
          Pour publier des trajets, vous devez d'abord soumettre vos documents (permis de conduire, assurance…) dans votre profil.
        </p>
        <Link
          to={createPageUrl("Profile")}
          className="inline-flex items-center gap-2 bg-[#1A3C6E] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#2B5BA8] transition-colors mt-4"
        >
          <FileText className="w-4 h-4" /> Soumettre mes documents
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Trajet publié !</h2>
          <p className="text-gray-500 mb-6">Votre trajet est maintenant visible par les passagers</p>
          <div className="flex flex-col gap-3">
            <Link
              to={createPageUrl("MyTrips")}
              className="bg-[#1A3C6E] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#2B5BA8] transition-colors"
            >
              Voir mes trajets
            </Link>
            <button
              onClick={() => { setSuccess(false); setForm({ departure_city: "", destination_city: "", departure_date: "", departure_time: "", price_per_seat: "", total_seats: "", vehicle_id: "", notes: "" }); setStep(1); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Publier un autre trajet
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <Link to={createPageUrl("Home")} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Publier un trajet</h1>
      <p className="text-sm text-gray-500 mb-8">Partagez vos places disponibles et gagnez de l'argent</p>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              step >= s ? "bg-[#1A3C6E] text-white" : "bg-gray-100 text-gray-400"
            }`}>
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-[#1A3C6E]" : "bg-gray-100"}`} />}
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6">
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Itinéraire</h2>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Ville de départ</label>
              <CityAutocomplete value={form.departure_city} onChange={(v) => updateForm("departure_city", v)} placeholder="Ex: Antananarivo" icon={<Navigation className="w-5 h-5" />} />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Ville d'arrivée</label>
              <CityAutocomplete value={form.destination_city} onChange={(v) => updateForm("destination_city", v)} placeholder="Ex: Toamasina" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Date de départ</label>
                <input type="date" value={form.departure_date} onChange={(e) => updateForm("departure_date", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Heure de départ</label>
                <input type="time" value={form.departure_time} onChange={(e) => updateForm("departure_time", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!form.departure_city || !form.destination_city || !form.departure_date || !form.departure_time} className="w-full bg-[#1A3C6E] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2B5BA8] transition-all disabled:opacity-40 text-sm">
              Continuer
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Détails</h2>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Prix par place (Ariary)</label>
              <div className="relative">
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1A3C6E]" />
                <input type="number" value={form.price_per_seat} onChange={(e) => updateForm("price_per_seat", e.target.value)} placeholder="Ex: 25000" className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Places disponibles</label>
              <Select value={form.total_seats} onValueChange={(v) => updateForm("total_seats", v)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n} place{n > 1 ? "s" : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Véhicule</label>
              {vehicles.length > 0 ? (
                <Select value={form.vehicle_id} onValueChange={(v) => updateForm("vehicle_id", v)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choisir un véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.brand} {v.model} · {v.plate_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Link to={createPageUrl("MyVehicles")} className="block text-center py-3 border border-dashed border-[#1A3C6E] rounded-xl text-sm text-[#1A3C6E] hover:bg-[#EEF4FF] transition-colors">
                  + Ajouter un véhicule
                </Link>
              )}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Retour</button>
              <button onClick={() => setStep(3)} disabled={!form.price_per_seat || !form.total_seats} className="flex-1 bg-[#1A3C6E] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2B5BA8] transition-all disabled:opacity-40 text-sm">Continuer</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Récapitulatif</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Trajet</span>
                <span className="text-sm font-medium text-gray-900">{form.departure_city} → {form.destination_city}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-sm font-medium text-gray-900">{form.departure_date} à {form.departure_time}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Prix/place</span>
                <span className="text-sm font-semibold text-[#1A3C6E]">{new Intl.NumberFormat("fr-MG").format(form.price_per_seat)} Ar</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Places</span>
                <span className="text-sm font-medium text-gray-900">{form.total_seats}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Notes (optionnel)</label>
              <textarea value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder="Informations supplémentaires..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E] h-24 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Retour</button>
              <button onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending} className="flex-1 bg-[#1A3C6E] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2B5BA8] transition-all disabled:opacity-50 text-sm">
                {publishMutation.isPending ? "Publication..." : "Publier le trajet"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}