import { Box, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

import Button from "./components/Button.jsx";
import { useAuth } from "./state/AuthContext.jsx";

function navClass({ isActive }) {
  return `rounded-md px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-teal text-white" : "text-slate-700 hover:bg-white"
  }`;
}

export default function App() {
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-mist">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/lockers" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-md bg-teal text-white">
              <Box size={22} />
            </span>
            <span>
              <span className="block text-lg font-bold text-ink">Smart Locker</span>
              <span className="block text-xs font-medium text-slate-500">Storage management</span>
            </span>
          </Link>

          <nav className="flex flex-wrap items-center gap-2">
            {isAuthenticated && <NavLink className={navClass} to="/lockers">Lockers</NavLink>}
            {isAuthenticated && <NavLink className={navClass} to="/reservations">My Reservations</NavLink>}
            {isAuthenticated && !isAdmin && (
              <NavLink className={navClass} to="/dashboard">My Dashboard</NavLink>
            )}
            {isAuthenticated && isAdmin && (
              <NavLink className={navClass} to="/admin/reservations">All Reservations</NavLink>
            )}
            {!isAuthenticated && <NavLink className={navClass} to="/login">Login</NavLink>}
            {!isAuthenticated && <NavLink className={navClass} to="/register">Register</NavLink>}
          </nav>

          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 text-sm font-semibold text-slate-700 sm:flex">
                {isAdmin ? <ShieldCheck size={18} /> : <UserRound size={18} />}
                {user?.name || user?.username}
              </div>
              <Button variant="secondary" onClick={handleLogout}>
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

