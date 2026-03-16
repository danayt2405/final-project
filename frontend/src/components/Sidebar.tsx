import { Home, FileText, Search, Database, BarChart3 } from 'lucide-react';
import type { Language, UserRole } from '../types';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  language: Language;
  isOpen: boolean;
  role: UserRole;
}

// Menu items for USER role
const userMenuItems = [
  { id: 'home', icon: Home, labelAm: 'መግቢያ', labelEn: 'Home' },
  { id: 'submit', icon: FileText, labelAm: 'ጥቆማ ይስጡ', labelEn: 'Submit Complaint' },
  { id: 'track', icon: Search, labelAm: 'የጥቆማ ሂደት', labelEn: 'Track Complaint' },
];

// Menu items for ADMIN role
const adminMenuItems = [
  { id: 'home', icon: Home, labelAm: 'መግቢያ', labelEn: 'Home' },
  { id: 'submitted', icon: Database, labelAm: 'የቀረበ ጥቆማ', labelEn: 'Submitted Complaints' },
  { id: 'reports', icon: BarChart3, labelAm: 'ሪፖርት', labelEn: 'Reports' },
];

/**
 * Sidebar Component - Role-based navigation menu
 * Shows different menu items based on USER or ADMIN role
 */
export function Sidebar({ currentPage, setCurrentPage, language, isOpen, role }: SidebarProps) {
  // Select menu items based on role
  const menuItems = role === 'ADMIN' ? adminMenuItems : userMenuItems;

  // Don't render sidebar if not open
  if (!isOpen) return null;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-800 border-r border-blue-100 dark:border-slate-700 shadow-lg z-40 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-left">{language === 'am' ? item.labelAm : item.labelEn}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
