import React from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, Package, Banknote, Phone, MessageCircle, Navigation, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

export default function ParcelCard({ parcel, index = 0 }) {
  const whatsappUrl = `https://wa.me/${parcel.whatsapp_number?.replace(/\D/g, "")}?text=Bonjour ${encodeURIComponent(parcel.full_name)}, je suis intéressé par votre offre de transport de colis de ${parcel.departure_location} vers ${parcel.destination_location}.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:border-[#1A3C6E]/20 transition-all group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {parcel.full_name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <Link
              to={createPageUrl("UserProfile") + `?email=${parcel.user_email || ""}`}
              className="font-semibold text-gray-900 text-sm hover:text-[#1A3C6E] hover:underline transition-colors"
            >
              {parcel.full_name}
            </Link>
            <span className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
              <Package className="w-3 h-3" /> Transport colis
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-[#1A3C6E]">
            {parcel.price_per_kg?.toLocaleString()} {parcel.currency || "EUR"}
          </p>
          <p className="text-xs text-gray-400">par kg</p>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 mb-4 bg-gray-50 rounded-xl p-3">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <Navigation className="w-4 h-4 text-[#1A3C6E] shrink-0" />
          <span className="text-sm font-medium text-gray-900 truncate">{parcel.departure_location}</span>
        </div>
        <div className="w-6 h-px bg-gray-300 shrink-0" />
        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
          <span className="text-sm font-medium text-gray-900 truncate">{parcel.destination_location}</span>
          <MapPin className="w-4 h-4 text-red-400 shrink-0" />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#1A3C6E]" />
          <span>Départ: {parcel.departure_date ? format(new Date(parcel.departure_date), "d MMM yyyy", { locale: fr }) : "—"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5 text-[#1A3C6E]" />
          <span>{parcel.available_weight_kg} kg disponible</span>
        </div>
        {parcel.delivery_date && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>Livraison: {format(new Date(parcel.delivery_date), "d MMM yyyy", { locale: fr })}</span>
          </div>
        )}
        {parcel.pickup_location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate">{parcel.pickup_location}</span>
          </div>
        )}
      </div>

      {parcel.notes && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 line-clamp-2">{parcel.notes}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <MessageCircle className="w-4 h-4" /> WhatsApp
        </a>
        <a
          href={`tel:${parcel.phone_number}`}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-semibold py-2.5 rounded-xl transition-colors"
        >
          <Phone className="w-4 h-4" /> Appeler
        </a>
      </div>
    </motion.div>
  );
}