import React, { useState } from "react";
import { base44 } from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Star, CheckCircle } from "lucide-react";
import { StarPicker } from "@/components/StarRating";
import { motion, AnimatePresence } from "framer-motion";

export default function LeaveReviewModal({ isOpen, onClose, reviewer, reviewedUser, context = "carpooling" }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => base44.entities.UserReview.create({
      reviewer_email: reviewer.email,
      reviewer_name: reviewer.full_name,
      reviewed_user_email: reviewedUser.email,
      reviewed_user_name: reviewedUser.full_name || reviewedUser.name,
      rating,
      comment,
      context,
    }),
    onSuccess: () => {
      setDone(true);
      queryClient.invalidateQueries(["userReviews", reviewedUser.email]);
      setTimeout(() => {
        setDone(false);
        setRating(0);
        setComment("");
        onClose();
      }, 1800);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
      >
        {done ? (
          <div className="text-center py-6">
            <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900">Merci pour votre avis !</h3>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Laisser un avis</h3>
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1A3C6E] to-[#2B5BA8] flex items-center justify-center text-white font-bold text-lg overflow-hidden shrink-0">
                {reviewedUser.photo_url
                  ? <img src={reviewedUser.photo_url} alt="" className="w-full h-full object-cover" />
                  : (reviewedUser.full_name || reviewedUser.name || "?")[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{reviewedUser.full_name || reviewedUser.name}</p>
                <p className="text-xs text-gray-500">Votre expérience avec cet utilisateur</p>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm text-gray-600 mb-3 font-medium">Votre note</p>
              <StarPicker value={rating} onChange={setRating} />
              <p className="text-xs text-gray-400 mt-2">
                {rating === 0 && "Sélectionnez une note"}
                {rating === 1 && "Très déçu"}
                {rating === 2 && "Déçu"}
                {rating === 3 && "Correct"}
                {rating === 4 && "Bien"}
                {rating === 5 && "Excellent !"}
              </p>
            </div>

            <div className="mb-5">
              <label className="text-sm text-gray-600 mb-2 block font-medium">Commentaire (optionnel)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Décrivez votre expérience..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]/20 focus:border-[#1A3C6E] h-24 resize-none"
              />
            </div>

            <button
              onClick={() => mutation.mutate()}
              disabled={rating === 0 || mutation.isPending}
              className="w-full bg-[#1A3C6E] text-white font-bold py-3 rounded-xl hover:bg-[#2B5BA8] transition-colors disabled:opacity-40 text-sm"
            >
              {mutation.isPending ? "Envoi en cours..." : "Publier mon avis"}
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
