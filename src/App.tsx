import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { Layout } from './components/Layout';
import { Navigation } from './components/Navigation';
import { LoginForm } from './components/LoginForm';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TaskManagement } from './components/admin/TaskManagement';
import { UserManagement } from './components/admin/UserManagement';
import { ParcInformatiqueManagement } from './components/admin/ParcInformatiqueManagement';
import { ParcInformatiqueManagementSimple } from './components/admin/ParcInformatiqueManagementSimple';
import { ParcTelecomManagement } from './components/admin/ParcTelecomManagement';
import { ProjetManagement } from './components/admin/ProjetManagement';
import { UserDashboard } from './components/user/UserDashboard';
import { UserProjets } from './components/user/UserProjets';

function AppContent() {
  const { user, isLoading } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    if (user.role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboard />;
        case 'tasks':
          return <TaskManagement />;
        case 'users':
          return <UserManagement />;
        case 'parc-informatique':
          return <ParcInformatiqueManagementSimple />;
        case 'parc-telecom':
          return <ParcTelecomManagement />;
        case 'projets':
          return <ProjetManagement />;
        default:
          return <AdminDashboard />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <UserDashboard />;
        case 'projets':
          return <UserProjets />;
        default:
          return <UserDashboard />;
      }
    }
  };

  return (
    <Layout title="IT Centrale" key={language}>
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;