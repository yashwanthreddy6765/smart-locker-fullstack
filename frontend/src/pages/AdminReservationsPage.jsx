import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../state/AuthContext.jsx";

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
      <div className="overflow-hidden rounded-lg bg-white shadow-panel">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-100 text-xs font-bold uppercase text-slate-600">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Locker</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Until</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td className="px-4 py-3 font-semibold text-ink">
                    {reservation.user?.name || reservation.user?.username}
                  </td>
                  <td className="px-4 py-3">{reservation.locker_detail?.locker_number}</td>
                  <td className="px-4 py-3">{reservation.locker_detail?.location}</td>
                  <td className="px-4 py-3">{new Date(reservation.reserved_until).toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge value={reservation.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

