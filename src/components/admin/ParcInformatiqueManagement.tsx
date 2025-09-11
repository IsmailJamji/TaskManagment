import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { ParcInformatique } from '../../types';
import { ParcInformatiqueForm } from './ParcInformatiqueForm';
import { Pagination } from '../common/Pagination';

export const ParcInformatiqueManagement: React.FC = () => {
  const [items, setItems] = useState<ParcInformatique[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ParcInformatique | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAncien, setFilterAncien] = useState<string>('all');
  const [filterOS, setFilterOS] = useState<string>('all');
  const [filterRAM, setFilterRAM] = useState<string>('all');
  const [filterDisque, setFilterDisque] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const { apiRequest } = useApi();

  useEffect(() => {
    loadData();
  }, [currentPage, itemsPerPage, searchTerm, filterType, filterAncien, filterOS, filterRAM, filterDisque, sortBy, sortOrder]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: searchTerm,
        type: filterType,
        ancien: filterAncien === 'ancien' ? 'true' : filterAncien === 'recent' ? 'false' : '',
        os: filterOS !== 'all' ? filterOS : '',
        ram: filterRAM !== 'all' ? filterRAM : '',
        disque: filterDisque !== 'all' ? filterDisque : '',
        sortBy,
        sortOrder
      });
      
      const data = await apiRequest(`/parc-informatique?${params}`);
      setItems(data.items);
      setTotalPages(data.pagination.pages);
      setTotalItems(data.pagination.total);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      try {
        await apiRequest(`/parc-informatique/${id}`, { method: 'DELETE' });
        setItems(items.filter(item => item.id !== id));
        loadData();
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
    loadData();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage: number) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case 'type':
        setFilterType(value);
        break;
      case 'ancien':
        setFilterAncien(value);
        break;
      case 'os':
        setFilterOS(value);
        break;
      case 'ram':
        setFilterRAM(value);
        break;
      case 'disque':
        setFilterDisque(value);
        break;
    }
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: { [key: string]: string } = {
      laptop: 'Laptop',
      desktop: 'Desktop',
      unite_centrale: 'Unité centrale',
      clavier: 'Clavier',
      imprimante: 'Imprimante',
      telephone: 'Téléphone',
      routeur: 'Routeur',
      serveur: 'Serveur',
      souris: 'Souris',
      ecran: 'Écran',
      casque: 'Casque',
      autre: 'Autre'
    };
    return typeLabels[type] || type;
  };

  const getStatusColor = (estAncien: boolean) => {
    return estAncien ? 'text-red-600' : 'text-green-600';
  };

  const getStatusText = (estAncien: boolean) => {
    return estAncien ? 'Ancien' : 'Récent';
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
        <div className="flex space-x-2">
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop</option>
              <option value="unite_centrale">Unité centrale</option>
              <option value="clavier">Clavier</option>
              <option value="imprimante">Imprimante</option>
              <option value="telephone">Téléphone</option>
              <option value="routeur">Routeur</option>
              <option value="serveur">Serveur</option>
              <option value="souris">Souris</option>
              <option value="ecran">Écran</option>
              <option value="casque">Casque</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Âge</label>
            <select
              value={filterAncien}
              onChange={(e) => handleFilterChange('ancien', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous</option>
                <option value="ancien">Ancien (&gt;5ans)</option>
                <option value="recent">Récent (≤5ans)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OS</label>
            <input
              type="text"
              value={filterOS}
              onChange={(e) => handleFilterChange('os', e.target.value)}
              placeholder="Filtrer par OS..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RAM</label>
            <input
              type="text"
              value={filterRAM}
              onChange={(e) => handleFilterChange('ram', e.target.value)}
              placeholder="Filtrer par RAM..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Disque</label>
            <input
              type="text"
              value={filterDisque}
              onChange={(e) => handleFilterChange('disque', e.target.value)}
              placeholder="Filtrer par disque..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('type')}
                >
                  Type {sortBy === 'type' && (sortOrder === 'ASC' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('marque')}
                >
                  Marque {sortBy === 'marque' && (sortOrder === 'ASC' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modèle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  N° Série
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket N°
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Département
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Première main
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('age_ans')}
                >
                  Âge {sortBy === 'age_ans' && (sortOrder === 'ASC' ? '↑' : '↓')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
        {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {getTypeLabel(item.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.marque}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.modele || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.serial_number || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.ticket_numero || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.proprietaire}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.departement || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.est_premiere_main ? 'Oui' : 'Non'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.age_ans} ans
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`font-medium ${getStatusColor(item.est_ancien)}`}>
                      {getStatusText(item.est_ancien)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => handleEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-900"
                >
                  Supprimer
                </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
              </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Formulaire */}
      {showForm && (
        <ParcInformatiqueForm
          item={editingItem}
          onClose={handleFormClose}
          onSubmit={handleFormClose}
        />
      )}
    </div>
  );
};
