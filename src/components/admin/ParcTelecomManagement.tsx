import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { ParcTelecom } from '../../types';
import { ParcTelecomForm } from './ParcTelecomForm';

export const ParcTelecomManagement: React.FC = () => {
  const [items, setItems] = useState<ParcTelecom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ParcTelecom | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOperateur, setFilterOperateur] = useState<string>('all');
  const { apiRequest } = useApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const itemsData = await apiRequest('/parc-telecom');
      
      setItems(itemsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await apiRequest(`/parc-telecom/${id}`, { method: 'DELETE' });
        setItems(items.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleEdit = (item: ParcTelecom) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = (item: ParcTelecom) => {
    if (editingItem) {
      setItems(items.map(i => i.id === item.id ? item : i));
    } else {
      setItems([item, ...items]);
    }
    handleFormClose();
  };


  const filteredItems = items.filter(item => {
    const matchesSearch = item.numero_puce.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.proprietaire.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOperateur = filterOperateur === 'all' || item.operateur === filterOperateur;
    
    return matchesSearch && matchesOperateur;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Parc Télécom</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ajouter
          </button>
        </div>
      </div>


      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Numéro de puce, propriétaire..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opérateur
            </label>
            <select
              value={filterOperateur}
              onChange={(e) => setFilterOperateur(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les opérateurs</option>
              <option value="iam">IAM</option>
              <option value="inwi">INWI</option>
            </select>
          </div>
          <div className="flex items-end">
            <span className="text-sm text-gray-600">
              {filteredItems.length} élément(s) trouvé(s)
            </span>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.operateur.toUpperCase()}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.numero_puce}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Propriétaire:</span> {item.proprietaire}
              </div>
              <div>
                <span className="font-medium">Département:</span> {item.departement}
              </div>
              
              {item.specifications && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="font-medium text-gray-700 mb-2">Spécifications:</div>
                  {item.specifications.type_abonnement && (
                    <div>Type: {item.specifications.type_abonnement}</div>
                  )}
                  {item.specifications.forfait && (
                    <div>Forfait: {item.specifications.forfait}</div>
                  )}
                  {item.specifications.date_activation && (
                    <div>Activation: {item.specifications.date_activation}</div>
                  )}
                  {item.specifications.autres && (
                    <div>Autres: {item.specifications.autres}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <ParcTelecomForm
          item={editingItem}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};
