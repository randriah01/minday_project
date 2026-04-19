import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { MapPin, ArrowLeft } from "lucide-react";

export default function PageNotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#D4A520]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-10 h-10 text-[#D4A520]" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-lg text-gray-500 mb-6">Ce trajet n'existe pas</p>
        <Link
          to={createPageUrl("Home")}
          className="inline-flex items-center gap-2 bg-[#D4A520] text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-[#B8891A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}