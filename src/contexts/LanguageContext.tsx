import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    'app.title': 'TaskForge',
    'auth.welcome': 'Welcome to TaskForge',
    'auth.signin': 'Sign in to your account',
    'auth.email': 'Email Address',
    'auth.password': 'Password',
    'auth.signin.button': 'Sign in',
    'auth.signing.in': 'Signing in...',
    'auth.demo': '',
    'nav.dashboard': 'Dashboard',
    'nav.tasks': 'Tasks',
    'nav.users': 'Users',
    'nav.logout': 'Logout',
    'user.management': 'User Management',
    'user.management.desc': 'Manage team members and their access',
    'user.add': 'Add User',
    'user.name': 'Full Name',
    'user.email': 'Email Address',
    'user.password': 'Password',
    'user.role': 'Role',
    'user.status': 'Status',
    'user.department': 'Department',
    'user.active': 'Active',
    'user.inactive': 'Inactive',
    'user.admin': 'Admin',
    'user.user': 'User',
    'user.created': 'Created',
    'user.actions': 'Actions',
    'user.edit': 'Edit User',
    'user.create': 'Create New User',
    'user.save': 'Save',
    'user.cancel': 'Cancel',
    'user.delete': 'Delete',
    'task.management': 'Task Management',
    'task.management.desc': 'Create and manage tasks for your team',
    'task.new': 'New Task',
    'task.title': 'Task Title',
    'task.description': 'Description',
    'task.assign': 'Assign To',
    'task.due': 'Due Date',
    'task.priority': 'Priority',
    'task.status': 'Status',
    'task.comments': 'Comments',
    'task.add.comment': 'Add Comment',
    'task.comment.placeholder': 'Describe what you did...',
    'task.priority.low': 'Low',
    'task.priority.medium': 'Medium',
    'task.priority.high': 'High',
    'task.status.not_started': 'Not Started',
    'task.status.in_progress': 'In Progress',
    'task.status.completed': 'Completed',
    'search.placeholder': 'Search...',
    'filter.all': 'All',
    'filter.active': 'Active',
    'filter.inactive': 'Inactive',
    'filter.admin': 'Admin',
    'filter.user': 'User',
    'dept.it': 'IT',
    'dept.hr': 'HR',
    'dept.finance': 'Finance',
    'dept.marketing': 'Marketing',
    'dept.sales': 'Sales',
    'dept.operations': 'Operations',
    'dept.other': 'Other'
  },
  fr: {
    'app.title': 'TaskForge',
    'auth.welcome': 'Bienvenue sur TaskForge',
    'auth.signin': 'Connectez-vous à votre compte',
    'auth.email': 'Adresse e-mail',
    'auth.password': 'Mot de passe',
    'auth.signin.button': 'Se connecter',
    'auth.signing.in': 'Connexion...',
    'auth.demo': '',
    'nav.dashboard': 'Tableau de bord',
    'nav.tasks': 'Tâches',
    'nav.users': 'Utilisateurs',
    'nav.logout': 'Déconnexion',
    'user.management': 'Gestion des utilisateurs',
    'user.management.desc': 'Gérer les membres de l\'équipe et leurs accès',
    'user.add': 'Ajouter un utilisateur',
    'user.name': 'Nom complet',
    'user.email': 'Adresse e-mail',
    'user.password': 'Mot de passe',
    'user.role': 'Rôle',
    'user.status': 'Statut',
    'user.department': 'Département',
    'user.active': 'Actif',
    'user.inactive': 'Inactif',
    'user.admin': 'Admin',
    'user.user': 'Utilisateur',
    'user.created': 'Créé',
    'user.actions': 'Actions',
    'user.edit': 'Modifier l\'utilisateur',
    'user.create': 'Créer un nouvel utilisateur',
    'user.save': 'Enregistrer',
    'user.cancel': 'Annuler',
    'user.delete': 'Supprimer',
    'task.management': 'Gestion des tâches',
    'task.management.desc': 'Créer et gérer les tâches pour votre équipe',
    'task.new': 'Nouvelle tâche',
    'task.title': 'Titre de la tâche',
    'task.description': 'Description',
    'task.assign': 'Assigner à',
    'task.due': 'Date d\'échéance',
    'task.priority': 'Priorité',
    'task.status': 'Statut',
    'task.comments': 'Commentaires',
    'task.add.comment': 'Ajouter un commentaire',
    'task.comment.placeholder': 'Décrivez ce que vous avez fait...',
    'task.priority.low': 'Faible',
    'task.priority.medium': 'Moyenne',
    'task.priority.high': 'Élevée',
    'task.status.not_started': 'Non commencé',
    'task.status.in_progress': 'En cours',
    'task.status.completed': 'Terminé',
    'search.placeholder': 'Rechercher...',
    'filter.all': 'Tous',
    'filter.active': 'Actif',
    'filter.inactive': 'Inactif',
    'filter.admin': 'Admin',
    'filter.user': 'Utilisateur',
    'dept.it': 'IT',
    'dept.hr': 'RH',
    'dept.finance': 'Finance',
    'dept.marketing': 'Marketing',
    'dept.sales': 'Ventes',
    'dept.operations': 'Opérations',
    'dept.other': 'Autre'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const saved = localStorage.getItem('taskforge_language') as Language;
    if (saved && (saved === 'en' || saved === 'fr')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('taskforge_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
