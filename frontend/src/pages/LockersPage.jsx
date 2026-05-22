import { Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { api } from "../api/client.js";
import Button from "../components/Button.jsx";
import PageHeader from "../components/PageHeader.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../state/AuthContext.jsx";

export default function LockersPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [lockers, setLockers] = useState([]);
  const [form, setForm] = useState({ locker_number: "", location: "", status: "available" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const availableCount = useMemo(() => lockers.filter((locker) => locker.status === "available").length, [lockers]);

  const loadLockers = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/lockers/");
      setLockers(data);
    } catch {
      setError("Could not load lockers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadLockers();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const createLocker = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/lockers/", form);
      setForm({ locker_number: "", location: "", status: "available" });
      loadLockers();
    } catch {
      setError("Could not create locker.");
    }
  };

  const deactivateLocker = async (id) => {
    setError("");
    try {
      await api.delete(`/lockers/${id}/`);
      loadLockers();
    } catch {
      setError("Could not deactivate locker.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow={`${availableCount} available`}
        title="Lockers"
        action={
          <Button variant="secondary" onClick={loadLockers}>
            <RefreshCcw size={16} />
            Refresh
          </Button>
        }
      />

      {isAdmin && (
        <form className="mb-8 grid gap-3 rounded-lg bg-white p-4 shadow-panel md:grid-cols-[1fr_1fr_180px_auto]" onSubmit={createLocker}>
          <input
            className="focus-ring rounded-md border border-slate-300 px-3 py-2"
            placeholder="Locker number"
            value={form.locker_number}
            onChange={(event) => setForm({ ...form, locker_number: event.target.value })}
            required
          />
          <input
            className="focus-ring rounded-md border border-slate-300 px-3 py-2"
            placeholder="Location"
            value={form.location}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
            required
          />
          <select
            className="focus-ring rounded-md border border-slate-300 px-3 py-2"
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option value="available">Available</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
          <Button>
            <Plus size={16} />
            Add
          </Button>
        </form>
      )}

      {error && <p className="mb-4 rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
      {loading ? (
        <p className="text-slate-600">Loading lockers...</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lockers.map((locker) => (
            <article key={locker.id} className="rounded-lg bg-white p-5 shadow-panel">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-ink">{locker.locker_number}</h2>
                  <p className="mt-1 text-sm text-slate-600">{locker.location}</p>
                </div>
                <StatusBadge value={locker.status} />
              </div>
              {isAdmin && locker.status !== "inactive" && (
                <Button className="mt-5 w-full" variant="danger" onClick={() => deactivateLocker(locker.id)}>
                  <Trash2 size={16} />
                  Deactivate
                </Button>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
