import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";

const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

export default function AvailabilityManager() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [blockedDates, setBlockedDates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAvailability = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get("/api/availability");
      const map = {};
      data.forEach((entry) => {
        map[entry.date] = entry;
      });
      setBlockedDates(map);
    } catch {
      setError("Failed to load availability.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const firstDayOffset = getDay(startOfMonth(currentMonth));

  const handleDayClick = (day) => {
    setSelectedDate(day);
  };

  const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedEntry = selectedKey ? blockedDates[selectedKey] : null;
  const isBlocked = selectedEntry?.blocked !== false;

  const toggleBlock = async () => {
    if (!selectedKey) return;
    setSaving(true);
    setError("");
    try {
      await axios.post(
        "/api/availability/block",
        { date: selectedKey, blocked: !isBlocked },
        { withCredentials: true }
      );
      fetchAvailability();
    } catch {
      setError("Failed to update availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-amber-800 mb-6">Availability</h2>
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="bg-white rounded-xl shadow p-6 max-w-md">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Previous month"
          >
            ‹
          </button>
          <span className="font-semibold text-gray-700">{format(currentMonth, "MMMM yyyy")}</span>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-1 hover:bg-gray-100 rounded"
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-1">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <p className="text-center text-gray-400 text-sm py-4">Loading…</p>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const entry = blockedDates[key];
              const blocked = entry && entry.blocked !== false;
              const isSelected = selectedKey === key;
              return (
                <button
                  key={key}
                  onClick={() => handleDayClick(day)}
                  className={`text-sm rounded-lg py-1 transition ${
                    isSelected
                      ? "ring-2 ring-amber-400"
                      : ""
                  } ${
                    blocked
                      ? "bg-red-100 text-red-600 line-through"
                      : "hover:bg-amber-50 text-gray-700"
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Blocked</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border inline-block" /> Available</span>
        </div>
      </div>

      {/* Selected date panel */}
      {selectedDate && (
        <div className="bg-white rounded-xl shadow p-6 max-w-md mt-4">
          <h3 className="font-semibold text-gray-700 mb-3">
            {format(selectedDate, "MMMM d, yyyy")}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Status: <span className={isBlocked ? "text-red-600 font-medium" : "text-green-600 font-medium"}>{isBlocked ? "Blocked" : "Available"}</span>
          </p>
          <button
            onClick={toggleBlock}
            disabled={saving}
            className={`text-sm font-semibold px-4 py-2 rounded-lg transition disabled:opacity-60 ${
              isBlocked
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            {saving ? "Saving…" : isBlocked ? "Unblock Date" : "Block Date"}
          </button>
        </div>
      )}
    </div>
  );
}
