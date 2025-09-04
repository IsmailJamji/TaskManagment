import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-gray-600" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'fr')}
        className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
}
