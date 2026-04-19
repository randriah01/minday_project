import React from "react";
import { Shield, Search, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

const MISSION_IMG = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6997abd6512782c1214970f8/d7aede0f5_crossroad-car-safari-scene.jpg";

const pillars = [
  {
    icon: Shield,
    title: "Conducteurs vérifiés",
    desc: "Chaque conducteur soumet son permis, son assurance et sa visite technique — analysés par IA avant toute publication."
  },
  {
    icon: Search,
    title: "Transparence totale",
    desc: "Les avis sont réels, les profils sont authentifiés. Voyagez en toute confiance grâce à notre système de notation."
  },
  {
    icon: Lock,
    title: "Réservations sécurisées",
    desc: "Vos paiements et réservations sont protégés. En cas de problème, notre équipe est là pour vous."
  },
];

export default function MissionSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch" style={{ minHeight: "420px" }}>
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-semibold text-[#1A3C6E] uppercase tracking-widest">Notre engagement</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4 leading-tight">
            Notre Mission :<br />
            <span className="text-[#1A3C6E]">Zéro arnaque,</span> voyages sûrs
          </h2>
          <p className="text-gray-500 text-base leading-relaxed mb-6">
            Minday a été fondé pour <strong className="text-gray-800">lutter contre la fraude et les arnaques</strong> dans les voyages longue distance à Madagascar. Trop de passagers ont subi des escroqueries — conducteurs fantômes, véhicules non conformes, paiements non remboursés.
          </p>
          <p className="text-gray-500 text-base leading-relaxed mb-8">
            Notre réponse : une plateforme où <strong className="text-gray-800">chaque conducteur est vérifié</strong>, chaque document contrôlé, chaque réservation tracée. La confiance n'est pas une option — c'est notre fondation.
          </p>
          <Link
            to={createPageUrl("SearchTrips")}
            className="inline-flex items-center gap-2 bg-[#1A3C6E] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#2B5BA8] transition-colors mt-8 text-sm shadow-lg shadow-blue-900/20"
          >
            Voyager en sécurité
          </Link>
        </motion.div>

        {/* Right: Image */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 h-full" style={{ minHeight: "420px" }}>
            <img
              src={MISSION_IMG}
              alt="Route Madagascar"
              className="w-full h-full object-cover absolute inset-0"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}