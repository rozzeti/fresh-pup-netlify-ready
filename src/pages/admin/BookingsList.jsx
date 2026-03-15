import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/bookings/list", { withCredentials: true });
      setBookings(data);
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Session expired. Please log in again.");
      } else {
        setError("Failed to load bookings.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-amber-800">Bookings</h2>
        <button
          onClick={fetchBookings}
          className="text-sm text-amber-600 hover:text-amber-800 font-medium"
        >
          ↻ Refresh
        </button>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading bookings…</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-400 text-sm">No bookings yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-amber-50 text-amber-800 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Owner</th>
                <th className="px-4 py-3 text-left">Dog</th>
                <th className="px-4 py-3 text-left">Service</th>
                <th className="px-4 py-3 text-left">Date & Time</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const dateStr = booking.date
                  ? (() => {
                      try { return format(new Date(booking.date), "MMM d, yyyy"); }
                      catch { return booking.date; }
                    })()
                  : "—";
                const status = booking.status || "pending";
                return (
                  <tr key={booking._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{booking.ownerName || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{booking.dogName || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{booking.service?.name || booking.service || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{dateStr} {booking.time ? `@ ${booking.time}` : ""}</td>
                    <td className="px-4 py-3 text-gray-600">{booking.phone || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || STATUS_COLORS.pending}`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {booking.totalPrice != null ? `$${Number(booking.totalPrice).toFixed(2)}` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
