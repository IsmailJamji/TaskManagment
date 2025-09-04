import React, { useEffect, useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { User } from '../../types';
import { UserForm } from './UserForm';
import { SearchFilter } from '../common/SearchFilter';
import { useLanguage } from '../../contexts/LanguageContext';
import { Plus, Edit, UserCheck, UserX, Mail, Shield, Trash2 } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { apiRequest } = useApi();
  const { t } = useLanguage();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await apiRequest('/users');
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.email.toLowerCase().includes(query.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(query.toLowerCase()))
    );
    setFilteredUsers(filtered);
  };

  const handleFilter = (filters: Record<string, string>) => {
    let filtered = users;

    if (filters.role && filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    if (filters.status && filters.status !== 'all') {
      const isActive = filters.status === 'active';
      filtered = filtered.filter(user => user.is_active === isActive);
    }

    if (filters.department && filters.department !== 'all') {
      filtered = filtered.filter(user => user.department === filters.department);
    }

    setFilteredUsers(filtered);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleToggleUserStatus = async (user: User) => {
    const action = user.is_active ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await apiRequest(`/users/${user.id}`, {
          method: 'PUT',
          body: JSON.stringify({ is_active: !user.is_active })
        });
        await loadUsers();
      } catch (error) {
        console.error('Failed to update user status:', error);
      }
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (window.confirm(`Delete ${user.name}? This cannot be undone.`)) {
      try {
        await apiRequest(`/users/${user.id}`, { method: 'DELETE' });
        await loadUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleUserSaved = () => {
    setShowForm(false);
    setEditingUser(null);
    loadUsers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const departments = Array.from(new Set(users.map(u => u.department).filter(Boolean)));
  const filterOptions = [
    {
      key: 'role',
      label: t('user.role'),
      options: [
        { value: 'admin', label: t('user.admin') },
        { value: 'user', label: t('user.user') }
      ]
    },
    {
      key: 'status',
      label: t('user.status'),
      options: [
        { value: 'active', label: t('user.active') },
        { value: 'inactive', label: t('user.inactive') }
      ]
    },
    {
      key: 'department',
      label: t('user.department'),
      options: departments.map(dept => ({ value: dept!, label: t(`dept.${dept!.toLowerCase()}`) || dept! }))
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('user.management')}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('user.management.desc')}</p>
        </div>
        <button
          onClick={handleCreateUser}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          {t('user.add')}
        </button>
      </div>

      {/* Search and Filter */}
      <SearchFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        filterOptions={filterOptions}
        placeholder={`${t('search.placeholder')} users...`}
      />

      {/* Users Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      <Shield className="w-3 h-3 mr-1" />
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? (
                        <><UserCheck className="w-3 h-3 mr-1" />{t('user.active')}</>
                      ) : (
                        <><UserX className="w-3 h-3 mr-1" />{t('user.inactive')}</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.department ? t(`dept.${user.department.toLowerCase()}`) || user.department : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleUserStatus(user)}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_active 
                            ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                            : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                        }`}
                      >
                        {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onClose={() => setShowForm(false)}
          onSave={handleUserSaved}
        />
      )}
    </div>
  );
}