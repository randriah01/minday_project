import React from "react";
import { motion } from "framer-motion";
import { Shield, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

export default function TermsOfUse() {
  const sections = [
    {
      title: "1. Objet",
      content: "Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités et conditions d'utilisation de la plateforme Minday, service de mise en relation entre conducteurs et passagers pour des trajets en covoiturage sur le territoire de Madagascar."
    },
    {
      title: "2. Acceptation des conditions",
      content: "En créant un compte ou en utilisant la plateforme Minday, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, vous ne pouvez pas utiliser notre plateforme."
    },
    {
      title: "3. Inscription et compte utilisateur",
      content: "Pour accéder aux services Minday, vous devez créer un compte avec des informations exactes et à jour. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées depuis votre compte. Minday se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU."
    },
    {
      title: "4. Vérification des conducteurs",
      content: "Tout conducteur souhaitant proposer des trajets doit fournir : un permis de conduire valide, une attestation d'assurance en cours de validité, et une visite technique récente. Ces documents sont soumis à une vérification par intelligence artificielle et peuvent faire l'objet d'une révision manuelle par notre équipe. Aucun trajet ne peut être publié avant l'approbation complète des documents."
    },
    {
      title: "5. Responsabilités",
      content: "Minday est une plateforme de mise en relation et n'est pas partie au contrat de transport entre conducteurs et passagers. Minday ne garantit pas l'exactitude des informations fournies par les utilisateurs. Chaque utilisateur est responsable de ses propres actes lors de l'utilisation de la plateforme."
    },
    {
      title: "6. Paiements",
      content: "Les paiements s'effectuent via les opérateurs de mobile money (MVola, Orange Money, Airtel Money) ou en espèces, selon l'accord entre conducteur et passager. Minday peut prélever une commission sur les transactions. Les tarifs des commissions sont consultables dans notre politique de monétisation."
    },
    {
      title: "7. Comportement des utilisateurs",
      content: "Tout utilisateur s'engage à adopter un comportement respectueux envers les autres membres de la communauté Minday. Sont strictement interdits : la publication de fausses informations, les comportements abusifs ou discriminatoires, l'utilisation frauduleuse de la plateforme."
    },
    {
      title: "8. Modification des CGU",
      content: "Minday se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication sur la plateforme. L'utilisation continue de nos services après publication constitue une acceptation tacite des nouvelles conditions."
    },
    {
      title: "9. Droit applicable",
      content: "Les présentes CGU sont soumises au droit malgache. Tout litige relatif à leur interprétation ou exécution sera soumis aux tribunaux compétents d'Antananarivo, Madagascar."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to={createPageUrl("Home")} className="hover:text-[#1A3C6E]">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700">Conditions d'utilisation</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#EEF4FF] rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#1A3C6E]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Conditions Générales d'Utilisation</h1>
            <p className="text-sm text-gray-500">Dernière mise à jour : 25 février 2026</p>
          </div>
        </div>

        <div className="bg-[#EEF4FF] rounded-2xl p-5 mb-8">
          <p className="text-sm text-[#1A3C6E] leading-relaxed">
            Ces conditions régissent votre utilisation de la plateforme Minday. Veuillez les lire attentivement avant d'utiliser nos services.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h2 className="text-base font-bold text-gray-900 mb-3">{s.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{s.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-400">
          Des questions ? <a href="mailto:minday.transport@gmail.com" className="text-[#1A3C6E] hover:underline">Contactez-nous</a>
        </div>
      </motion.div>
    </div>
  );
}