import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, Trash2, Car, Banknote, Star, Info } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";

const TYPE_ICONS = {
  booking: Car,
  trip: Car,
  payment: Banknote,
  review: Star,
  system: Info,
};

export default function Notifications() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user.email }, "-created_date", 50),
    enabled: !!user?.email,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(unread.map((n) => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries(["notifications"]),
  });

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} non lue(s)</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="text-sm text-[#1A3C6E] font-medium hover:underline flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" /> Tout marquer lu
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune notification</h3>
          <p className="text-sm text-gray-500">Vous recevrez des notifications ici</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const Icon = TYPE_ICONS[notif.type] || Info;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !notif.is_read && markReadMutation.mutate(notif.id)}
                className={`bg-white rounded-xl border p-4 flex items-start gap-3 cursor-pointer transition-all ${
                  notif.is_read ? "border-gray-100" : "border-[#1A3C6E]/20 bg-[#EEF4FF]/50"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.is_read ? "bg-gray-100" : "bg-[#1A3C6E]/10"
                }`}>
                  <Icon className={`w-5 h-5 ${notif.is_read ? "text-gray-400" : "text-[#D4A520]"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${notif.is_read ? "text-gray-600" : "text-gray-900"}`}>{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {notif.created_date && format(new Date(notif.created_date), "d MMM à HH:mm", { locale: fr })}
                  </p>
                </div>
                {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[#1A3C6E] mt-2 flex-shrink-0" />}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}