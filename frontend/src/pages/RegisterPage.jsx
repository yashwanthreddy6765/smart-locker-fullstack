import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Button from "../components/Button.jsx";
import { useAuth } from "../state/AuthContext.jsx";

export default function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/lockers" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/lockers");
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") : "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <div className="rounded-lg bg-white p-6 shadow-panel">
        <h1 className="text-2xl font-bold text-ink">Create Account</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Full name</span>
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Username</span>
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              minLength={8}
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
          <Button className="w-full" disabled={loading}>
            <UserPlus size={16} />
            {loading ? "Creating..." : "Register"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          Already registered? <Link className="font-semibold text-teal" to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
}

