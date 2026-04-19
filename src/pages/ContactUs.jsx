import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle, ChevronRight, Clock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";
import { base44 } from "@/api/base44Client";

export default function ContactUs() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: "minday.transport@gmail.com",
      from_name: form.name,
      subject: `[Minday Contact] ${form.subject || "Nouveau message"}`,
      body: `Nom: ${form.name}\nEmail: ${form.email}\nSujet: ${form.subject}\n\nMessage:\n${form.message}`
    });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link to={createPageUrl("Home")} className="hover:text-[#1A3C6E]">Accueil</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-700">Nous contacter</span>
        </div>

        <div className="text-center mb-10">
          <div className="w-12 h-12 bg-[#EEF4FF] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6 text-[#1A3C6E]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Contactez Minday</h1>
          <p className="text-gray-500 text-sm">Notre équipe vous répondra dans les plus brefs délais</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Contact Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
              <h2 className="font-semibold text-gray-900">Informations de contact</h2>

              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "minday.transport@gmail.com",
                  href: "mailto:minday.transport@gmail.com",
                  color: "bg-blue-50 text-blue-600"
                },
                {
                  icon: Phone,
                  label: "Téléphone",
                  value: "+261 34 91 724 34",
                  href: "tel:+261349172434",
                  color: "bg-green-50 text-green-600"
                },
                {
                  icon: MapPin,
                  label: "Adresse",
                  value: "Antananarivo, Madagascar",
                  color: "bg-orange-50 text-orange-600"
                },
                {
                  icon: Clock,
                  label: "Horaires",
                  value: "Lun–Ven : 8h–18h",
                  color: "bg-purple-50 text-purple-600"
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm font-medium text-gray-900 hover:text-[#1A3C6E] transition-colors">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-[#0D1B2A] rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm mb-2">Besoin d'aide rapide ?</h3>
              <p className="text-white/60 text-xs leading-relaxed mb-4">
                Consultez notre centre d'aide pour trouver des réponses immédiates à vos questions.
              </p>
              <Link to={createPageUrl("HelpCenter")}
                className="inline-flex items-center gap-2 bg-[#1A3C6E] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#2B5BA8] transition-colors">
                Centre d'aide <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Message envoyé !</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Merci pour votre message. Notre équipe vous répondra sous 24–48h.
                  </p>
                  <button
                    onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="text-sm text-[#1A3C6E] hover:underline"
                  >
                    Envoyer un autre message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-semibold text-gray-900 mb-4">Envoyer un message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Votre nom *</label>
                      <input
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="Jean Rakoto"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Votre email *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        placeholder="jean@email.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Sujet</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]"
                    >
                      <option value="">Sélectionnez un sujet</option>
                      <option value="Problème de réservation">Problème de réservation</option>
                      <option value="Vérification de documents">Vérification de documents</option>
                      <option value="Problème de paiement">Problème de paiement</option>
                      <option value="Signalement">Signalement</option>
                      <option value="Compte et profil">Compte et profil</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Message *</label>
                    <textarea
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Décrivez votre demande en détail..."
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E] resize-none"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={sending || !form.name || !form.email || !form.message}
                    className="w-full bg-[#1A3C6E] text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-[#2B5BA8] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Envoi en cours...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Envoyer le message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}