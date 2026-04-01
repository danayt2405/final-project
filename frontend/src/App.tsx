import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";

import { HomePage } from "./components/HomePage";
import { UserDashboardLayout } from "./components/UserDashboardLayout";
import { AdminDashboardLayout } from "./components/AdminDashboardLayout";
import AdministratorDashboard from "./components/AdministratorDashboard";
import { AdminLogin } from "./components/AdminLogin";

import { getCurrentUser, logout as apiLogout } from "./services/api";
import type { Language, Theme } from "./types";

export default function App() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  // ================= THEME =================
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // ================= LANGUAGE =================
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  // ================= LOGOUT =================
  const handleLogout = () => {
    apiLogout();
    setAdminAuthenticated(false);
    navigate("/");
  };

  // ================= LOGIN SUCCESS =================
  const handleAdminLogin = (user?: any) => {
    const currentUser = user || getCurrentUser();

    if (!currentUser) {
      alert("Login error");
      return;
    }

    if (currentUser.role === "administrator") {
      setAdminAuthenticated(true);
      navigate("/administrator");
    } else if (
      currentUser.role === "admin" ||
      currentUser.role === "superadmin"
    ) {
      setAdminAuthenticated(true);
      navigate("/admin");
    } else {
      alert("Access denied: Unknown role");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" richColors />

      <Routes>
        {/* HOME */}
        <Route
          path="/"
          element={
            <HomePage
              language={language}
              theme={theme}
              setLanguage={setLanguage}
              setTheme={setTheme}
              onEnterUserDashboard={() => navigate("/user")}
              onEnterAdminDashboard={() => navigate("/admin")}
            />
          }
        />

        {/* USER DASHBOARD */}
        <Route
          path="/user"
          element={
            <UserDashboardLayout
              language={language}
              setLanguage={setLanguage}
              theme={theme}
              setTheme={setTheme}
              onBackToHome={() => navigate("/")}
            />
          }
        />

        {/* ADMIN DASHBOARD */}
        <Route
          path="/admin"
          element={
            <AdminDashboardLayout
              language={language}
              setLanguage={setLanguage}
              theme={theme}
              setTheme={setTheme}
              onLogout={handleLogout}
              isAuthenticated={adminAuthenticated}
              onLogin={handleAdminLogin}
            />
          }
        />

        {/* ADMINISTRATOR DASHBOARD */}
        <Route
          path="/administrator"
          element={
            adminAuthenticated ? (
              <AdministratorDashboard />
            ) : (
              <AdminLogin
                language={language}
                theme={theme}
                setTheme={setTheme}
                onLoginSuccess={handleAdminLogin}
                onBack={() => navigate("/")}
              />
            )
          }
        />
      </Routes>
    </div>
  );
}

export type { Language, Theme };
