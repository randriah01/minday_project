import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import CityAutocomplete from "@/components/CityAutocomplete";
import TripCard from "@/components/TripCard";
import MindayLogo from "@/components/MindayLogo";
import RouteCards from "@/components/RouteCards";
import MissionSection from "@/components/MissionSection";
import {
  Search, MapPin, Shield, Banknote, Users,
  Clock, Star, ChevronRight, ChevronLeft, Navigation, PlusCircle, Car, CheckCircle, ArrowRight
} from "lucide-react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const HERO_BG = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997abd6512782c1214970f8/96a3eb12f_ChatGPTImage25fevr202614_35_12.png";

function RecentTripsCarousel({ trips }) {
  const [page, setPage] = React.useState(0);
  const PER_PAGE = 3;
  const totalPages = Math.ceil(trips.length / PER_PAGE);
  const visible = trips.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <span className="text-xs font-semibold text-[#1A3C6E] uppercase tracking-widest">Disponibles maintenant</span>
          <h2 className="font-display text-3xl font-bold text-gray-900 mt-1">Prochains départs</h2>
        </div>
        <Link to={createPageUrl("SearchTrips")} className="hidden md:flex items-center gap-1 text-sm text-[#1A3C6E] font-medium hover:underline">
          Tout voir <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {visible.map((trip, i) => (
            <TripCard key={trip.id} trip={trip} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#1A3C6E] hover:text-[#1A3C6E] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === page ? "bg-[#1A3C6E] w-6" : "bg-gray-300"}`} />
            ))}
          </div>
          <button onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))} disabled={page === totalPages - 1}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#1A3C6E] hover:text-[#1A3C6E] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </section>
  );
}

