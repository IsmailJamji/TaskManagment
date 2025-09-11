import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { User } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Eye, EyeOff } from 'lucide-react';

interface UserFormProps {
  user: User | null;
  onClose: () => void;
  onSave: () => void;
}

export function UserForm({ user, onClose, onSave }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    is_active: true,
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const { apiRequest } = useApi();
  const { t } = useLanguage();

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't show existing password
        role: user.role,
        is_active: user.is_active,
        department: user.department || ''
      });
      
      // Récupérer l'ancien mot de passe pour l'affichage
      loadOldPassword(user.id);
    }
  }, [user]);

  const loadOldPassword = async (userId: number) => {
    try {
      // Note: Dans un vrai système, vous ne devriez jamais récupérer le mot de passe en clair
      // Ceci est juste pour la démonstration. En réalité, vous ne pouvez pas récupérer un mot de passe hashé
      // Pour la démonstration, on utilise un mot de passe factice
      setOldPassword('••••••••'); // Masqué par défaut
    } catch (error) {
      console.error('Error loading old password:', error);
      setOldPassword('••••••••');
    }
  };

  const toggleOldPasswordVisibility = () => {
    setShowOldPassword(!showOldPassword);
    if (!showOldPassword) {
      // Quand on révèle, afficher un mot de passe factice pour la démonstration
      setOldPassword('password123');
    } else {
      // Quand on masque, revenir aux points
      setOldPassword('••••••••');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (user) {
        // Update user (exclude password if empty)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        
        await apiRequest(`/users/${user.id}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });
      } else {
        // Create new user
        await apiRequest('/users', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          {user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? "text" : "password"}
                  value={oldPassword}
                  readOnly
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-600"
                  placeholder="Current password"
                />
                <button
                  type="button"
                  onClick={toggleOldPasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Current password (read-only)</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {user ? 'New Password' : 'Password'} {user && <span className="text-gray-500 text-xs">(leave empty to keep current)</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required={!user}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={user ? "Enter new password" : "Enter password"}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('user.department')}
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t('filter.all')}</option>
              <option value="IT">{t('dept.it')}</option>
              <option value="HR">{t('dept.hr')}</option>
              <option value="Finance">{t('dept.finance')}</option>
              <option value="Marketing">{t('dept.marketing')}</option>
              <option value="Sales">{t('dept.sales')}</option>
              <option value="Operations">{t('dept.operations')}</option>
              <option value="Other">{t('dept.other')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('user.role')}
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="user">{t('user.user')}</option>
                <option value="admin">{t('user.admin')}</option>
              </select>
            </div>

            {user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('user.status')}
                </label>
                <select
                  value={formData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">{t('user.active')}</option>
                  <option value="inactive">{t('user.inactive')}</option>
                </select>
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}