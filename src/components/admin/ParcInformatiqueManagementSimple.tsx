import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { ParcInformatique } from '../../types';
import { ParcInformatiqueForm } from './ParcInformatiqueForm';

export const ParcInformatiqueManagementSimple: React.FC = () => {
  const [items, setItems] = useState<ParcInformatique[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ParcInformatique | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAncien, setFilterAncien] = useState<string>('');
  const [filterOS, setFilterOS] = useState<string>('all');
  const [filterRAM, setFilterRAM] = useState<string>('all');
  const [filterDisque, setFilterDisque] = useState<string>('all');
  const [filterAccessoires, setFilterAccessoires] = useState<string>('all');
  const { apiRequest } = useApi();

  useEffect(() => {
    loadData();
  }, [searchTerm, filterType, filterAncien, filterOS, filterRAM, filterDisque, filterAccessoires]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (searchTerm) params.append('search', searchTerm);
      if (filterType !== 'all') params.append('type', filterType);
      if (filterAncien) params.append('ancien', filterAncien);
      if (filterOS !== 'all') params.append('os', filterOS);
      if (filterRAM !== 'all') params.append('ram', filterRAM);
      if (filterDisque !== 'all') params.append('disque', filterDisque);
      if (filterAccessoires !== 'all') params.append('accessoires', filterAccessoires);
      
      const queryString = params.toString();
      const itemsData = await apiRequest(`/parc-informatique-simple${queryString ? `?${queryString}` : ''}`);
      
      // Filtrage côté frontend pour les accessoires
      let filteredItems = itemsData;
      if (filterAccessoires === 'with') {
        filteredItems = itemsData.filter(item => 
          item.equipements_supplementaires && 
          Object.keys(item.equipements_supplementaires).length > 0 &&
          Object.values(item.equipements_supplementaires).some(value => value === true)
        );
      } else if (filterAccessoires === 'without') {
        filteredItems = itemsData.filter(item => 
          !item.equipements_supplementaires || 
          Object.keys(item.equipements_supplementaires).length === 0 ||
          !Object.values(item.equipements_supplementaires).some(value => value === true)
        );
      }
      
      setItems(filteredItems);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await apiRequest(`/parc-informatique-simple/${id}`, { method: 'DELETE' });
        setItems(items.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    }
  };

  const handleEdit = (item: ParcInformatique) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleFormSubmit = (item: ParcInformatique) => {
    if (editingItem) {
      setItems(items.map(i => i.id === item.id ? item : i));
    } else {
      setItems([item, ...items]);
    }
    handleFormClose();
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'laptop': 'Laptop',
      'desktop': 'Desktop',
      'monitor': 'Moniteur',
      'printer': 'Imprimante',
      'other': 'Autre'
    };
    return types[type] || type;
  };

  const getAgeColor = (age: number) => {
    if (age > 5) return 'text-red-600 bg-red-100';
    if (age > 3) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

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
        <h2 className="text-2xl font-bold text-gray-900">Parc Informatique</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Ajouter
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Marque, propriétaire, modèle..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="monitor">Moniteur</option>
              <option value="printer">Imprimante</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Âge
            </label>
            <select
              value={filterAncien}
              onChange={(e) => setFilterAncien(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="false">Récent (≤ 5 ans)</option>
              <option value="true">Ancien (&gt; 5 ans)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accessoires
            </label>
            <select
              value={filterAccessoires}
              onChange={(e) => setFilterAccessoires(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
              <option value="with">Avec accessoires</option>
              <option value="without">Sans accessoires</option>
            </select>
          </div>

          <div className="flex items-end">
            <span className="text-sm text-gray-600">
              {items.length} élément(s) trouvé(s)
            </span>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getTypeLabel(item.type)}
                  </h3>
                  {item.equipements_supplementaires && Object.keys(item.equipements_supplementaires).length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      🔧 Accessoires
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {item.marque} {item.modele}
                </p>
                {item.serial_number && (
                  <p className="text-xs text-gray-500">
                    S/N: {item.serial_number}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(item)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
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
                <span className="font-medium">Département:</span> {item.departement || 'N/A'}
              </div>
              <div>
                <span className="font-medium">Date d'acquisition:</span> {new Date(item.date_acquisition).toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Âge:</span> 
                <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getAgeColor(item.age_ans || 0)}`}>
                  {item.age_ans || 0} ans
                </span>
              </div>
              
              {item.specifications && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="font-medium text-gray-700 mb-2">Spécifications:</div>
                  {item.specifications.processeur && (
                    <div>CPU: {item.specifications.processeur}</div>
                  )}
                  {item.specifications.ram && (
                    <div>RAM: {item.specifications.ram}</div>
                  )}
                  {item.specifications.disque_dur && (
                    <div>Disque: {item.specifications.disque_dur}</div>
                  )}
                  {item.specifications.os && (
                    <div>OS: {item.specifications.os}</div>
                  )}
                  {item.specifications.autres && (
                    <div>Autres: {item.specifications.autres}</div>
                  )}
                </div>
              )}

              {/* Équipements supplémentaires */}
              {item.equipements_supplementaires && Object.keys(item.equipements_supplementaires).length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="font-medium text-gray-700 mb-2">Équipements supplémentaires:</div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(item.equipements_supplementaires).map(([key, value]) => {
                      if (value === true) {
                        const iconMap: { [key: string]: string } = {
                          'ecran': '🖥️',
                          'casque': '🎧',
                          'souris': '🖱️',
                          'clavier': '⌨️'
                        };
                        return (
                          <span
                            key={key}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {iconMap[key] || '🔧'} {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">Aucun élément trouvé</div>
          <div className="text-gray-400 text-sm mt-2">
            {searchTerm || filterType !== 'all' || filterAncien 
              ? 'Essayez de modifier vos filtres de recherche'
              : 'Cliquez sur "Ajouter" pour créer votre premier élément'
            }
          </div>
        </div>
      )}

      {showForm && (
        <ParcInformatiqueForm
          item={editingItem}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
};
