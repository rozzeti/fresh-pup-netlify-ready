import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const EMPTY_FORM = { name: "", description: "", basePrice: "", duration: "" };

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/services");
      setServices(data);
    } catch (err) {
      setError("Failed to load services.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (service) => {
    setEditingId(service._id);
    setForm({
      name: service.name,
      description: service.description || "",
      basePrice: service.basePrice,
      duration: service.duration || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await axios.put("/api/services/update", { id: editingId, ...form }, { withCredentials: true });
      } else {
        await axios.post("/api/services/create", form, { withCredentials: true });
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save service.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await axios.delete(`/api/services/delete?id=${id}`, { withCredentials: true });
      fetchServices();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete service.");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-amber-800">Services</h2>
        <button
          onClick={openCreate}
          className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Add Service
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-semibold text-gray-700 mb-4">{editingId ? "Edit Service" : "New Service"}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Base Price ($) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Duration</label>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="e.g. 60 min"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading services…</p>
      ) : services.length === 0 ? (
        <p className="text-gray-400 text-sm">No services yet. Add one above.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <div key={service._id} className="bg-white rounded-xl shadow p-5 flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{service.name}</h3>
                  {service.description && (
                    <p className="text-gray-500 text-sm">{service.description}</p>
                  )}
                </div>
                <span className="text-amber-700 font-bold text-lg">${service.basePrice}</span>
              </div>
              {service.duration && (
                <p className="text-gray-400 text-xs">⏱ {service.duration}</p>
              )}
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => openEdit(service)}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service._id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
