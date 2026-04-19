import React from "react";
import { CheckCircle, Clock, AlertTriangle, XCircle, ZapIcon, ShieldCheck } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    label: "En attente",
    color: "bg-gray-100 text-gray-600",
    icon: Clock,
    dot: "bg-gray-400"
  },
  auto_verified: {
    label: "Vérifié par IA",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle,
    dot: "bg-green-500"
  },
  flagged: {
    label: "Révision requise",
    color: "bg-orange-100 text-orange-700",
    icon: AlertTriangle,
    dot: "bg-orange-500"
  },
  approved: {
    label: "Approuvé",
    color: "bg-green-100 text-green-700",
    icon: ShieldCheck,
    dot: "bg-green-600"
  },
  rejected: {
    label: "Rejeté",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
    dot: "bg-red-500"
  }
};

export default function DocumentVerificationStatus({ verData, isVerifying, showScore = false }) {
  if (isVerifying) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">
        <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        Analyse IA...
      </span>
    );
  }

  if (!verData || !verData.status) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full">
        <Clock className="w-3 h-3" /> Non soumis
      </span>
    );
  }

  const config = STATUS_CONFIG[verData.status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
      {showScore && verData.ai_score != null && (
        <span className="text-xs text-gray-500 flex items-center gap-1">
          <ZapIcon className="w-3 h-3 text-yellow-400" />
          {verData.ai_score}%
        </span>
      )}
    </div>
  );
}