import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { CheckCircle, XCircle, RotateCcw, Eye, ZapIcon, AlertTriangle, ShieldCheck, FileText } from "lucide-react";
import DocumentVerificationStatus from "./DocumentVerificationStatus";

const RISK_COLORS = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-red-100 text-red-700"
};

export default function DocumentReviewCard({ user, docType, docLabel, docUrl, verData, onUpdate }) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    const verificationField = `${docType}_verification`;
    await base44.entities.User.update(user.id, {
      [verificationField]: { ...verData, status: "approved" },
      driver_status: "approved"
    });
    await base44.entities.Notification.create({
      user_email: user.email,
      title: "Document approuvé",
      message: `Votre ${docLabel} a été approuvé par notre équipe. Vous pouvez maintenant publier des trajets !`,
      type: "system"
    });
    setLoading(false);
    onUpdate();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setLoading(true);
    const verificationField = `${docType}_verification`;
    await base44.entities.User.update(user.id, {
      [verificationField]: { ...verData, status: "rejected", rejection_reason: rejectionReason },
      driver_status: "rejected"
    });
    await base44.entities.Notification.create({
      user_email: user.email,
      title: "Document rejeté",
      message: `Votre ${docLabel} a été rejeté. Motif : ${rejectionReason}. Veuillez re-soumettre un document valide.`,
      type: "system"
    });
    setShowRejectForm(false);
    setLoading(false);
    onUpdate();
  };

  const handleRequestReupload = async () => {
    setLoading(true);
    await base44.entities.Notification.create({
      user_email: user.email,
      title: "Re-soumission requise",
      message: `Merci de re-soumettre votre ${docLabel}. Le document soumis n'est pas lisible ou incomplet.`,
      type: "system"
    });
    setLoading(false);
    onUpdate();
  };

  if (!docUrl) return null;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <FileText className="w-4 h-4 text-[#1A3C6E]" />
        <span className="text-sm font-semibold text-gray-900">{docLabel}</span>
        <div className="ml-auto flex items-center gap-2">
          <DocumentVerificationStatus verData={verData} showScore />
          {verData?.risk_level && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RISK_COLORS[verData.risk_level] || "bg-gray-100 text-gray-600"}`}>
              Risque: {verData.risk_level}
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Document Preview */}
        <div className="flex items-start gap-4">
          <div className="w-24 h-24 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex-shrink-0">
            {docUrl.match(/\.(jpg|jpeg|png)$/i) ? (
              <img src={docUrl} alt={docLabel} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                <FileText className="w-8 h-8 text-gray-300" />
                <span className="text-xs text-gray-400">PDF</span>
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <a href={docUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[#1A3C6E] hover:underline">
              <Eye className="w-4 h-4" /> Voir le document en plein écran
            </a>

            {/* AI Score bar */}
            {verData?.ai_score != null && (
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 flex items-center gap-1"><ZapIcon className="w-3 h-3 text-yellow-400" /> Score IA</span>
                  <span className="font-semibold text-gray-900">{verData.ai_score}/100</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${verData.ai_score >= 85 ? "bg-green-500" : verData.ai_score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                    style={{ width: `${verData.ai_score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* OCR Data */}
        {verData?.ocr_data && (
          <div className="bg-[#EEF4FF] rounded-xl p-3">
            <p className="text-xs font-semibold text-[#1A3C6E] mb-2 flex items-center gap-1">
              <ZapIcon className="w-3 h-3" /> Données extraites OCR
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {verData.ocr_data.full_name && <div><span className="text-gray-500">Nom :</span> <span className="font-medium text-gray-800">{verData.ocr_data.full_name}</span></div>}
              {verData.ocr_data.document_number && <div><span className="text-gray-500">N° doc :</span> <span className="font-medium text-gray-800">{verData.ocr_data.document_number}</span></div>}
              {verData.ocr_data.expiration_date && <div><span className="text-gray-500">Expiration :</span> <span className="font-medium text-gray-800">{verData.ocr_data.expiration_date}</span></div>}
              {verData.ocr_data.vehicle_plate && <div><span className="text-gray-500">Plaque :</span> <span className="font-medium text-gray-800">{verData.ocr_data.vehicle_plate}</span></div>}
            </div>
          </div>
        )}

        {/* Authenticity notes */}
        {verData?.authenticity_check?.authenticity_notes && (
          <div className={`rounded-xl p-3 text-xs ${verData.authenticity_check.tampering_detected ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            <span className="font-semibold">Analyse authenticité : </span>
            {verData.authenticity_check.authenticity_notes}
          </div>
        )}

        {/* Rejection reason */}
        {verData?.rejection_reason && (
          <div className="bg-red-50 rounded-xl p-3 text-xs text-red-700">
            <span className="font-semibold">Motif de rejet : </span>{verData.rejection_reason}
          </div>
        )}

        {/* Actions */}
        {verData?.status !== "approved" && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex items-center gap-1 bg-green-600 text-white text-xs px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Approuver
            </button>
            <button
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={loading}
              className="flex items-center gap-1 bg-red-500 text-white text-xs px-3 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-3.5 h-3.5" /> Rejeter
            </button>
            <button
              onClick={handleRequestReupload}
              disabled={loading}
              className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Demander re-upload
            </button>
          </div>
        )}

        {verData?.status === "approved" && (
          <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 px-3 py-2 rounded-lg">
            <ShieldCheck className="w-4 h-4" /> Document approuvé
          </div>
        )}

        {showRejectForm && (
          <div className="space-y-2 pt-2">
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Motif de rejet (visible par le conducteur)..."
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-300 h-20 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={handleReject} disabled={!rejectionReason.trim() || loading}
                className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors">
                Confirmer le rejet
              </button>
              <button onClick={() => setShowRejectForm(false)}
                className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors">
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}