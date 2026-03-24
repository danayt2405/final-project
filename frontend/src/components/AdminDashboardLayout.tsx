import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { WelcomeScreen } from "./WelcomeScreen";
import SubmittedComplaints from "./SubmittedComplaints";
import Reports from "./Reports";
import { AdminLogin } from "./AdminLogin";
import type { Language, Theme } from "../types";

interface AdminDashboardLayoutProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onLogout: () => void;
  isAuthenticated: boolean;
  onLogin: () => void;
}

/**
 * Admin Dashboard Layout - For administrators
 * Features: Submitted Complaints, Reports
 * Requires authentication
 */
export function AdminDashboardLayout({
  language,
  setLanguage,
  theme,
  setTheme,
  onLogout,
  isAuthenticated,
  onLogin,
}: AdminDashboardLayoutProps) {
  const [currentPage, setCurrentPage] = useState<string>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not authenticated, show login screen
  if (!isAuthenticated) {
    return (
      <AdminLogin
        language={language}
        theme={theme}
        setTheme={setTheme}
        onLoginSuccess={onLogin}
        onBack={onLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header - Always visible */}
      <Header
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
        role="ADMIN"
      />

      {/* Sidebar - Toggle-able, hidden by default on home page */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        language={language}
        isOpen={sidebarOpen}
        role="ADMIN"
      />

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : ""
        } pt-16`}
      >
        <div className="p-6">
          {/* Welcome/Home Page */}
          {currentPage === "home" && (
            <WelcomeScreen language={language} role="ADMIN" />
          )}

          {/* Submitted Complaints Page */}
          {currentPage === "submitted" && (
            <SubmittedComplaints language={language} />
          )}

          {/* Reports Page */}
          {currentPage === "reports" && <Reports initialLanguage={language} />}
        </div>
      </main>
    </div>
  );
}
