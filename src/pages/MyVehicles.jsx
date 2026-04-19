import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Car, Plus, Trash2, Edit2, X, Save, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function MyVehicles() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ brand: "", model: "", plate_number: "", seats: "", color: "" });
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => base44.auth.redirectToLogin());
  }, []);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles", user?.email],
    queryFn: () => base44.entities.Vehicle.filter({ driver_email: user.email }),
    enabled: !!user?.email,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Vehicle.create({ ...data, driver_email: user.email, seats: parseInt(data.seats) }),
    onSuccess: () => {
      queryClient.invalidateQueries(["vehicles"]);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Vehicle.update(id, { ...data, seats: parseInt(data.seats) }),
    onSuccess: () => {
      queryClient.invalidateQueries(["vehicles"]);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Vehicle.delete(id),
    onSuccess: () => queryClient.invalidateQueries(["vehicles"]),
  });

  const resetForm = () => {
    setForm({ brand: "", model: "", plate_number: "", seats: "", color: "" });
    setShowForm(false);
    setEditingId(null);
  };

  const startEdit = (v) => {
    setForm({ brand: v.brand, model: v.model, plate_number: v.plate_number, seats: String(v.seats), color: v.color || "" });
    setEditingId(v.id);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes véhicules</h1>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#D4A520] hover:bg-[#B8891A] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{editingId ? "Modifier" : "Nouveau véhicule"}</h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Marque</label>
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Toyota" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]/30 focus:border-[#D4A520]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Modèle</label>
                  <input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} placeholder="Hilux" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]/30 focus:border-[#D4A520]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Immatriculation</label>
                  <input value={form.plate_number} onChange={(e) => setForm({ ...form, plate_number: e.target.value })} placeholder="1234 TAA" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]/30 focus:border-[#D4A520]" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Nombre de places</label>
                  <input type="number" value={form.seats} onChange={(e) => setForm({ ...form, seats: e.target.value })} placeholder="4" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]/30 focus:border-[#D4A520]" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 block mb-1">Couleur</label>
                  <input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="Blanc" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A520]/30 focus:border-[#D4A520]" />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!form.brand || !form.model || !form.plate_number || !form.seats || createMutation.isPending || updateMutation.isPending}
                className="mt-4 w-full bg-[#D4A520] text-white font-semibold py-3 rounded-xl hover:bg-[#B8891A] transition-all disabled:opacity-40 text-sm"
              >
                {editingId ? "Enregistrer" : "Ajouter le véhicule"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {vehicles.length === 0 && !showForm ? (
        <div className="text-center py-16">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucun véhicule</h3>
          <p className="text-sm text-gray-500">Ajoutez votre véhicule pour publier des trajets</p>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles.map((v) => (
            <div key={v.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#D4A520]/10 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-[#D4A520]" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{v.brand} {v.model}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span>{v.plate_number}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{v.seats} places</span>
                    {v.color && <span>{v.color}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => startEdit(v)} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => deleteMutation.mutate(v.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}