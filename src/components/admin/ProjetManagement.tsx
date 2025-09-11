import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { Projet, SousTache, User } from '../../types';
import { ProjetForm } from './ProjetForm';
import { SousTacheForm } from './SousTacheForm';

export const ProjetManagement: React.FC = () => {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProjetForm, setShowProjetForm] = useState(false);
  const [showSousTacheForm, setShowSousTacheForm] = useState(false);
  const [editingProjet, setEditingProjet] = useState<Projet | null>(null);
  const [editingSousTache, setEditingSousTache] = useState<SousTache | null>(null);
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
  const [sousTaches, setSousTaches] = useState<SousTache[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const { apiRequest } = useApi();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projetsData, usersData] = await Promise.all([
        apiRequest('/projets'),
        apiRequest('/users')
      ]);
      setProjets(projetsData);
      setUsers(usersData);
      
      if (!usersData || usersData.length === 0) {
        console.warn('Aucun utilisateur trouvé. Veuillez d\'abord créer des utilisateurs.');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      if (error.message.includes('users')) {
        console.warn('Impossible de charger les utilisateurs. Vérifiez la connexion à la base de données.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadSousTaches = async (projetId: number) => {
    try {
      const data = await apiRequest(`/projets/${projetId}/sous-taches`);
      setSousTaches(data);
    } catch (error) {
      console.error('Error loading subtasks:', error);
    }
  };

  const handleDeleteProjet = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await apiRequest(`/projets/${id}`, { method: 'DELETE' });
        setProjets(projets.filter(projet => projet.id !== id));
        if (selectedProjet?.id === id) {
          setSelectedProjet(null);
          setSousTaches([]);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleDeleteSousTache = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sous-tâche ?')) {
      try {
        await apiRequest(`/projets/sous-taches/${id}`, { method: 'DELETE' });
        setSousTaches(sousTaches.filter(st => st.id !== id));
      } catch (error) {
        console.error('Error deleting subtask:', error);
      }
    }
  };

  const handleEditProjet = (projet: Projet) => {
    setEditingProjet(projet);
    setShowProjetForm(true);
  };

  const handleEditSousTache = (sousTache: SousTache) => {
    setEditingSousTache(sousTache);
    setShowSousTacheForm(true);
  };

  const handleFormClose = () => {
    setShowProjetForm(false);
    setShowSousTacheForm(false);
    setEditingProjet(null);
    setEditingSousTache(null);
  };

  const handleProjetSubmit = (projet: Projet) => {
    if (editingProjet) {
      setProjets(projets.map(p => p.id === projet.id ? projet : p));
    } else {
      setProjets([projet, ...projets]);
    }
    handleFormClose();
  };

  const handleSousTacheSubmit = (sousTache: SousTache) => {
    if (editingSousTache) {
      setSousTaches(sousTaches.map(st => st.id === sousTache.id ? sousTache : st));
    } else {
      setSousTaches([sousTache, ...sousTaches]);
    }
    handleFormClose();
  };

  const handleSelectProjet = (projet: Projet) => {
    setSelectedProjet(projet);
    loadSousTaches(projet.id);
  };

  const filteredProjets = projets.filter(projet => {
    const matchesSearch = projet.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projet.chef_projet_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatut = filterStatut === 'all' || projet.statut === filterStatut;
    
    return matchesSearch && matchesStatut;
  });

  const getStatutLabel = (statut: string) => {
    const labels: { [key: string]: string } = {
      'planifie': 'Planifié',
      'en_cours': 'En cours',
      'suspendu': 'Suspendu',
      'termine': 'Terminé',
      'annule': 'Annulé'
    };
    return labels[statut] || statut;
  };

  const getStatutColor = (statut: string) => {
    const colors: { [key: string]: string } = {
      'planifie': 'bg-blue-100 text-blue-800',
      'en_cours': 'bg-green-100 text-green-800',
      'suspendu': 'bg-yellow-100 text-yellow-800',
      'termine': 'bg-gray-100 text-gray-800',
      'annule': 'bg-red-100 text-red-800'
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
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
        <h2 className="text-2xl font-bold text-gray-900">Gestion de Projet</h2>
        <button
          onClick={() => setShowProjetForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Nouveau Projet
        </button>
      </div>

      {users.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.726-1.36 3.491 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Aucun utilisateur disponible
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Pour pouvoir créer des projets, vous devez d'abord créer des utilisateurs.</p>
                <p className="mt-1">Allez dans la section "Utilisateurs" pour en ajouter.</p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              placeholder="Nom, description, chef de projet..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="planifie">Planifié</option>
              <option value="en_cours">En cours</option>
              <option value="suspendu">Suspendu</option>
              <option value="termine">Terminé</option>
              <option value="annule">Annulé</option>
            </select>
          </div>
          <div className="flex items-end">
            <span className="text-sm text-gray-600">
              {filteredProjets.length} projet(s) trouvé(s)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projets List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Projets</h3>
          <div className="space-y-4">
            {filteredProjets.map((projet) => (
              <div
                key={projet.id}
                className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
                  selectedProjet?.id === projet.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                } cursor-pointer hover:shadow-lg transition-shadow`}
                onClick={() => handleSelectProjet(projet)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {projet.nom}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(projet.statut)}`}>
                    {getStatutLabel(projet.statut)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {projet.description}
                </p>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <div>Chef: {projet.chef_projet_name}</div>
                  <div>Début: {new Date(projet.date_debut).toLocaleDateString()}</div>
                  <div>Fin prévue: {new Date(projet.date_fin_prevue).toLocaleDateString()}</div>
                  {projet.budget && (
                    <div>Budget: {projet.budget.toLocaleString()} MAD</div>
                  )}
                </div>

                <div className="flex justify-end space-x-2 mt-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditProjet(projet);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProjet(projet.id);
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sous-tâches */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Sous-tâches {selectedProjet && `- ${selectedProjet.nom}`}
            </h3>
            {selectedProjet && (
              <button
                onClick={() => setShowSousTacheForm(true)}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                Ajouter
              </button>
            )}
          </div>

          {selectedProjet ? (
            <div className="space-y-3">
              {sousTaches.map((sousTache) => (
                <div
                  key={sousTache.id}
                  className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {sousTache.nom}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(sousTache.statut)}`}>
                      {getStatutLabel(sousTache.statut)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {sousTache.description}
                  </p>
                  
                  <div className="text-sm text-gray-500 space-y-1">
                    <div>Assigné à: {sousTache.assigne_name}</div>
                    <div>Début: {new Date(sousTache.date_debut).toLocaleDateString()}</div>
                    <div>Fin prévue: {new Date(sousTache.date_fin_prevue).toLocaleDateString()}</div>
                    <div>Progression: {sousTache.progression}%</div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${sousTache.progression}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => handleEditSousTache(sousTache)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteSousTache(sousTache.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
              
              {sousTaches.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Aucune sous-tâche pour ce projet
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Sélectionnez un projet pour voir ses sous-tâches
            </div>
          )}
        </div>
      </div>

      {showProjetForm && (
        <ProjetForm
          projet={editingProjet}
          users={users}
          onClose={handleFormClose}
          onSubmit={handleProjetSubmit}
        />
      )}

      {showSousTacheForm && selectedProjet && (
        <SousTacheForm
          sousTache={editingSousTache}
          projet={selectedProjet}
          users={users}
          onClose={handleFormClose}
          onSubmit={handleSousTacheSubmit}
        />
      )}
    </div>
  );
};
