import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ParcelCard from "@/components/ParcelCard";
import { Search, Package, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

export default function SearchParcels() {
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: parcels = [], isLoading } = useQuery({
    queryKey: ["parcels"],
    queryFn: () => base44.entities.ParcelTransport.filter({ status: "active" }, "-created_date", 50),
  });

  const filtered = parcels.filter((p) => {
    const depMatch = !departure || p.departure_location?.toLowerCase().includes(departure.toLowerCase());
    const destMatch = !destination || p.destination_location?.toLowerCase().includes(destination.toLowerCase());
    const dateMatch = !date || p.departure_date === date;
    const priceMatch = !maxPrice || (p.price_per_kg || 0) <= parseFloat(maxPrice);
    const weightMatch = !minWeight || (p.available_weight_kg || 0) >= parseFloat(minWeight);
    return depMatch && destMatch && dateMatch && priceMatch && weightMatch;
  });

  const hasFilters = departure || destination || date || maxPrice || minWeight;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#1A3C6E]" /> Transport de colis
          </h1>
          <p className="text-sm text-gray-500 mt-1">Trouvez quelqu'un qui transporte un colis vers Madagascar</p>
        </div>
        <Link
          to={createPageUrl("PublishParcel")}
          className="hidden md:inline-flex items-center gap-2 bg-[#1A3C6E] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#2B5BA8] transition-colors shadow-sm"
        >
          + Publier une annonce
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={departure}
            onChange={(e) => setDeparture(e.target.value)}
            placeholder="🌍 Départ (ex: Paris)"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]"
          />
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="📦 Destination (ex: Antananarivo)"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filtres avancés
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Prix max par kg</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Ex: 10"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Poids min. disponible (kg)</label>
                  <input
                    type="number"
                    value={minWeight}
                    onChange={(e) => setMinWeight(e.target.value)}
                    placeholder="Ex: 5"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => { setDeparture(""); setDestination(""); setDate(""); setMaxPrice(""); setMinWeight(""); }}
                    className="text-sm text-[#1A3C6E] hover:underline"
                  >
                    Réinitialiser
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 font-medium">
          {filtered.length} annonce{filtered.length !== 1 ? "s" : ""} trouvée{filtered.length !== 1 ? "s" : ""}
        </p>
        {hasFilters && (
          <button
            onClick={() => { setDeparture(""); setDestination(""); setDate(""); setMaxPrice(""); setMinWeight(""); }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700"
          >
            <X className="w-3 h-3" /> Effacer les filtres
          </button>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded w-32 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-20" />
                </div>
              </div>
              <div className="h-12 bg-gray-100 rounded-xl mb-4" />
              <div className="h-3 bg-gray-100 rounded w-full mb-2" />
              <div className="h-3 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune annonce trouvée</h3>
          <p className="text-sm text-gray-500 mb-6">Essayez de modifier vos critères ou publiez votre propre annonce</p>
          <Link
            to={createPageUrl("PublishParcel")}
            className="inline-flex items-center gap-2 bg-[#1A3C6E] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#2B5BA8] transition-colors"
          >
            Publier une annonce
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((parcel, i) => (
            <ParcelCard key={parcel.id} parcel={parcel} index={i} />
          ))}
        </div>
      )}

      {/* Mobile CTA */}
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Link
          to={createPageUrl("PublishParcel")}
          className="flex items-center gap-2 bg-[#1A3C6E] text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-[#1A3C6E]/30"
        >
          + Publier
        </Link>
      </div>
    </div>
  );
}