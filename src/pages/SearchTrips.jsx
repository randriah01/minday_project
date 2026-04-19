import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import CityAutocomplete from "@/components/CityAutocomplete";
import TripCard from "@/components/TripCard";
import { Search, SlidersHorizontal, X, Navigation, MapPin, Calendar, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchTrips() {
  const urlParams = new URLSearchParams(window.location.search);
  const [departure, setDeparture] = useState(urlParams.get("from") || "");
  const [destination, setDestination] = useState(urlParams.get("to") || "");
  const [date, setDate] = useState(urlParams.get("date") || "");
  const [sortBy, setSortBy] = useState("departure_date");
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState("");

  const { data: trips = [], isLoading, refetch } = useQuery({
    queryKey: ["searchTrips"],
    queryFn: async () => {
      const filter = { status: "active" };
      if (departure) filter.departure_city = departure;
      if (destination) filter.destination_city = destination;
      if (date) filter.departure_date = date;
      return base44.entities.Trip.filter(filter, sortBy === "price" ? "price_per_seat" : "-departure_date", 50);
    },
  });

  useEffect(() => {
    refetch();
  }, [departure, destination, date, sortBy]);

  const filteredTrips = maxPrice
    ? trips.filter(t => t.price_per_seat <= parseInt(maxPrice))
    : trips;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <CityAutocomplete
            value={departure}
            onChange={setDeparture}
            placeholder="Départ"
            icon={<Navigation className="w-5 h-5" />}
          />
          <CityAutocomplete
            value={destination}
            onChange={setDestination}
            placeholder="Destination"
          />
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4A520]" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]/30 focus:border-[#D4A520]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtres
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
                  <label className="text-xs text-gray-500 mb-1 block">Prix max (Ariary)</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="Ex: 50000"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]/30 focus:border-[#D4A520]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Trier par</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="departure_date">Date de départ</SelectItem>
                      <SelectItem value="price">Prix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setDeparture("");
                      setDestination("");
                      setDate("");
                      setMaxPrice("");
                    }}
                    className="text-sm text-[#D4A520] hover:underline"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {filteredTrips.length} trajet{filteredTrips.length !== 1 ? "s" : ""} trouvé{filteredTrips.length !== 1 ? "s" : ""}
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-48 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-32 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          ))}
        </div>
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun trajet trouvé</h3>
          <p className="text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTrips.map((trip, i) => (
            <TripCard key={trip.id} trip={trip} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}