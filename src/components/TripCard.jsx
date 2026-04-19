import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { Clock, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

export default function TripCard({ trip, index = 0 }) {
  const formatPrice = (price) => new Intl.NumberFormat("fr-MG").format(price) + " Ar";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link to={createPageUrl("TripDetails") + `?id=${trip.id}`} className="block group">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-xl hover:shadow-blue-900/8 hover:border-[#1A3C6E]/20 hover:-translate-y-0.5 transition-all duration-300">
          {/* Route */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-[#1A3C6E] shrink-0" />
                <span className="font-bold text-gray-900 text-[15px]">{trip.departure_city}</span>
              </div>
              <div className="ml-1 border-l-2 border-dashed border-gray-200 h-5 ml-[4.5px]" />
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1A3C6E] shrink-0" />
                <span className="font-bold text-gray-900 text-[15px]">{trip.destination_city}</span>
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-2xl font-extrabold text-[#1A3C6E] leading-none">{formatPrice(trip.price_per_seat)}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">par place</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex items-center gap-3 text-xs text-gray-500 py-3 border-y border-gray-50">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#1A3C6E]" />
              <span className="font-medium">
                {trip.departure_date && format(new Date(trip.departure_date), "d MMM", { locale: fr })}
                {trip.departure_time && ` · ${trip.departure_time}`}
              </span>
            </div>
            <div className="w-px h-3 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#1A3C6E]" />
              <span className="font-medium">{trip.available_seats} place{trip.available_seats > 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Driver + CTA */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1A3C6E]/20 to-[#2B5BA8]/30 flex items-center justify-center text-xs font-bold text-[#1A3C6E]">
                {trip.driver_name ? trip.driver_name[0]?.toUpperCase() : "D"}
              </div>
              <span className="text-xs font-medium text-gray-600">{trip.driver_name || "Conducteur"}</span>
            </div>
            <div className="w-7 h-7 bg-[#1A3C6E]/10 group-hover:bg-[#1A3C6E] rounded-full flex items-center justify-center transition-colors">
              <ArrowRight className="w-3.5 h-3.5 text-[#1A3C6E] group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}