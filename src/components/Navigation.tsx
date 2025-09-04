import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './common/LanguageSwitcher';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Settings 
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const adminTabs = [
    { id: 'dashboard', name: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'tasks', name: t('nav.tasks'), icon: ClipboardList },
    { id: 'users', name: t('nav.users'), icon: Users }
  ];

  const userTabs = [
    { id: 'dashboard', name: t('nav.dashboard'), icon: LayoutDashboard }
  ];

  const tabs = user?.role === 'admin' ? adminTabs : userTabs;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <button
              onClick={() => {
                localStorage.removeItem('taskforge_token');
                localStorage.removeItem('taskforge_user');
                window.location.reload();
              }}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}