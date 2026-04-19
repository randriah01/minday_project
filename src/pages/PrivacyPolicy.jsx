import React from "react";
import { motion } from "framer-motion";
import { Lock, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "1. Responsable du traitement",
      content: "Minday (minday.transport@gmail.com) est le responsable du traitement de vos données personnelles. Pour toute question relative à vos données, contactez-nous à : minday.transport@gmail.com ou au +261 34 91 724 34."
    },
    {
      title: "2. Données collectées",
      content: "Nous collectons les informations suivantes : données d'identité (nom, email), coordonnées (téléphone, ville), données de paiement (numéros mobile money), documents d'identité et permis de conduire (pour les conducteurs), données de localisation (lors des trajets), historique des réservations et des trajets, évaluations et commentaires."
    },
    {
      title: "3. Finalités du traitement",
      content: "Vos données sont utilisées pour : la gestion de votre compte, la mise en relation conducteurs/passagers, la vérification de l'identité des conducteurs, le traitement des paiements, l'envoi de notifications liées à vos trajets, l'amélioration de nos services, la lutte contre la fraude."
    },
    {
      title: "4. Vérification des documents",
      content: "Les documents soumis par les conducteurs (permis, assurance, visite technique) sont analysés par notre système d'intelligence artificielle pour en vérifier l'authenticité. Ces documents sont stockés de manière sécurisée et ne sont accessibles qu'à notre équipe de vérification. Ils ne sont jamais partagés avec des tiers sans votre consentement explicite."
    },
    {
      title: "5. Conservation des données",
      content: "Vos données sont conservées pendant la durée de votre utilisation du service, et jusqu'à 3 ans après la suppression de votre compte, conformément aux obligations légales. Les documents de vérification sont conservés pendant la durée du statut de conducteur plus 2 ans."
    },
    {
      title: "6. Sécurité des données",
      content: "Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données : chiffrement des données sensibles, stockage sécurisé des documents, accès restreint aux données personnelles, journalisation de toutes les actions de vérification, audit régulier de nos systèmes."
    },
    {
      title: "7. Vos droits",
      content: "Conformément à la réglementation applicable, vous disposez des droits suivants : accès à vos données, rectification des données inexactes, suppression de vos données (« droit à l'oubli »), opposition au traitement, portabilité de vos données. Pour exercer ces droits, contactez-nous à minday.transport@gmail.com."
    },
    {
      title: "8. Partage des données",
      content: "Nous ne vendons jamais vos données à des tiers. Nous pouvons partager vos informations avec : d'autres utilisateurs dans le cadre d'un trajet (nom, note), nos prestataires techniques dans le strict cadre de nos services, les autorités si la loi l'exige."
    },
    {
      title: "9. Cookies",
      content: "Minday utilise des cookies techniques essentiels au fonctionnement du service. Aucun cookie publicitaire tiers n'est utilisé sans votre consentement."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to={createPageUrl("Home")} className="hover:text-[#1A3C6E]">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700">Politique de confidentialité</span>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-[#EEF4FF] rounded-xl flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#1A3C6E]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Politique de Confidentialité</h1>
            <p className="text-sm text-gray-500">Dernière mise à jour : 25 février 2026</p>
          </div>
        </div>

        <div className="bg-[#EEF4FF] rounded-2xl p-5 mb-8">
          <p className="text-sm text-[#1A3C6E] leading-relaxed">
            La protection de vos données personnelles est une priorité pour Minday. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
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
          Des questions sur vos données ? <a href="mailto:minday.transport@gmail.com" className="text-[#1A3C6E] hover:underline">Contactez-nous</a>
        </div>
      </motion.div>
    </div>
  );
}