function AnimatedNumber({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const num = parseInt(String(target).replace(/\D/g, "")) || 0;
    const duration = 1500;
    const step = Math.ceil(num / (duration / 16));
    let start = 0;
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const POPULAR_ROUTES = [
  { from: "Antananarivo", to: "Toamasina" },
  { from: "Antananarivo", to: "Fianarantsoa" },
  { from: "Antananarivo", to: "Mahajanga" },
  { from: "Antananarivo", to: "Antsirabe" },
  { from: "Toamasina", to: "Tamatave" },
  { from: "Antsirabe", to: "Fianarantsoa" },
];

export default function Home() {
  const [departure, setDeparture] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const { data: recentTrips = [] } = useQuery({
    queryKey: ["recentTrips"],
    queryFn: () => base44.entities.Trip.filter({ status: "active" }, "-created_date", 6),
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (departure) params.set("from", departure);
    if (destination) params.set("to", destination);
    if (date) params.set("date", date);
    window.location.href = createPageUrl("SearchTrips") + "?" + params.toString();
  };

  return (
    <div className="bg-white">

      {/* ─── HERO ─── */}
      <section className="relative min-h-[88vh] flex flex-col justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="Madagascar road" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628]/85 via-[#0A1628]/55 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight mb-6">
                Voyagez<br />
                <span className="text-[#6BA3E0]">ensemble,</span><br />
                dépensez moins
              </h1>
              <p className="text-lg text-white/75 leading-relaxed max-w-lg font-light">
                Partagez vos trajets sur les routes nationales de Madagascar. Simple, sécurisé et économique.
              </p>
            </motion.div>
          </div>

          {/* Search card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.65 }}
            className="mt-10 max-w-3xl"
          >
            <div className="bg-white rounded-2xl p-2 shadow-2xl shadow-black/30 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex flex-col md:flex-row gap-2">
                <div className="flex-1">
                  <CityAutocomplete
                    value={departure}
                    onChange={setDeparture}
                    placeholder="Ville de départ"
                    icon={<Navigation className="w-4 h-4" />}
                  />
                </div>
                <div className="flex-1">
                  <CityAutocomplete
                    value={destination}
                    onChange={setDestination}
                    placeholder="Destination"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]/30 focus:border-[#D4A520] transition-all text-gray-700"
                  />
                </div>
              </div>
              <button
                onClick={handleSearch}
                className="bg-[#1A3C6E] hover:bg-[#2B5BA8] active:scale-95 text-white font-bold px-7 py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-900/25 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Rechercher
              </button>
            </div>

            <div className="flex gap-2 mt-3">
              {POPULAR_ROUTES.slice(0, 3).map((r, i) => (
                <button
                  key={i}
                  onClick={() => { setDeparture(r.from); setDestination(r.to); }}
                  className="text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/15 text-white/80 hover:text-white px-3 py-1.5 rounded-full transition-all"
                >
                  {r.from} → {r.to}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="bg-[#0D1B2A] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, value: 10000, suffix: "+", label: "Voyageurs actifs" },
              { icon: MapPin, value: 50, suffix: "+", label: "Villes connectées" },
              { icon: Car, value: 500, suffix: "+", label: "Conducteurs" },
              { icon: Star, value: "", suffix: "4.8 ★", label: "Note moyenne" },

            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="w-5 h-5 text-[#6BA3E0] mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">
                  {stat.value ? <AnimatedNumber target={stat.value} suffix={stat.suffix} /> : stat.suffix}
                </p>
                <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold text-[#1A3C6E] uppercase tracking-widest">Simple & rapide</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-2">Comment ça marche ?</h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px border-t-2 border-dashed border-gray-200" />
          {[
            { step: "01", icon: Search, title: "Recherchez", desc: "Entrez votre trajet et date. Des résultats en temps réel s'affichent instantanément." },
            { step: "02", icon: CheckCircle, title: "Réservez", desc: "Choisissez votre place et payez via MVola, Orange Money ou en espèces." },
            { step: "03", icon: Car, title: "Voyagez", desc: "Retrouvez votre conducteur au point de départ et profitez du trajet !" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="relative inline-block mb-5">
                <div className="w-20 h-20 bg-[#EEF4FF] rounded-2xl flex items-center justify-center mx-auto">
                  <s.icon className="w-9 h-9 text-[#1A3C6E]" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-[#1A3C6E] text-white text-xs font-bold rounded-full flex items-center justify-center">{s.step}</span>
              </div>
              <h3 className="font-display text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── POPULAR ROUTES MAP ─── */}
      <section className="bg-[#F4F7FB] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <span className="text-xs font-semibold text-[#1A3C6E] uppercase tracking-widest">Routes nationales</span>
              <h2 className="font-display text-3xl font-bold text-gray-900 mt-1">Itinéraires populaires</h2>
            </div>
            <Link to={createPageUrl("SearchTrips")} className="hidden md:flex items-center gap-1 text-sm text-[#1A3C6E] font-medium hover:underline">
              Voir tous les trajets <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <RouteCards />
        </div>
      </section>

      {/* ─── OUR MISSION ─── */}
      <div className="border-t border-gray-100">
        <MissionSection />
      </div>

      {/* ─── RECENT TRIPS ─── */}
      {recentTrips.length > 0 && (
        <RecentTripsCarousel trips={recentTrips} />
      )}

      {/* ─── FEATURES / WHY MINDAY ─── */}
      <section className="bg-[#0D1B2A] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="text-xs font-semibold text-[#6BA3E0] uppercase tracking-widest">Notre engagement</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-2">
              Pourquoi choisir <span className="text-[#6BA3E0]">Minday</span> ?
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Banknote, title: "Économisez jusqu'à 50%", desc: "Partagez les frais de route et réduisez considérablement vos dépenses de voyage entre les villes." },
              { icon: Shield, title: "Profils vérifiés", desc: "Conducteurs avec documents contrôlés, avis authentiques. Voyagez l'esprit tranquille." },
              { icon: Clock, title: "Réservation en 2 minutes", desc: "Interface fluide, paiement mobile money intégré. Votre place est réservée instantanément." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -4 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/10 hover:border-[#6BA3E0]/30 transition-all group cursor-default"
              >
                <div className="w-12 h-12 bg-[#1A3C6E]/40 group-hover:bg-[#2B5BA8]/50 rounded-xl flex items-center justify-center mb-5 transition-colors">
                  <f.icon className="w-6 h-6 text-[#6BA3E0]" />
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-3">{f.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] rounded-3xl px-8 py-14 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 max-w-lg">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Prêt à voyager autrement ?</h2>
            <p className="text-white/80 leading-relaxed">Rejoignez des milliers de Malgaches qui partagent leurs trajets avec Minday.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to={createPageUrl("SearchTrips")}
              className="bg-white text-[#1A3C6E] font-bold px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm inline-flex items-center gap-2 justify-center"
            >
              <Search className="w-4 h-4" /> Trouver un trajet
            </Link>
            <Link
              to={createPageUrl("PublishTrip")}
              className="bg-white/15 backdrop-blur-sm border border-white/30 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/25 transition-colors text-sm inline-flex items-center gap-2 justify-center"
            >
              <PlusCircle className="w-4 h-4" /> Proposer un trajet
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── PARCEL CTA ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#0D3B1E] to-[#1a6b35] rounded-3xl px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative z-10 max-w-lg">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">📦</span>
              <span className="text-xs font-semibold text-green-300 uppercase tracking-widest">Nouveau service</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-white mb-3">Transport de colis vers Madagascar</h2>
            <p className="text-white/75 leading-relaxed text-sm">Trouvez des personnes qui voyagent vers Madagascar et peuvent transporter votre colis. Solution rapide, économique et fiable.</p>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to={createPageUrl("SearchParcels")}
              className="bg-white text-[#0D3B1E] font-bold px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-colors text-sm inline-flex items-center gap-2 justify-center"
            >
              🔍 Trouver un transporteur
            </Link>
            <Link
              to={createPageUrl("PublishParcel")}
              className="bg-white/15 border border-white/30 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/25 transition-colors text-sm inline-flex items-center gap-2 justify-center"
            >
              <PlusCircle className="w-4 h-4" /> Proposer mon espace
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── FOOTER ─── */}

    </div>
  );
}