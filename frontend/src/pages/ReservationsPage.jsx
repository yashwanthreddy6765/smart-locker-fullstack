import { CalendarClock, Unlock } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../state/AuthContext.jsx";

export default function ReservationsPage() {
  const { isAuthenticated } = useAuth();
  const [lockers, setLockers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({ locker: "", reserved_until: "" });
  const [error, setError] = useState("");

  const loadData = async () => {
    setError("");
    try {
      const [lockerResponse, reservationResponse] = await Promise.all([
        api.get("/lockers/"),
        api.get("/reservations/"),
      ]);
      setLockers(lockerResponse.data);
      setReservations(reservationResponse.data);
    } catch {
      setError("Could not load data.");
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

  const reserveLocker = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/reservations/", {
        locker: Number(form.locker),
        reserved_until: new Date(form.reserved_until).toISOString(),
      });
      setForm({ locker: "", reserved_until: "" });
      loadData();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Could not reserve locker.");
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

  return (
    <>
      <PageHeader eyebrow="Reserve and release" title="My Reservations" />

      <form className="mb-8 grid gap-3 rounded-lg bg-white p-4 shadow-panel md:grid-cols-[1fr_1fr_auto]" onSubmit={reserveLocker}>
        <select
          className="focus-ring rounded-md border border-slate-300 px-3 py-2"
          value={form.locker}
          onChange={(event) => setForm({ ...form, locker: event.target.value })}
          required
        >
          <option value="">Choose a locker</option>
          {lockers.filter((l) => l.status === "available").length === 0 && (
            <option value="" disabled>No available lockers right now</option>
          )}
          {lockers.map((locker) => (
            <option key={locker.id} value={locker.id} disabled={locker.status !== "available"}>
              {locker.locker_number} — {locker.location}{locker.status !== "available" ? ` (${locker.status})` : " (available)"}
            </option>
          ))}
        </select>
        <input
          className="focus-ring rounded-md border border-slate-300 px-3 py-2"
          type="datetime-local"
          value={form.reserved_until}
          onChange={(event) => setForm({ ...form, reserved_until: event.target.value })}
          required
        />
        <Button>
          <CalendarClock size={16} />
          Reserve
        </Button>
      </form>

      {error && <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}

      <div className="grid gap-4">
        {reservations.map((reservation) => (
          <article key={reservation.id} className="rounded-lg bg-white p-5 shadow-panel">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-ink">{reservation.locker_detail?.locker_number}</h2>
                <p className="text-sm text-slate-600">{reservation.locker_detail?.location}</p>
                <p className="mt-2 text-sm text-slate-500">
                  Until {new Date(reservation.reserved_until).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge value={reservation.status} />
                {reservation.status === "active" && (
                  <Button variant="secondary" onClick={() => releaseReservation(reservation.id)}>
                    <Unlock size={16} />
                    Release
                  </Button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

