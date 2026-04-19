import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Package, Navigation, MapPin, Calendar, Phone, User, Banknote, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const COUNTRIES = ["France", "Réunion", "Île Maurice", "Comores", "Mayotte", "Belgique", "Suisse", "Canada", "États-Unis", "Autre"];
const MG_CITIES = ["Antananarivo", "Toamasina", "Mahajanga", "Fianarantsoa", "Toliara", "Antsiranana", "Antsirabe", "Ambositra", "Morondava", "Sambava"];

export default function PublishParcel() {
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    full_name: "",
    whatsapp_number: "",
    phone_number: "",
    email: "",
    departure_location: "",
    destination_location: "",
    departure_date: "",
    delivery_date: "",
    pickup_location: "",
    available_weight_kg: "",
    price_per_kg: "",
    currency: "EUR",
    notes: "",
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setForm((f) => ({
        ...f,
        full_name: u.full_name || "",
        email: u.email || "",
      }));
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const publishMutation = useMutation({
    mutationFn: () => base44.entities.ParcelTransport.create({
      ...form,
      available_weight_kg: parseFloat(form.available_weight_kg),
      price_per_kg: parseFloat(form.price_per_kg),
      user_email: user?.email,
      status: "active",
    }),
    onSuccess: () => setSuccess(true),
  });

  if (!user) return null;

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Annonce publiée !</h2>
          <p className="text-gray-500 mb-6">Votre annonce de transport de colis est maintenant visible</p>
          <div className="flex flex-col gap-3">
            <Link to={createPageUrl("SearchParcels")} className="bg-[#1A3C6E] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#2B5BA8] transition-colors">
              Voir toutes les annonces
            </Link>
            <button
              onClick={() => { setSuccess(false); setStep(1); setForm({ full_name: user.full_name || "", whatsapp_number: "", phone_number: "", email: user.email || "", departure_location: "", destination_location: "", departure_date: "", delivery_date: "", pickup_location: "", available_weight_kg: "", price_per_kg: "", currency: "EUR", notes: "" }); }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Publier une autre annonce
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <Link to={createPageUrl("SearchParcels")} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour
      </Link>

      <div className="flex items-center gap-3 mb-1">
        <Package className="w-6 h-6 text-[#1A3C6E]" />
        <h1 className="text-2xl font-bold text-gray-900">Publier une annonce colis</h1>
      </div>
      <p className="text-sm text-gray-500 mb-8 ml-9">Proposez votre espace disponible pour transporter un colis</p>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${step >= s ? "bg-[#1A3C6E] text-white" : "bg-gray-100 text-gray-400"}`}>
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? "bg-[#1A3C6E]" : "bg-gray-100"}`} />}
          </div>
        ))}
      </div>

      <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6">

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Vos informations</h2>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Nom complet *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.full_name} onChange={(e) => update("full_name", e.target.value)} placeholder="Votre nom" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Numéro WhatsApp *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                <input value={form.whatsapp_number} onChange={(e) => update("whatsapp_number", e.target.value)} placeholder="+33 6 XX XX XX XX" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Numéro de téléphone *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.phone_number} onChange={(e) => update("phone_number", e.target.value)} placeholder="+33 6 XX XX XX XX" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Email (optionnel)</label>
              <input value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="email@exemple.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
            </div>
            <button onClick={() => setStep(2)} disabled={!form.full_name || !form.whatsapp_number || !form.phone_number} className="w-full bg-[#1A3C6E] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2B5BA8] transition-all disabled:opacity-40 text-sm">
              Continuer
            </button>
          </div>
        )}

        {/* Step 2: Transport Details */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Détails du transport</h2>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Pays de départ *</label>
              <Select value={form.departure_location} onValueChange={(v) => update("departure_location", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choisir un pays" /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Destination (Madagascar) *</label>
              <Select value={form.destination_location} onValueChange={(v) => update("destination_location", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choisir une ville" /></SelectTrigger>
                <SelectContent>
                  {MG_CITIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Date de départ *</label>
                <input type="date" value={form.departure_date} onChange={(e) => update("departure_date", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Livraison estimée</label>
                <input type="date" value={form.delivery_date} onChange={(e) => update("delivery_date", e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Lieu de remise du colis</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.pickup_location} onChange={(e) => update("pickup_location", e.target.value)} placeholder="Ex: Paris 15e, gare de Lyon..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Retour</button>
              <button onClick={() => setStep(3)} disabled={!form.departure_location || !form.destination_location || !form.departure_date} className="flex-1 bg-[#1A3C6E] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2B5BA8] disabled:opacity-40 text-sm">Continuer</button>
            </div>
          </div>
        )}

        {/* Step 3: Pricing & Summary */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Tarification & résumé</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Poids disponible (kg) *</label>
                <div className="relative">
                  <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A3C6E]" />
                  <input type="number" value={form.available_weight_kg} onChange={(e) => update("available_weight_kg", e.target.value)} placeholder="Ex: 10" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1.5">Prix par kg *</label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1A3C6E]" />
                  <input type="number" value={form.price_per_kg} onChange={(e) => update("price_per_kg", e.target.value)} placeholder="Ex: 8" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]" />
                </div>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Devise</label>
              <Select value={form.currency} onValueChange={(v) => update("currency", v)}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="Ar">Ariary (Ar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Trajet</span><span className="font-medium">{form.departure_location} → {form.destination_location}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span className="font-medium">{form.departure_date}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Poids</span><span className="font-medium">{form.available_weight_kg} kg</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Prix/kg</span><span className="font-semibold text-[#1A3C6E]">{form.price_per_kg} {form.currency}</span></div>
            </div>

            <div>
              <label className="text-xs text-gray-500 block mb-1.5">Notes / restrictions (optionnel)</label>
              <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Ex: Pas d'objets fragiles, pas de liquides..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E] h-20 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">Retour</button>
              <button onClick={() => publishMutation.mutate()} disabled={!form.available_weight_kg || !form.price_per_kg || publishMutation.isPending} className="flex-1 bg-[#1A3C6E] text-white font-semibold py-3.5 rounded-xl hover:bg-[#2B5BA8] disabled:opacity-40 text-sm">
                {publishMutation.isPending ? "Publication..." : "Publier l'annonce"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}