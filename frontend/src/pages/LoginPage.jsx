import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import Button from "../components/Button.jsx";
import { useAuth } from "../state/AuthContext.jsx";

export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
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
      await login(form);
      navigate("/lockers");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed. Check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md">
      <div className="rounded-lg bg-white p-6 shadow-panel">
        <h1 className="text-2xl font-bold text-ink">Login</h1>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
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
            <span className="text-sm font-semibold text-slate-700">Password</span>
            <input
              className="focus-ring mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              required
            />
          </label>
          {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">{error}</p>}
          <Button className="w-full" disabled={loading}>
            <LogIn size={16} />
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          New user? <Link className="font-semibold text-teal" to="/register">Create an account</Link>
        </p>
      </div>
    </section>
  );
}

