import { CalendarClock, Clock, DoorClosed, History, MapPin, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";

import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../state/AuthContext.jsx";

function formatDuration(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours >= 24) { const days = Math.floor(hours / 24); return days + " day" + (days > 1 ? "s" : "") + " ago"; }
  if (hours > 0) { return hours + " hour" + (hours > 1 ? "s" : "") + (minutes > 0 ? " " + minutes + "m" : "") + " ago"; }
  return minutes + " minute" + (minutes !== 1 ? "s" : "") + " ago";
}

function formatDateTime(isoString) {
  return new Date(isoString).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function MyDashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReservations = async () => {
    setLoading(true);
    setError("");
    try { const { data } = await api.get("/reservations/"); setReservations(data); }
    catch { setError("Could not load your reservations."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (isAuthenticated) { loadReservations(); } }, [isAuthenticated]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAdmin) return <Navigate to="/admin/reservations" replace />;

  const activeReservation = reservations.find(r => r.status === "active");
  const pastReservations = reservations.filter(r => r.status === "released").sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return (
    <>
      <PageHeader eyebrow="User Dashboard" title="My Dashboard"
        action={<Button variant="secondary" onClick={loadReservations} disabled={loading}><RefreshCcw size={16} /> Refresh</Button>} />

      {error && <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}

      <section className="mb-8 rounded-xl bg-white p-6 shadow-panel">
        <h2 className="mb-1 text-lg font-bold text-ink">Active Reservation</h2>
        <p className="mb-5 text-sm text-slate-500">{activeReservation ? "You have a locker reserved right now." : "You have no active reservation."}</p>
        {loading ? <p className="text-sm text-slate-400">Loading...</p>
        : activeReservation ? (
          <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50/50 p-5">
            <div className="flex items-start gap-4">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-emerald-100 text-xl font-bold text-emerald-700">{activeReservation.locker_detail?.locker_number?.charAt(0) || "?"}</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-ink">{activeReservation.locker_detail?.locker_number}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={13} />{activeReservation.locker_detail?.location || "Unknown"}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-600"><CalendarClock size={14} /> Reserved <strong>{formatDateTime(activeReservation.created_at)}</strong></span>
                  <span className="flex items-center gap-1.5 text-slate-600"><Clock size={14} /> Until <strong>{formatDateTime(activeReservation.reserved_until)}</strong></span>
                </div>
                <p className="mt-2 text-xs font-medium text-emerald-600">Reserved {formatDuration(activeReservation.created_at)}</p>
              </div>
              <StatusBadge value={activeReservation.status} />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border-2 border-dashed border-slate-200 p-10 text-center">
            <DoorClosed size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">You don't have any lockers reserved right now.</p>
            <Link to="/reservations" className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-teal px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal/90">Book a Locker</Link>
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white p-6 shadow-panel">
        <h2 className="mb-1 text-lg font-bold text-ink">Past Reservations</h2>
        <p className="mb-5 text-sm text-slate-500">{pastReservations.length > 0 ? "You have released " + pastReservations.length + " reservation" + (pastReservations.length > 1 ? "s" : "") + "." : "No past reservations yet."}</p>
        {loading ? <p className="text-sm text-slate-400">Loading...</p>
        : pastReservations.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-slate-200 p-10 text-center">
            <History size={36} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm text-slate-400">Your past reservations will appear here after you release a locker.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pastReservations.map(reservation => (
              <article key={reservation.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-100 text-sm font-bold text-slate-500">{reservation.locker_detail?.locker_number?.charAt(0) || "?"}</span>
                  <div>
                    <h3 className="font-bold text-ink">{reservation.locker_detail?.locker_number}</h3>
                    <p className="flex items-center gap-1 text-xs text-slate-400"><MapPin size={11} />{reservation.locker_detail?.location || "Unknown"}</p>
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><CalendarClock size={11} /> Reserved: {formatDateTime(reservation.created_at)}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> Released: {formatDateTime(reservation.released_at)}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge value={reservation.status} />
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
