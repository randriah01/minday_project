import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, Star, Zap, Shield, Crown, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { motion } from "framer-motion";
import { format, addMonths, addYears } from "date-fns";
import { fr } from "date-fns/locale";

export default function Subscription() {
  const [user, setUser] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const [success, setSuccess] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: settings = [] } = useQuery({
    queryKey: ["platformSettings"],
    queryFn: () => base44.entities.PlatformSettings.list(),
  });
  const ps = settings[0] || { subscription_monthly_price: 15000, subscription_yearly_price: 150000, subscription_commission_rate: 5, commission_percentage: 10 };

  const { data: existingSubs = [] } = useQuery({
    queryKey: ["mySubscription", user?.email],
    queryFn: () => base44.entities.Subscription.filter({ driver_email: user.email, status: "active" }),
    enabled: !!user?.email,
  });
  const activeSub = existingSubs[0];

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const today = new Date();
      const endDate = selectedPlan === "monthly" ? addMonths(today, 1) : addYears(today, 1);
      await base44.entities.Subscription.create({
        driver_email: user.email,
        plan: selectedPlan,
        status: "active",
        start_date: format(today, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        amount_paid: selectedPlan === "monthly" ? ps.subscription_monthly_price : ps.subscription_yearly_price,
      });
    },
    onSuccess: () => {
      setSuccess(true);
      queryClient.invalidateQueries(["mySubscription"]);
    },
  });

  const formatPrice = (p) => new Intl.NumberFormat("fr-MG").format(p) + " Ar";

  if (!user) return null;

  return (
    <div className="bg-[#F4F7FB] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link to={createPageUrl("Dashboard")} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        {/* Active sub banner */}
        {activeSub && (
          <div className="bg-[#1A3C6E] text-white rounded-2xl p-5 mb-8 flex items-center gap-4">
            <Crown className="w-8 h-8 text-yellow-300 shrink-0" />
            <div>
              <p className="font-bold text-lg">Abonnement Premium actif</p>
              <p className="text-white/70 text-sm">Plan {activeSub.plan === "monthly" ? "mensuel" : "annuel"} · Expire le {format(new Date(activeSub.end_date), "d MMMM yyyy", { locale: fr })}</p>
            </div>
          </div>
        )}

        {success ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Abonnement activé !</h2>
            <p className="text-gray-500 mb-6">Profitez de tous les avantages Premium Minday.</p>
            <Link to={createPageUrl("PublishTrip")} className="inline-block bg-[#1A3C6E] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#2B5BA8] transition-colors">
              Publier un trajet
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-10">
              <span className="text-xs font-semibold text-[#1A3C6E] uppercase tracking-widest">Conducteurs</span>
              <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-3">Passez à Minday Premium</h1>
              <p className="text-gray-500 max-w-xl mx-auto">Moins de frais, plus de visibilité, publications illimitées.</p>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${selectedPlan === "monthly" ? "bg-[#1A3C6E] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"}`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setSelectedPlan("yearly")}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${selectedPlan === "yearly" ? "bg-[#1A3C6E] text-white shadow-md" : "bg-white text-gray-600 border border-gray-200"}`}
              >
                Annuel <span className="ml-1 text-xs text-green-500 font-bold">-17%</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Free plan */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Standard</h3>
                <p className="text-gray-500 text-sm mb-4">Pour commencer</p>
                <p className="text-3xl font-extrabold text-gray-900 mb-6">Gratuit</p>
                <ul className="space-y-3 text-sm text-gray-600">
                  {[
                    `Commission de ${ps.commission_percentage}% par trajet`,
                    "Publication de trajets",
                    "Accès à la plateforme",
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-300" /> {f}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Premium plan */}
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] rounded-2xl p-6 text-white relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Premium
                </div>
                <h3 className="text-lg font-bold mb-1">Premium</h3>
                <p className="text-white/70 text-sm mb-4">Pour les conducteurs actifs</p>
                <p className="text-3xl font-extrabold mb-1">
                  {selectedPlan === "monthly" ? formatPrice(ps.subscription_monthly_price) : formatPrice(ps.subscription_yearly_price)}
                </p>
                <p className="text-white/60 text-xs mb-6">/{selectedPlan === "monthly" ? "mois" : "an"}</p>
                <ul className="space-y-3 text-sm text-white/90 mb-6">
                  {[
                    `Commission réduite à ${ps.subscription_commission_rate}%`,
                    "Publications illimitées",
                    "Mise en avant dans les résultats",
                    "Badge conducteur vérifié Premium",
                    "Support prioritaire",
                  ].map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-yellow-300" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => subscribeMutation.mutate()}
                  disabled={subscribeMutation.isPending || !!activeSub}
                  className="w-full bg-white text-[#1A3C6E] font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
                >
                  {activeSub ? "Déjà abonné" : subscribeMutation.isPending ? "Activation..." : "S'abonner maintenant"}
                </button>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}