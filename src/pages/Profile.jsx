import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import {
  User, Mail, Phone, MapPin, Star, Shield, Camera, Car,
  Upload, FileText, CheckCircle, Clock, AlertCircle, CreditCard,
  ZapIcon, Eye, RotateCcw, ExternalLink
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import DocumentVerificationStatus from "@/components/driver/DocumentVerificationStatus";
import { StarDisplay } from "@/components/StarRating";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/components/utils";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    phone: "", bio: "", city: "",
    mobile_money_number: "", mobile_money_provider: "MVola"
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({});
  const [verifying, setVerifying] = useState({});

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setForm({
        phone: u.phone || "",
        bio: u.bio || "",
        city: u.city || "",
        mobile_money_number: u.mobile_money_number || "",
        mobile_money_provider: u.mobile_money_provider || "MVola",
      });
    }).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: reviews = [] } = useQuery({
    queryKey: ["userReviews", user?.email],
    queryFn: () => base44.entities.UserReview.filter({ reviewed_user_email: user.email }, "-created_date", 20),
    enabled: !!user?.email,
  });

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe(form);
    setUser({ ...user, ...form });
    setEditing(false);
    setSaving(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ photo_url: file_url });
    setUser({ ...user, photo_url: file_url });
  };

  const handleDocUpload = async (e, field, docType) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("Fichier trop grand (max 10 Mo)"); return; }
    const allowed = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowed.includes(file.type)) { alert("Format non accepté (JPEG, PNG, PDF uniquement)"); return; }

    setUploading((prev) => ({ ...prev, [field]: true }));
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const update = { [field]: file_url };
    if (!user.driver_status) update.driver_status = "pending";
    // Clear old verification for this doc
    const verificationField = `${docType}_verification`;
    update[verificationField] = { status: "pending" };

    await base44.auth.updateMe(update);
    setUser({ ...user, ...update });
    setUploading((prev) => ({ ...prev, [field]: false }));

    // Trigger AI verification automatically
    triggerVerification(file_url, docType, { ...user, ...update });
  };

  const triggerVerification = async (doc_url, docType, currentUser) => {
    setVerifying((prev) => ({ ...prev, [docType]: true }));
    const response = await base44.functions.invoke("verifyDocument", {
      document_url: doc_url,
      document_type: docType,
      user_id: currentUser.id
    });
    const updatedUser = await base44.auth.me();
    setUser(updatedUser);
    setVerifying((prev) => ({ ...prev, [docType]: false }));
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const driverStatusBadge = {
    pending: { label: "En attente de vérification", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    approved: { label: "Conducteur vérifié ✓", color: "bg-green-100 text-green-700", icon: CheckCircle },
    rejected: { label: "Documents rejetés", color: "bg-red-100 text-red-700", icon: AlertCircle },
    flagged: { label: "Vérification manuelle requise", color: "bg-orange-100 text-orange-700", icon: AlertCircle },
  };

  if (!user) return null;

  const isDriver = true; // All users can submit documents to become a driver
  const statusInfo = user.driver_status ? driverStatusBadge[user.driver_status] : null;

  const docFields = [
    { label: "Permis de conduire", field: "license_url", docType: "license", icon: FileText, description: "Permis de conduire valide (JPEG, PNG, PDF, max 10 Mo)" },
    { label: "Assurance véhicule", field: "insurance_url", docType: "insurance", icon: Shield, description: "Certificat d'assurance en cours de validité" },
    { label: "Visite technique", field: "technical_inspection_url", docType: "technical_inspection", icon: Car, description: "Contrôle technique valide (si applicable)" },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {user.photo_url
                  ? <img src={user.photo_url} alt="" className="w-full h-full object-cover" />
                  : user.full_name?.[0]?.toUpperCase() || "U"}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-500" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 truncate">{user.full_name}</h1>
                <Link to={createPageUrl("UserProfile") + `?email=${user.email}`} className="text-gray-400 hover:text-[#1A3C6E] transition-colors" title="Voir mon profil public">
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className="bg-[#1A3C6E]/10 text-[#1A3C6E] border-0">
                  {user.role === "driver" ? "Conducteur" : user.role === "admin" ? "Admin" : "Passager"}
                </Badge>
                {avgRating && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <StarDisplay rating={parseFloat(avgRating)} size="sm" />
                    <span className="font-semibold">{avgRating}</span>
                    <span className="text-gray-400">({reviews.length} avis)</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {statusInfo && (
            <div className={`mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl ${statusInfo.color} text-sm font-medium`}>
              <statusInfo.icon className="w-4 h-4" />
              {statusInfo.label}
            </div>
          )}
        </div>

        {/* Personal Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={saving}
              className="text-sm text-[#1A3C6E] font-medium hover:underline"
            >
              {editing ? (saving ? "Sauvegarde..." : "Sauvegarder") : "Modifier"}
            </button>
          </div>
          <div className="space-y-4">
            {[
              { label: "Téléphone", field: "phone", placeholder: "+261 34 00 000 00", icon: Phone },
              { label: "Ville", field: "city", placeholder: "Antananarivo", icon: MapPin },
            ].map(({ label, field, placeholder, icon: Icon }) => (
              <div key={field}>
                <label className="text-xs text-gray-500 block mb-1">{label}</label>
                {editing ? (
                  <input
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]"
                  />
                ) : (
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <Icon className="w-4 h-4 text-gray-400" />
                    {user[field] || "Non renseigné"}
                  </p>
                )}
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 block mb-1">Bio</label>
              {editing ? (
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Parlez de vous..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E] h-24 resize-none"
                />
              ) : (
                <p className="text-sm text-gray-900">{user.bio || "Non renseigné"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Money Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#1A3C6E]" /> Paiement mobile money
          </h2>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Opérateur</label>
                <select
                  value={form.mobile_money_provider}
                  onChange={(e) => setForm({ ...form, mobile_money_provider: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]"
                >
                  <option value="MVola">MVola</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Numéro de paiement</label>
                <input
                  value={form.mobile_money_number}
                  onChange={(e) => setForm({ ...form, mobile_money_number: e.target.value })}
                  placeholder="034 XX XXX XX"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E]"
                />
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-700 space-y-1">
              <p><span className="text-gray-500">Opérateur :</span> {user.mobile_money_provider || "Non renseigné"}</p>
              <p><span className="text-gray-500">Numéro :</span> {user.mobile_money_number || "Non renseigné"}</p>
              {!user.mobile_money_number && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2 mt-2">
                  ⚠️ Renseignez votre numéro pour que les passagers puissent vous payer.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Driver Documents */}
        {isDriver && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#1A3C6E]" /> Documents conducteur
              </h2>

              <span className="ml-auto flex items-center gap-1 text-xs bg-[#EEF4FF] text-[#1A3C6E] px-2 py-1 rounded-full font-medium">
                <ZapIcon className="w-3 h-3" /> Vérification IA
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              Soumettez vos documents pour pouvoir publier des trajets. Ils sont vérifiés automatiquement par notre IA.
            </p>
            <div className="space-y-5">
              {docFields.map(({ label, field, docType, icon: Icon, description }) => {
                const verificationKey = `${docType}_verification`;
                const verData = user[verificationKey];
                const isUploading = uploading[field];
                const isVerifying = verifying[docType];

                return (
                  <div key={field} className="rounded-xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <Icon className="w-4 h-4 text-[#1A3C6E]" />
                      <span className="text-sm font-medium text-gray-900">{label}</span>
                      <div className="ml-auto">
                        <DocumentVerificationStatus verData={verData} isVerifying={isVerifying} />
                      </div>
                    </div>
                    <div className="p-4">
                      {user[field] ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <a href={user[field]} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 text-sm text-[#1A3C6E] hover:underline">
                              <Eye className="w-4 h-4" /> Voir le document
                            </a>
                            <label className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-[#1A3C6E] cursor-pointer transition-colors">
                              <RotateCcw className="w-3 h-3" /> Remplacer
                              <input type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" className="hidden"
                                onChange={(e) => handleDocUpload(e, field, docType)} />
                            </label>
                          </div>
                          {verData?.ocr_data && Object.keys(verData.ocr_data).some(k => verData.ocr_data[k]) && (
                            <div className="bg-blue-50 rounded-lg p-3 text-xs space-y-1">
                              <p className="font-semibold text-[#1A3C6E] mb-2">Données extraites par OCR :</p>
                              {verData.ocr_data.full_name && <p><span className="text-gray-500">Nom :</span> {verData.ocr_data.full_name}</p>}
                              {verData.ocr_data.document_number && <p><span className="text-gray-500">N° document :</span> {verData.ocr_data.document_number}</p>}
                              {verData.ocr_data.expiration_date && <p><span className="text-gray-500">Expiration :</span> {verData.ocr_data.expiration_date}</p>}
                              {verData.ocr_data.vehicle_plate && <p><span className="text-gray-500">Plaque :</span> {verData.ocr_data.vehicle_plate}</p>}
                            </div>
                          )}
                          {verData?.rejection_reason && (
                            <div className="bg-red-50 rounded-lg p-3 text-xs text-red-700">
                              <span className="font-semibold">Motif de rejet :</span> {verData.rejection_reason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <label className={`flex items-center gap-3 p-4 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${isUploading ? "border-[#1A3C6E] bg-blue-50" : "border-gray-200 hover:border-[#1A3C6E]/50 hover:bg-gray-50"}`}>
                          {isUploading ? (
                            <div className="w-5 h-5 border-2 border-[#1A3C6E] border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Upload className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <p className="text-sm text-gray-700 font-medium">
                              {isUploading ? "Téléchargement en cours..." : "Cliquez pour uploader"}
                            </p>
                            <p className="text-xs text-gray-400">{description}</p>
                          </div>
                          <input type="file" accept="image/jpeg,image/png,image/jpg,application/pdf" className="hidden"
                            onChange={(e) => handleDocUpload(e, field, docType)} disabled={isUploading} />
                        </label>
                      )}
                      {isVerifying && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-[#1A3C6E] bg-blue-50 px-3 py-2 rounded-lg">
                          <div className="w-3 h-3 border-2 border-[#1A3C6E] border-t-transparent rounded-full animate-spin" />
                          Analyse IA en cours — authentification, OCR, vérification...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Avis reçus ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun avis reçu pour le moment</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{r.reviewer_name || "Anonyme"}</span>
                      {r.context && (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                          {r.context === "carpooling" ? "🚗" : "📦"}
                        </span>
                      )}
                    </div>
                    <StarDisplay rating={r.rating} size="sm" />
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}