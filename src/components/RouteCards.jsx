import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { ArrowRight, Clock, ChevronLeft, ChevronRight, Shield, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MISSION_IMG = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997abd6512782c1214970f8/f7d539866_crossroad-car-safari-scene.jpg";

const CITY_IMAGES = {
  "Antananarivo": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997abd6512782c1214970f8/b0e771a6f_tana.jpg",
  "Antsirabe": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997abd6512782c1214970f8/aaab794c9_antsirabe.jpg",
  "Fianarantsoa": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997abd6512782c1214970f8/05787e922_fianarantsoa.jpg",
  "Toamasina": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997abd6512782c1214970f8/2f60570b9_TAMATAVE.png",
  "Antsiranana": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997abd6512782c1214970f8/9ed9ee458_diego.jpg",
  "Toliara": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997abd6512782c1214970f8/4f428c2d3_toliara.jpg",
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600&auto=format&fit=crop&q=80";

const ROUTE_CARDS = [
  { from: "Antananarivo", to: "Toamasina", price: "20 000", duration: "5h30" },
  { from: "Toamasina", to: "Antananarivo", price: "20 000", duration: "5h30" },
  { from: "Antananarivo", to: "Fianarantsoa", price: "15 000", duration: "4h" },
  { from: "Antsirabe", to: "Fianarantsoa", price: "12 000", duration: "3h" },
  { from: "Antananarivo", to: "Antsirabe", price: "8 000", duration: "2h" },
  { from: "Antananarivo", to: "Mahajanga", price: "35 000", duration: "10h" },
];

function getImage(from, to) {
  return CITY_IMAGES[from] || CITY_IMAGES[to] || FALLBACK_IMG;
}

const SLIDES = [
  ...ROUTE_CARDS.map((r, i) => ({ type: "route", data: r, key: `route-${i}` })),
  { type: "mission", key: "mission" },
];

const ITEMS_PER_PAGE = 3;
const TOTAL_PAGES = Math.ceil(SLIDES.length / ITEMS_PER_PAGE);

export default function RouteCards() {
  const [page, setPage] = useState(0);

  const start = page * ITEMS_PER_PAGE;
  const visible = SLIDES.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div>
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {visible.map((slide) =>
              slide.type === "route" ? (
                <RouteCard key={slide.key} route={slide.data} />
              ) : (
                <MissionCard key={slide.key} />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#1A3C6E] hover:text-[#1A3C6E] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex gap-2">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-2 h-2 rounded-full transition-all ${i === page ? "bg-[#1A3C6E] w-6" : "bg-gray-300"}`}
            />
          ))}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, TOTAL_PAGES - 1))}
          disabled={page === TOTAL_PAGES - 1}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#1A3C6E] hover:text-[#1A3C6E] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function RouteCard({ route }) {
  const img = getImage(route.from, route.to);
  return (
    <Link
      to={createPageUrl("SearchTrips") + `?from=${route.from}&to=${route.to}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:shadow-blue-900/10 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-44 overflow-hidden">
        <img src={img} alt={`${route.from} - ${route.to}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white text-xs font-semibold bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
          {route.from}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-2 mb-3">
          <div className="flex flex-col items-center mt-1 gap-1">
            <div className="w-2 h-2 rounded-full border-2 border-[#1A3C6E]" />
            <div className="w-px h-4 bg-gray-300" />
            <div className="w-2 h-2 rounded-full bg-[#1A3C6E]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">{route.from}</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{route.to}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">À partir de</p>
            <p className="text-lg font-bold text-[#1A3C6E]">{route.price} <span className="text-sm font-medium">Ar</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="w-3.5 h-3.5" />{route.duration}
            </div>
            <div className="w-9 h-9 rounded-full bg-[#1A3C6E] group-hover:bg-[#2B5BA8] flex items-center justify-center transition-colors shadow-md shadow-blue-900/20">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function MissionCard() {
  return (
    <div className="bg-gradient-to-br from-[#0D1B2A] to-[#1A3C6E] rounded-2xl overflow-hidden border border-white/10 flex flex-col">
      <div className="relative h-44 overflow-hidden">
        <img src={MISSION_IMG} alt="Mission Minday" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0D1B2A]/80 to-transparent" />
        <div className="absolute bottom-3 left-3">
          <span className="text-xs font-bold text-white bg-[#1A3C6E]/70 backdrop-blur-sm px-2 py-1 rounded-full">Notre Mission</span>
        </div>
      </div>
      <div className="p-4 flex-1">
        <h3 className="font-bold text-white text-sm mb-2">Zéro fraude, 100% sécurité</h3>
        <p className="text-white/70 text-xs leading-relaxed">
          Minday a été créé pour <span className="text-white font-semibold">éliminer les arnaques</span> dans les voyages longue distance à Madagascar. Chaque conducteur est vérifié : permis, assurance, visite technique — validés par IA et notre équipe.
        </p>
        <div className="flex flex-col gap-1.5 mt-3">
          {["Conducteurs vérifiés par IA", "Documents authentifiés", "Réservations sécurisées"].map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-white/80">
              <CheckCircle className="w-3 h-3 text-[#6BA3E0] flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}