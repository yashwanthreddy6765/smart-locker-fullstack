import {
  CalendarClock,
  Clock,
  DoorClosed,
  MapPin,
  RefreshCcw,
  Unlock,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../state/AuthContext.jsx";

const SIZE_COLORS = {
  small: "bg-purple-100 text-purple-700",
  medium: "bg-blue-100 text-blue-700",
  large: "bg-amber-100 text-amber-700",
};
const SIZE_LABELS = { small: "Small", medium: "Medium", large: "Large" };

function formatDuration(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}${minutes > 0 ? ` ${minutes}m` : ""} ago`;
  }
  return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
}

function getMinDatetime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

function getDefaultDatetime() {
  const future = new Date(Date.now() + 2 * 60 * 60 * 1000);
  future.setMinutes(future.getMinutes() - future.getTimezoneOffset());
  return future.toISOString().slice(0, 16);
}

export default function ReservationsPage() {
  const { isAuthenticated } = useAuth();
  const [lockers, setLockers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [selectedLockerId, setSelectedLockerId] = useState(null);
  const [reservedUntil, setReservedUntil] = useState(getDefaultDatetime());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const availableLockers = useMemo(
    () => lockers.filter((l) => l.status === "available"),
    [lockers],
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [lockerResponse, reservationResponse] = await Promise.all([
        api.get("/lockers/"),
        api.get("/reservations/"),
      ]);
      setLockers(lockerResponse.data);
      setReservations(reservationResponse.data);
    } catch {
      setError("Could not load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const reserveLocker = async () => {
    if (!selectedLockerId || !reservedUntil) return;
    setError("");
    setSubmitting(true);
    try {
      await api.post("/reservations/", {
        locker: Number(selectedLockerId),
        reserved_until: new Date(reservedUntil).toISOString(),
      });
      setSelectedLockerId(null);
      setReservedUntil(getDefaultDatetime());
      loadData();
    } catch (err) {
      const data = err.response?.data;
      setError(
        data
          ? Object.values(data).flat().join(" ")
          : "Could not reserve locker. It may have been taken.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const releaseReservation = async (id) => {
    setError("");
    try {
      await api.put(`/reservations/${id}/release/`);
      loadData();
    } catch {
      setError("Could not release reservation.");
    }
  };

  const selectedLocker = lockers.find((l) => l.id === Number(selectedLockerId));

  return (
    <>
      <PageHeader
        title="My Reservations"
        action={
          <Button variant="secondary" onClick={loadData} disabled={loading}>
            <RefreshCcw size={16} />
            Refresh
          </Button>
        }
      />

      {/* ---------- Book a Locker ---------- */}
      <section className="mb-10 rounded-xl bg-white p-6 shadow-panel">
        <h2 className="mb-1 text-lg font-bold text-ink">Book a Locker</h2>
        <p className="mb-5 text-sm text-slate-500">
          {availableLockers.length > 0
            ? `Select an available locker below, then choose how long you need it.`
            : "No lockers are currently available to book."}
        </p>

        {/* Available lockers grid */}
        {lockers.length === 0 && !loading ? (
          <div className="rounded-lg border-2 border-dashed border-slate-200 p-10 text-center">
            <DoorClosed size={40} className="mx-auto mb-3 text-slate-300" />
            <h3 className="font-semibold text-slate-600">No lockers yet</h3>
            <p className="mt-1 text-sm text-slate-400">
              An admin needs to add lockers before anyone can book them.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lockers.map((locker) => {
                const isAvailable = locker.status === "available";
                const isSelected = selectedLockerId === String(locker.id);
                return (
                  <button
                    type="button"
                    key={locker.id}
                    disabled={!isAvailable}
                    onClick={() =>
                      setSelectedLockerId(
                        isSelected ? null : String(locker.id),
                      )
                    }
                    className={`group relative rounded-lg border-2 p-4 text-left transition-all
                      ${
                        isSelected
                          ? "border-teal bg-teal/5 shadow-md shadow-teal/10"
                          : isAvailable
                            ? "border-slate-200 hover:border-teal/50 hover:shadow-sm"
                            : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-50"
                      }`}
                  >
                    {/* Selection indicator */}
                    {isSelected && (
                      <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-teal text-xs font-bold text-white">
                        ✓
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <span
                          className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md text-sm font-bold ${
                            isAvailable && !isSelected
                              ? "bg-teal/10 text-teal"
                              : isSelected
                                ? "bg-teal text-white"
                                : "bg-slate-200 text-slate-400"
                          }`}
                        >
                          {locker.locker_number.charAt(0)}
                        </span>
                        <div>
                          <p className="font-semibold text-ink">
                            {locker.locker_number}
                          </p>
                          <p className="flex items-center gap-1 text-xs text-slate-400">
                            <MapPin size={11} />
                            {locker.location}
                          </p>
                          {/* Size label */}
                          <span
                            className={`mt-1.5 inline-block rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                              SIZE_COLORS[locker.size] || SIZE_COLORS.medium
                            }`}
                          >
                            {SIZE_LABELS[locker.size] || locker.size}
                          </span>
                        </div>
                      </div>
                      <StatusBadge value={locker.status} />
                    </div>

                    {/* Duration for occupied lockers */}
                    {!isAvailable && locker.reserved_since && (
                      <p className="mt-2 text-left text-[10px] font-medium text-amber-600">
                        Occupied — reserved {formatDuration(locker.reserved_since)}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Booking form (shown only when a locker is selected) */}
            {selectedLocker && (
              <div className="rounded-lg border border-teal/20 bg-teal/5 p-5 transition-all">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="rounded-md bg-teal/10 px-3 py-1 text-sm font-semibold text-teal">
                    {selectedLocker.locker_number}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                      SIZE_COLORS[selectedLocker.size] || SIZE_COLORS.medium
                    }`}
                  >
                    {SIZE_LABELS[selectedLocker.size] || selectedLocker.size}
                  </span>
                  <span className="text-sm text-slate-500">
                    {selectedLocker.location}
                  </span>
                  <span className="text-xs text-slate-400">—</span>
                  <span className="text-sm text-slate-500">
                    Book until:
                  </span>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <label className="flex-1">
                    <span className="mb-1 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                      <Clock size={14} />
                      End time
                    </span>
                    <input
                      className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2"
                      type="datetime-local"
                      min={getMinDatetime()}
                      value={reservedUntil}
                      onChange={(e) => setReservedUntil(e.target.value)}
                      required
                    />
                  </label>

                  <Button
                    onClick={reserveLocker}
                    disabled={submitting || !reservedUntil}
                  >
                    <CalendarClock size={16} />
                    {submitting ? "Booking..." : "Confirm Booking"}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setSelectedLockerId(null)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {error && (
        <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
          {error}
        </p>
      )}

      {/* ---------- My Reservations ---------- */}
      <h2 className="mb-4 text-lg font-bold text-ink">Your Reservations</h2>
      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : reservations.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-slate-200 p-10 text-center">
          <CalendarClock size={36} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">
            You haven't made any reservations yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <article
              key={reservation.id}
              className="rounded-lg bg-white p-5 shadow-panel transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-md text-sm font-bold ${
                      reservation.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {reservation.locker_detail?.locker_number?.charAt(0) ||
                      "?"}
                  </span>
                  <div>
                    <h3 className="font-bold text-ink">
                      {reservation.locker_detail?.locker_number}
                    </h3>
                    <p className="flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={12} />
                      {reservation.locker_detail?.location || "Unknown"}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={11} />
                      Until{" "}
                      {new Date(
                        reservation.reserved_until,
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge value={reservation.status} />
                  {reservation.status === "active" && (
                    <Button
                      variant="secondary"
                      onClick={() => releaseReservation(reservation.id)}
                    >
                      <Unlock size={16} />
                      Release
                    </Button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
