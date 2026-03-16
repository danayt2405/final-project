import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Moon, Sun } from "lucide-react";
import type { Language, Theme } from "../types";
import insaLogo from "../assets/logo.png";

interface HomePageProps {
  language: Language;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  onEnterUserDashboard: () => void;
  onEnterAdminDashboard: () => void;
}

export function HomePage({
  language,
  theme,
  setLanguage,
  setTheme,
  onEnterUserDashboard,
  onEnterAdminDashboard,
}: HomePageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative">
      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* Language Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "am" ? "en" : "am")}
          className="hover:bg-blue-50 dark:hover:bg-slate-700"
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-3xl px-4"
      >
        {/* INSA Logo */}
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8 inline-block"
        >
          <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl p-6">
            <img
              src={insaLogo}
              alt="INSA Logo"
              className="w-full h-full object-contain"
            />
          </div>
        </motion.div>

        {/* Welcome Text */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-4 text-blue-900 dark:text-blue-100"
        >
          {language === "am"
            ? "እንኳን ወደ የፍትህ ጥያቄ ስርዓት በደህና መጡ"
            : "Welcome to the INSA Complaint Dashboard"}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-12 text-slate-600 dark:text-slate-300 text-lg"
        >
          {language === "am"
            ? "የመረጃ አውታረ መረብ ደህንነት አስተዳደር የቅሬታ አስተዳደር ስርዓት"
            : "Information Network Security Administration Complaint Management System"}
        </motion.p>

        {/* Dashboard Selection Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button
            size="lg"
            onClick={onEnterUserDashboard}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6"
          >
            <span className="mr-2">👤</span>
            {language === "am" ? "ቅሬታ አቅራቢ" : "complainant"}
          </Button>

          <Button
            size="lg"
            onClick={onEnterAdminDashboard}
            variant="outline"
            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-md hover:shadow-lg transition-all duration-300 px-8 py-6"
          >
            <span className="mr-2">🔐</span>
            {language === "am" ? "አስተዳዳሪ" : "Admin"}
          </Button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="mb-2 text-blue-900 dark:text-blue-100">
              {language === "am" ? "ደህንነት" : "Secure"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {language === "am"
                ? "የእርስዎ መረጃ በደህንነት የተጠበቀ ነው"
                : "Your information is securely protected"}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="mb-2 text-blue-900 dark:text-blue-100">
              {language === "am" ? "ፈጣን" : "Fast"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {language === "am"
                ? "ቅሬታዎችን በፍጥነት ያስገቡ እና ይከታተሉ"
                : "Submit and track complaints quickly"}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="mb-2 text-blue-900 dark:text-blue-100">
              {language === "am" ? "ግልጽ" : "Transparent"}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {language === "am"
                ? "ሂደቱን በግልጽ ይከታተሉ"
                : "Track the process transparently"}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
