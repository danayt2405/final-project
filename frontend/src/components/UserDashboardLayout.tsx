import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { WelcomeScreen } from './WelcomeScreen';
import { SubmitComplaint } from './SubmitComplaint';
import { ComplaintTracker } from './ComplaintTracker';
import type { Language, Theme } from '../types';

interface UserDashboardLayoutProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onBackToHome: () => void;
}

/**
 * User Dashboard Layout - For regular users
 * Features: Submit Complaint, Track Complaint
 * No authentication required
 */
export function UserDashboardLayout({
  language,
  setLanguage,
  theme,
  setTheme,
  onBackToHome,
}: UserDashboardLayoutProps) {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        onLogout={onBackToHome}
        role="USER"
      />

      {/* Sidebar - Toggle-able, hidden by default on home page */}
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        language={language}
        isOpen={sidebarOpen}
        role="USER"
      />

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-64' : ''
        } pt-16`}
      >
        <div className="p-6">
          {/* Welcome/Home Page */}
          {currentPage === 'home' && (
            <WelcomeScreen language={language} role="USER" />
          )}

          {/* Submit Complaint Page */}
          {currentPage === 'submit' && (
            <SubmitComplaint language={language} />
          )}

          {/* Track Complaint Page */}
          {currentPage === 'track' && (
            <ComplaintTracker language={language} />
          )}
        </div>
      </main>
    </div>
  );
}
