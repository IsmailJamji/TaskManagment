import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../contexts/AuthContext';
import { Projet, SousTache } from '../../types';
import { Calendar, Users, Flag, CheckCircle, Clock, AlertTriangle, FolderOpen, Edit } from 'lucide-react';
import { SousTacheEditModal } from './SousTacheEditModal';

export function UserProjets() {
  const [projets, setProjets] = useState<Projet[]>([]);
  const [sousTaches, setSousTaches] = useState<SousTache[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjet, setSelectedProjet] = useState<Projet | null>(null);
  const [showSousTaches, setShowSousTaches] = useState(false);
  const [editingSousTache, setEditingSousTache] = useState<SousTache | null>(null);
  const { user } = useAuth();
  const { apiRequest } = useApi();

  useEffect(() => {
    loadUserProjets();
  }, []);

  const loadUserProjets = async () => {
    try {
      setLoading(true);
      const [projetsData, sousTachesData] = await Promise.all([
        apiRequest('/projets/user'),
        apiRequest('/sous-taches/user')
      ]);
      
      setProjets(projetsData || []);
      setSousTaches(sousTachesData || []);
    } catch (error) {
      console.error('Failed to load user projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjetSousTaches = async (projetId: number) => {
    try {
      const response = await apiRequest(`/projets/${projetId}/sous-taches`);
      setSousTaches(response || []);
      setShowSousTaches(true);
    } catch (error) {
      console.error('Failed to load project subtasks:', error);
    }
  };

  const handleEditSousTache = (sousTache: SousTache) => {
    setEditingSousTache(sousTache);
  };

  const handleUpdateSousTache = (updatedSousTache: SousTache) => {
    setSousTaches(prev => 
      prev.map(st => st.id === updatedSousTache.id ? updatedSousTache : st)
    );
    setEditingSousTache(null);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspendu': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'termine': return 'bg-green-100 text-green-800 border-green-200';
      case 'annule': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'planifie': return 'Planifié';
      case 'en_cours': return 'En cours';
      case 'suspendu': return 'Suspendu';
      case 'termine': return 'Terminé';
      case 'annule': return 'Annulé';
      default: return statut;
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPrioriteLabel = (priorite: string) => {
    switch (priorite) {
      case 'high': return 'Élevée';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return priorite;
    }
  };

  const getSousTacheStatutColor = (statut: string) => {
    switch (statut) {
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSousTacheStatutLabel = (statut: string) => {
    switch (statut) {
      case 'not_started': return 'Non démarrée';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'blocked': return 'Bloquée';
      default: return statut;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Chargement des projets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <FolderOpen className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes Projets</h1>
          <p className="text-gray-600">Gérez vos projets et sous-tâches assignées</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projets</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{projets.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En Cours</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {projets.filter(p => p.statut === 'en_cours').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Terminés</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {projets.filter(p => p.statut === 'termine').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sous-tâches</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{sousTaches.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Flag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des Projets */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Mes Projets Assignés</h2>
        </div>
        
        <div className="p-6">
          {projets.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet assigné</h3>
              <p className="text-gray-600">Vous n'êtes actuellement assigné à aucun projet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projets.map((projet) => (
                <div
                  key={projet.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {projet.nom}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {projet.description || 'Aucune description'}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatutColor(projet.statut)}`}>
                          {getStatutLabel(projet.statut)}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPrioriteColor(projet.priorite)}`}>
                          {getPrioriteLabel(projet.priorite)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Début: {new Date(projet.date_debut).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Fin: {new Date(projet.date_fin_prevue).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2" />
                          <span>Chef: {projet.chef_projet_name || 'Non assigné'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedProjet(projet);
                        loadProjetSousTaches(projet.id);
                      }}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Voir les sous-tâches
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal des Sous-tâches */}
      {showSousTaches && selectedProjet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Sous-tâches - {selectedProjet.nom}</h2>
                <p className="text-gray-600 mt-1">Gérez les sous-tâches de ce projet</p>
              </div>
              <button
                onClick={() => setShowSousTaches(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {sousTaches.length === 0 ? (
                <div className="text-center py-12">
                  <Flag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune sous-tâche</h3>
                  <p className="text-gray-600">Ce projet n'a pas encore de sous-tâches assignées.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sousTaches.map((sousTache) => (
                    <div
                      key={sousTache.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {sousTache.nom}
                            </h3>
                            {sousTache.assigne_id === user?.id && (
                              <button
                                onClick={() => handleEditSousTache(sousTache)}
                                className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Modifier
                              </button>
                            )}
                          </div>
                          <p className="text-gray-600 mb-4">
                            {sousTache.description || 'Aucune description'}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSousTacheStatutColor(sousTache.statut)}`}>
                              {getSousTacheStatutLabel(sousTache.statut)}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPrioriteColor(sousTache.priorite)}`}>
                              {getPrioriteLabel(sousTache.priorite)}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Début: {new Date(sousTache.date_debut).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Fin: {new Date(sousTache.date_fin_prevue).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              <span>Assigné à: {sousTache.assigne_name || 'Non assigné'}</span>
                            </div>
                          </div>

                          {/* Barre de progression */}
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">Progression</span>
                              <span className="text-sm text-gray-600">{sousTache.progression}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${sousTache.progression}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition des sous-tâches */}
      {editingSousTache && (
        <SousTacheEditModal
          sousTache={editingSousTache}
          onClose={() => setEditingSousTache(null)}
          onUpdate={handleUpdateSousTache}
        />
      )}
    </div>
  );
}
