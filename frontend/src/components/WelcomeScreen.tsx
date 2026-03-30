import { motion } from "motion/react";
import type { Language, UserRole } from "../types";
import insaLogo from "../assets/logo.png";

interface WelcomeScreenProps {
  language: Language;
  role: UserRole;
}

/**
 * Welcome Screen - Shown on the Home page within dashboards
 * Different content based on USER or ADMIN role
 */
export function WelcomeScreen({ language, role }: WelcomeScreenProps) {
  const welcomeText =
    language === "am"
      ? "እንኳን ወደ የፍትህ ጥያቄ ስርዓት በደህና መጡ"
      : "Welcome to the EDU Complaint Dashboard";

  const subtitleText =
    language === "am"
      ? "የኢትዮጲያ መከላከያ ዩኒቨርሲቲ የቅሬታ አስተዳደር ስርዓት"
      : "Ethiopian Defence University Complaint Management System";

  const roleGreeting =
    role === "ADMIN"
      ? language === "am"
        ? "የአስተዳዳሪ ዳሽቦርድ"
        : "Administrator Dashboard"
      : language === "am"
      ? "የተጠቃሚ ዳሽቦርድ"
      : "User Dashboard";

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center bg-blue-100 dark:bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl px-4"
      >
        {/* Logo */}
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

        {/* Role Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-4"
        >
          <span
            className={`inline-block px-4 py-2 rounded-full text-sm ${
              role === "ADMIN"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
            }`}
          >
            {roleGreeting}
          </span>
        </motion.div>

        {/* Welcome Title */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-4 text-blue-900 dark:text-blue-100"
        >
          {welcomeText}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8 text-slate-600 dark:text-slate-300"
        >
          {subtitleText}
        </motion.p>

        {/* Instruction */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="text-slate-500 dark:text-slate-400 text-sm"
        >
          {language === "am"
            ? "ለመጀመር ከላይ ያለውን ሜኑ ቁልፍ (☰) ይጫኑ"
            : "Click the menu button (☰) above to get started"}
        </motion.p>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
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
