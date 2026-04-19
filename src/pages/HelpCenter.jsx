import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronRight, ChevronDown, Search, Car, CreditCard, Shield, User, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

const FAQ_CATEGORIES = [
  {
    icon: Search,
    title: "Recherche & Réservation",
    color: "bg-blue-50 text-blue-600",
    items: [
      { q: "Comment rechercher un trajet ?", a: "Depuis la page d'accueil, entrez votre ville de départ, votre destination et la date souhaitée, puis cliquez sur 'Rechercher'. Vous verrez tous les trajets disponibles correspondant à vos critères." },
      { q: "Comment réserver une place ?", a: "Cliquez sur un trajet pour voir ses détails. Choisissez le nombre de places, votre moyen de paiement, puis cliquez sur 'Réserver'. Votre réservation sera confirmée dès que le conducteur l'accepte." },
      { q: "Comment annuler une réservation ?", a: "Rendez-vous dans 'Mes trajets', section 'Mes réservations', puis cliquez sur 'Annuler' sur la réservation concernée. Contactez le conducteur si le trajet est proche." },
    ]
  },
  {
    icon: Car,
    title: "Publication de trajets",
    color: "bg-green-50 text-green-600",
    items: [
      { q: "Comment publier mon premier trajet ?", a: "Cliquez sur 'Publier un trajet' dans le menu. Remplissez les informations : départ, destination, date, heure, prix par place et nombre de places disponibles. Vos documents doivent être vérifiés avant de pouvoir publier." },
      { q: "Pourquoi mes documents doivent-ils être vérifiés ?", a: "La vérification de vos documents (permis, assurance, visite technique) garantit la sécurité de tous les passagers. Notre système IA analyse vos documents automatiquement en quelques secondes." },
      { q: "Comment fixer le bon prix ?", a: "Calculez les frais de carburant pour le trajet et divisez-les par le nombre de passagers. Ajoutez une petite marge pour les frais d'usure. Regardez les prix des autres conducteurs sur le même trajet pour rester compétitif." },
    ]
  },
  {
    icon: CreditCard,
    title: "Paiements",
    color: "bg-purple-50 text-purple-600",
    items: [
      { q: "Quels moyens de paiement sont acceptés ?", a: "Minday accepte MVola, Orange Money, Airtel Money et les paiements en espèces. Choisissez votre méthode préférée lors de la réservation." },
      { q: "Comment payer par MVola ?", a: "Sélectionnez MVola comme méthode de paiement. Effectuez le transfert au numéro MVola du conducteur (visible dans les détails du trajet), puis entrez la référence de transaction dans l'application." },
      { q: "Que faire si j'ai un problème de paiement ?", a: "Contactez-nous à minday.transport@gmail.com avec le numéro de votre réservation et la référence de transaction. Notre équipe traitera votre demande sous 48h." },
    ]
  },
  {
    icon: Shield,
    title: "Sécurité & Vérification",
    color: "bg-orange-50 text-orange-600",
    items: [
      { q: "Comment Minday vérifie-t-il les conducteurs ?", a: "Notre système d'IA analyse chaque document soumis pour en vérifier l'authenticité, extraire les données (nom, date d'expiration, numéro), et détecter toute falsification. Les documents suspects sont soumis à une vérification manuelle." },
      { q: "Mes documents sont-ils sécurisés ?", a: "Oui. Tous vos documents sont stockés de manière chiffrée et sécurisée. Seule notre équipe de vérification peut y accéder. Consultez notre politique de confidentialité pour plus de détails." },
      { q: "Comment signaler un conducteur problématique ?", a: "Rendez-vous sur le profil du conducteur et cliquez sur 'Signaler'. Vous pouvez également nous contacter directement à minday.transport@gmail.com." },
    ]
  },
  {
    icon: User,
    title: "Mon compte",
    color: "bg-red-50 text-red-600",
    items: [
      { q: "Comment modifier mon profil ?", a: "Allez dans 'Mon profil', cliquez sur 'Modifier' pour changer vos informations personnelles, votre photo ou vos coordonnées de paiement." },
      { q: "Comment supprimer mon compte ?", a: "Contactez-nous à minday.transport@gmail.com avec votre demande de suppression. Votre compte sera supprimé sous 30 jours conformément à notre politique RGPD." },
      { q: "J'ai oublié mon mot de passe, que faire ?", a: "Cliquez sur 'Connexion' puis 'Mot de passe oublié'. Entrez votre adresse email et vous recevrez un lien de réinitialisation." },
    ]
  }
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors">
        <span className="text-sm font-medium text-gray-900 pr-4">{q}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 pt-3">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpCenter() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);

  const filtered = FAQ_CATEGORIES.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      !search || item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => !search || cat.items.length > 0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to={createPageUrl("Home")} className="hover:text-[#1A3C6E]">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700">Centre d'aide</span>
        </div>

        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-[#EEF4FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-6 h-6 text-[#1A3C6E]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Centre d'aide Minday</h1>
          <p className="text-gray-500 text-sm">Trouvez rapidement des réponses à vos questions</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans l'aide..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E] shadow-sm"
          />
        </div>

        {/* Categories */}
        {!search && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {FAQ_CATEGORIES.map((cat, i) => (
              <button
                key={i}
                onClick={() => setActiveCategory(activeCategory === i ? null : i)}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${activeCategory === i ? "border-[#1A3C6E] bg-[#EEF4FF]" : "border-gray-100 bg-white hover:border-[#1A3C6E]/30 hover:bg-gray-50"}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.color}`}>
                  <cat.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-gray-700">{cat.title}</span>
              </button>
            ))}
          </div>
        )}

        {/* FAQ Items */}
        <div className="space-y-6">
          {filtered
            .filter((_, i) => search || activeCategory === null || activeCategory === i)
            .map((cat, i) => (
              <div key={i}>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.color}`}>
                    <cat.icon className="w-3.5 h-3.5" />
                  </div>
                  {cat.title}
                </h2>
                <div className="space-y-2">
                  {cat.items.map((item, j) => <FAQItem key={j} q={item.q} a={item.a} />)}
                </div>
              </div>
            ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-10 bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] rounded-2xl p-6 text-center">
          <h3 className="text-white font-bold text-lg mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p className="text-white/70 text-sm mb-4">Notre équipe est là pour vous aider.</p>
          <Link to={createPageUrl("ContactUs")}
            className="inline-flex items-center gap-2 bg-white text-[#1A3C6E] font-semibold text-sm px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            Nous contacter
          </Link>
        </div>
      </motion.div>
    </div>
  );
}