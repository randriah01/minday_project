import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Car, Banknote, Star, Info, CheckCheck, X } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/components/utils";
import { useNavigate } from "react-router-dom";

const TYPE_ICONS = {
  booking: Car,
  trip: Car,
  payment: Banknote,
  review: Star,
  system: Info,
};

const TYPE_LINKS = {
  booking: "MyTrips",
  trip: "MyTrips",
  payment: "Dashboard",
  review: "Profile",
  system: "Profile",
};

export default function NotificationsDropdown({ userEmail }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", userEmail],
    queryFn: () => base44.entities.Notification.filter({ user_email: userEmail }, "-created_date", 20),
    enabled: !!userEmail,
    refetchInterval: 30000,
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

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unread = notifications.filter((n) => !n.is_read);

  const handleNotifClick = (notif) => {
    if (!notif.is_read) markReadMutation.mutate(notif.id);
    const page = notif.link || TYPE_LINKS[notif.type] || "Home";
    setOpen(false);
    navigate(createPageUrl(page));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {unread.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#1A3C6E] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900">Notifications</span>
                {unread.length > 0 && (
                  <span className="bg-[#1A3C6E] text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{unread.length}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread.length > 0 && (
                  <button onClick={() => markAllReadMutation.mutate()} className="text-xs text-[#1A3C6E] hover:underline flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" /> Tout lire
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">Aucune notification</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = TYPE_ICONS[notif.type] || Info;
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0 ${!notif.is_read ? "bg-[#EEF4FF]/50" : ""}`}
                    >
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${notif.is_read ? "bg-gray-100" : "bg-[#1A3C6E]/10"}`}>
                        <Icon className={`w-4 h-4 ${notif.is_read ? "text-gray-400" : "text-[#1A3C6E]"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium leading-snug ${notif.is_read ? "text-gray-600" : "text-gray-900"}`}>{notif.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {notif.created_date && format(new Date(notif.created_date), "d MMM à HH:mm", { locale: fr })}
                        </p>
                      </div>
                      {!notif.is_read && <div className="w-2 h-2 rounded-full bg-[#1A3C6E] mt-2 flex-shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}