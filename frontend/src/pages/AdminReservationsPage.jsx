import { RefreshCcw, Clock, CalendarClock } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../state/AuthContext.jsx";

function formatDuration(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function AdminReservationsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [reservations, setReservations] = useState([]);

  const loadReservations = async () => {
    try {
      const { data } = await api.get("/reservations/");
      setReservations(data);
    } catch {
      // Error loading reservations — data stays stale rather than crashing
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadReservations();
    }
  }, [isAuthenticated, isAdmin]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/lockers" replace />;
  }

  const activeReservations = reservations.filter((r) => r.status === "active");
  const releasedReservations = reservations.filter((r) => r.status !== "active");

  return (
    <>
      <PageHeader
        eyebrow="Admin"
        title="All Reservations"
        action={
          <Button variant="secondary" onClick={loadReservations}>
            <RefreshCcw size={16} />
            Refresh
          </Button>
        }
      />

      {/* Active Reservations */}
      {activeReservations.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-lg font-bold text-emerald-800">
            Active Reservations ({activeReservations.length})
          </h2>
          <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-panel">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-emerald-50 text-xs font-bold uppercase text-emerald-700">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Locker</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Reserved At</th>
                    <th className="px-4 py-3">Until</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {activeReservations.map((reservation) => (
                    <tr key={reservation.id} className="bg-emerald-50/30">
                      <td className="px-4 py-3 font-semibold text-ink">
                        {reservation.user?.name || reservation.user?.username}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {reservation.locker_detail?.locker_number}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {reservation.locker_detail?.location}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1">
                          <CalendarClock size={12} className="text-slate-400" />
                          {new Date(reservation.created_at).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(reservation.reserved_until).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          <Clock size={11} />
                          {formatDuration(reservation.created_at)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge value={reservation.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Released Reservations */}
      <section>
        <h2 className="mb-3 text-lg font-bold text-slate-700">
          Past Reservations ({releasedReservations.length})
        </h2>
        <div className="overflow-hidden rounded-lg bg-white shadow-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Locker</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Reserved At</th>
                  <th className="px-4 py-3">Until</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {releasedReservations.map((reservation) => (
                  <tr key={reservation.id} className="text-slate-600">
                    <td className="px-4 py-3 font-semibold text-ink">
                      {reservation.user?.name || reservation.user?.username}
                    </td>
                    <td className="px-4 py-3">
                      {reservation.locker_detail?.locker_number}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {reservation.locker_detail?.location}
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        <CalendarClock size={12} className="text-slate-400" />
                        {new Date(reservation.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {new Date(reservation.reserved_until).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        <Clock size={11} />
                        {formatDuration(reservation.created_at)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge value={reservation.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
