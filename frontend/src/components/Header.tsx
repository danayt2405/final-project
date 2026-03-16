import { Moon, Sun, Menu, X, LogOut, Home } from "lucide-react";
import { Button } from "./ui/button";
import type { Language, Theme, UserRole } from "../types";
import insaLogo from "../assets/logo.png";

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  onLogout: () => void;
  role: UserRole;
}

/**
 * Header Component - Shows at the top of both user and admin dashboards
 * Features: Logo, Title, Language Toggle, Theme Toggle, Menu Toggle, Logout
 */
export function Header({
  language,
  setLanguage,
  theme,
  setTheme,
  sidebarOpen,
  setSidebarOpen,
  onLogout,
  role,
}: HeaderProps) {
  const title = language === "am" ? "የቅሬታ ስርዓት" : "Complaint System";
  const subtitle =
    language === "am"
      ? "የመረጃ አውታረ መረብ ደህንነት አስተዳደር"
      : "Information Network Security Administration";

  const backText = language === "am" ? "ወደ መግቢያ ይመለሱ " : "Back to Home";
  const roleText =
    role === "ADMIN"
      ? language === "am"
        ? "አስተዳዳሪ"
        : "Admin"
      : language === "am"
      ? "ቅሬታ አቅራቢ"
      : "User";

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700 z-50 shadow-sm">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left Side: Menu Toggle + Logo + Title */}
        <div className="flex items-center gap-4">
          {/* Menu Toggle Button - Hidden on large screens initially */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-blue-50 dark:hover:bg-slate-700"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>

          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden bg-white">
              <img
                src={insaLogo}
                alt="INSA Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-blue-900 dark:text-blue-100">{title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Role Badge, Language Toggle, Theme Toggle, Logout */}
        <div className="flex items-center gap-2">
          {/* Role Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm">
            <span>{roleText}</span>
          </div>

          {/* Language Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLanguage(language === "am" ? "en" : "am")}
            className="hidden sm:flex hover:bg-blue-50 dark:hover:bg-slate-700"
          >
            {language === "am" ? "English" : "አማርኛ"}
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="hover:bg-blue-50 dark:hover:bg-slate-700"
          >
            {theme === "light" ? (
              <Moon className="w-4 h-4" />
            ) : (
              <Sun className="w-4 h-4" />
            )}
          </Button>

          {/* Logout/Back Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
          >
            <Home className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">{backText}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
