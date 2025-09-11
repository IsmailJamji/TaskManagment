import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { useApi } from '../../hooks/useApi';

interface UserSearchSelectProps {
  selectedUsers: User[];
  onUsersChange: (users: User[]) => void;
  placeholder?: string;
  multiple?: boolean;
  className?: string;
}

export const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
  selectedUsers,
  onUsersChange,
  placeholder = "Rechercher un utilisateur...",
  multiple = true,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { apiRequest } = useApi();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await apiRequest('/users');
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: User) => {
    if (multiple) {
      if (!selectedUsers.find(u => u.id === user.id)) {
        onUsersChange([...selectedUsers, user]);
      }
    } else {
      onUsersChange([user]);
    }
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleUserRemove = (userId: number) => {
    onUsersChange(selectedUsers.filter(user => user.id !== userId));
  };

  const getDisplayText = () => {
    if (selectedUsers.length === 0) return '';
    if (selectedUsers.length === 1) return selectedUsers[0].name;
    return `${selectedUsers.length} utilisateur(s) sélectionné(s)`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input field */}
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-[40px] focus-within:ring-2 focus-within:ring-blue-500">
        {/* Selected users chips */}
        {selectedUsers.map(user => (
          <span
            key={user.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
          >
            {user.name}
            <button
              type="button"
              onClick={() => handleUserRemove(user.id)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
        
        {/* Search input */}
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedUsers.length === 0 ? placeholder : "Ajouter un utilisateur..."}
          className="flex-1 min-w-[200px] outline-none bg-transparent"
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {loading ? (
            <div className="p-3 text-center text-gray-500">Chargement...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-3 text-center text-gray-500">
              {searchTerm.length < 2 ? 'Tapez au moins 2 caractères' : 'Aucun utilisateur trouvé'}
            </div>
          ) : (
            filteredUsers.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleUserSelect(user)}
                disabled={selectedUsers.find(u => u.id === user.id) !== undefined}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ${
                  selectedUsers.find(u => u.id === user.id) ? 'bg-blue-50' : ''
                }`}
              >
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
                {user.department && (
                  <div className="text-xs text-gray-400">{user.department}</div>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};



