import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
import { useState, useEffect } from "react";
import { Toaster } from "sonner";
import { HomePage } from "./components/HomePage";
import { UserDashboardLayout } from "./components/UserDashboardLayout";
import { AdminDashboardLayout } from "./components/AdminDashboardLayout";
import { getCurrentUser, logout as apiLogout } from "./services/api";
import type { Language, Theme, UserRole } from "./types";

export default function App() {
  // Theme and Language state
  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState<Language>("en");

  // Dashboard state: 'home' | 'user' | 'admin'
  const [dashboardView, setDashboardView] = useState<"home" | "user" | "admin">(
    "home"
  );

  // Admin authentication state
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    const savedLanguage = localStorage.getItem("language") as Language;

    if (savedTheme) setTheme(savedTheme);
    if (savedLanguage) setLanguage(savedLanguage);

    // Check if admin is already logged in
    const user = getCurrentUser();
    if (user && user.role === "ADMIN") {
      setAdminAuthenticated(true);
      setDashboardView("admin");
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Save language preference
  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  /**
   * Handler for entering User Dashboard (no authentication needed)
   */
  const handleEnterUserDashboard = () => {
    setDashboardView("user");
    setAdminAuthenticated(false);
  };

  /**
   * Handler for entering Admin Dashboard (requires authentication)
   */
  const handleEnterAdminDashboard = () => {
    // Check if already authenticated
    const user = getCurrentUser();
    if (user && user.role === "ADMIN") {
      setAdminAuthenticated(true);
      setDashboardView("admin");
    } else {
      // Will show login in AdminDashboardLayout
      setDashboardView("admin");
    }
  };

  /**
   * Handler for logging out and returning to home
   */
  const handleLogout = () => {
    apiLogout();
    setAdminAuthenticated(false);
    setDashboardView("home");
  };

  /**
   * Handler for successful admin login
   */
  const handleAdminLogin = () => {
    setAdminAuthenticated(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-right" richColors />

      {/* HOME PAGE - Initial landing page */}
      {dashboardView === "home" && (
        <HomePage
          language={language}
          theme={theme}
          setLanguage={setLanguage}
          setTheme={setTheme}
          onEnterUserDashboard={handleEnterUserDashboard}
          onEnterAdminDashboard={handleEnterAdminDashboard}
        />
      )}

      {/* USER DASHBOARD - No authentication required */}
      {dashboardView === "user" && (
        <UserDashboardLayout
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          onBackToHome={handleLogout}
        />
      )}

      {/* ADMIN DASHBOARD - Authentication required */}
      {dashboardView === "admin" && (
        <AdminDashboardLayout
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
          isAuthenticated={adminAuthenticated}
          onLogin={handleAdminLogin}
        />
      )}
    </div>
  );
}

export type { Language, Theme };
