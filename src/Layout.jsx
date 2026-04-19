import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { base44 } from "@/api/base44Client";
import MindayLogo from "@/components/MindayLogo";

import {
  Home,
  Search,
  PlusCircle,
  User,
  Car,
  LayoutDashboard,
  LogOut,
  Shield,
  ChevronDown,
  Package
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationsDropdown from "@/components/NotificationsDropdown";

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [_notifications, setNotifications] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadUser = async () => {
    try {
      const me = await base44.auth.me();
      setUser(me);
    } catch (e) {}
  };

  const loadNotifications = async () => {};

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const isAdmin = user?.role === "admin";

  const bottomNavItems = [
    { icon: Home, label: "Accueil", page: "Home" },
    { icon: Search, label: "Trajets", page: "SearchTrips" },
    { icon: Package, label: "Colis", page: "SearchParcels" },
    ...(user ? [{ icon: PlusCircle, label: "Publier", page: "PublishTrip" }] : []),
    ...(user ? [{ icon: User, label: "Profil", page: "Profile" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col">
      {/* Desktop Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-1 shrink-0">
              <MindayLogo size="md" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to={createPageUrl("SearchTrips")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPageName === "SearchTrips"
                    ? "bg-[#1A3C6E]/10 text-[#1A3C6E]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Rechercher un trajet
              </Link>
              {user && (
                <Link
                  to={createPageUrl("PublishTrip")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === "PublishTrip"
                      ? "bg-[#1A3C6E]/10 text-[#1A3C6E]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Publier un trajet
                </Link>
              )}
              {user && (
                <Link
                  to={createPageUrl("MyTrips")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === "MyTrips"
                      ? "bg-[#1A3C6E]/10 text-[#1A3C6E]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Mes trajets
                </Link>
              )}
              <Link
                to={createPageUrl("SearchParcels")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  currentPageName === "SearchParcels" || currentPageName === "PublishParcel"
                    ? "bg-[#1A3C6E]/10 text-[#1A3C6E]"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Package className="w-4 h-4" /> Colis
              </Link>
              {user && (
                <Link
                  to={createPageUrl("Dashboard")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === "Dashboard"
                      ? "bg-[#1A3C6E]/10 text-[#1A3C6E]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Tableau de bord
                </Link>
              )}
              {isAdmin && (
                <Link
                  to={createPageUrl("AdminPanel")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentPageName === "AdminPanel"
                      ? "bg-[#1A3C6E]/10 text-[#1A3C6E]"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Admin
                  </div>
                </Link>
              )}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {user && <NotificationsDropdown userEmail={user.email} />}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] flex items-center justify-center text-white text-sm font-semibold">
                      {user.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 max-w-24 truncate">{user.full_name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                  </button>

                  <AnimatePresence>
                    {profileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-50">
                          <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link to={createPageUrl("Profile")} onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <User className="w-4 h-4" /> Mon profil
                          </Link>
                          <Link to={createPageUrl("Dashboard")} onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <LayoutDashboard className="w-4 h-4" /> Tableau de bord
                          </Link>
                          <Link to={createPageUrl("MyVehicles")} onClick={() => setProfileMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                            <Car className="w-4 h-4" /> Mes véhicules
                          </Link>
                        </div>
                        <div className="border-t border-gray-50 py-1">
                          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full">
                            <LogOut className="w-4 h-4" /> Déconnexion
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => base44.auth.redirectToLogin()}
                  className="bg-[#1A3C6E] text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-[#2B5BA8] transition-colors shadow-sm"
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">{children}</main>

      {/* Footer */}
      <footer className="hidden md:block bg-[#0D1B2A] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="md:col-span-2">
              <MindayLogo size="md" light />
              <p className="text-white/50 text-sm mt-4 leading-relaxed max-w-sm">
                La plateforme de covoiturage de référence à Madagascar. Voyagez plus loin, dépensez moins.
              </p>
              <div className="flex gap-3 mt-5">
                {/* Social icons */}
                {["f", "in", "tw"].map((s, i) => (
                  <div key={i} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-[#1A3C6E] flex items-center justify-center cursor-pointer transition-colors">
                    <span className="text-white text-xs font-bold">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Navigation</h4>
              <ul className="space-y-2">
                {[
                  { label: "Rechercher un trajet", page: "SearchTrips" },
                  { label: "Publier un trajet", page: "PublishTrip" },
                  { label: "Mes trajets", page: "MyTrips" },
                  { label: "Mon profil", page: "Profile" },
                ].map((item, i) => (
                  <li key={i}>
                    <Link to={createPageUrl(item.page)} className="text-white/50 hover:text-white text-sm transition-colors">{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Informations</h4>
              <ul className="space-y-2">
                <li><Link to={createPageUrl("TermsOfUse")} className="text-white/50 hover:text-white text-sm transition-colors">Conditions d'utilisation</Link></li>
                <li><Link to={createPageUrl("PrivacyPolicy")} className="text-white/50 hover:text-white text-sm transition-colors">Politique de confidentialité</Link></li>
                <li><Link to={createPageUrl("HelpCenter")} className="text-white/50 hover:text-white text-sm transition-colors">Centre d'aide</Link></li>
                <li><Link to={createPageUrl("ContactUs")} className="text-white/50 hover:text-white text-sm transition-colors">Nous contacter</Link></li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-white/40 text-xs">minday.transport@gmail.com</p>
                <p className="text-white/40 text-xs mt-1">+261 34 91 724 34</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-white/30 text-xs">© 2026 Minday. Tous droits réservés.</p>
            <p className="text-white/30 text-xs">La plateforme de covoiturage à Madagascar</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
        <div className="flex items-center justify-around py-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPageName === item.page;
            return (
              <Link
                key={item.page}
                to={createPageUrl(item.page)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                  isActive ? "text-[#1A3C6E]" : "text-gray-400"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {profileMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setProfileMenuOpen(false)} />
      )}
    </div>
  );
}