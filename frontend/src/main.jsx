import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import App from "./App.jsx";
import { AuthProvider } from "./state/AuthContext.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LockersPage from "./pages/LockersPage.jsx";
import ReservationsPage from "./pages/ReservationsPage.jsx";
import AdminReservationsPage from "./pages/AdminReservationsPage.jsx";
import MyDashboard from "./pages/MyDashboard.jsx";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Navigate to="/lockers" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="lockers" element={<LockersPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="dashboard" element={<MyDashboard />} />
            <Route path="admin/reservations" element={<AdminReservationsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

