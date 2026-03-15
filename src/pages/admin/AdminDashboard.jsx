import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ServiceManager from "./ServiceManager";
import AvailabilityManager from "./AvailabilityManager";
import BookingsList from "./BookingsList";

const TABS = [
  { id: "bookings", label: "📋 Bookings" },
  { id: "services", label: "✂️ Services" },
  { id: "availability", label: "📅 Availability" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch {
      // ignore errors on logout
    } finally {
      navigate("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐾</span>
          <h1 className="text-xl font-bold text-amber-800">Fresh Pup Admin</h1>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-sm text-gray-500 hover:text-red-600 transition disabled:opacity-60"
        >
          {loggingOut ? "Logging out…" : "Log Out"}
        </button>
      </header>

      {/* Tabs */}
      <nav className="bg-white border-b px-6 flex gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === tab.id
                ? "border-amber-500 text-amber-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "bookings" && <BookingsList />}
        {activeTab === "services" && <ServiceManager />}
        {activeTab === "availability" && <AvailabilityManager />}
      </main>
    </div>
  );
}
