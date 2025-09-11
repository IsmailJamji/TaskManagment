
import React, { useState, useEffect } from 'react';
import { Projet, User, SousTache } from '../../types';
import { useApi } from '../../hooks/useApi';
import { UserSearchSelect } from '../common/UserSearchSelect';

interface ProjetFormProps {
  projet?: Projet | null;
  users: User[];
  onClose: () => void;
  onSubmit: (projet: Projet) => void;
}

export const ProjetForm: React.FC<ProjetFormProps> = ({
  projet,
  users,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    chef_projet_id: 0,
    date_debut: '',
    date_fin_prevue: '',
    statut: 'planifie' as const,
    priorite: 'medium' as const,
    budget: '',
    equipe_ids: [] as number[]
  });

  const [sousTaches, setSousTaches] = useState<SousTache[]>([]);
  const [showSousTacheForm, setShowSousTacheForm] = useState(false);
  const [editingSousTacheIndex, setEditingSousTacheIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingSousTaches, setLoadingSousTaches] = useState(false);
  const [selectedChefProjet, setSelectedChefProjet] = useState<User | null>(null);
  const [selectedEquipe, setSelectedEquipe] = useState<User[]>([]);
  const { apiRequest } = useApi();

  // Fonction pour charger les sous-tâches d'un projet
  const loadSousTaches = async (projetId: number) => {
    setLoadingSousTaches(true);
    try {
      const response = await apiRequest(`/projets/${projetId}/sous-taches`, {
        method: 'GET'
      });
      setSousTaches(response || []);
    } catch (error) {
      console.error('Error loading subtasks:', error);
      setSousTaches([]);
    } finally {
      setLoadingSousTaches(false);
    }
  };

  // Fonction pour formater les dates au format YYYY-MM-DD
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (projet) {
      setFormData({
        nom: projet.nom,
        description: projet.description || '',
        chef_projet_id: projet.chef_projet_id,
        date_debut: formatDateForInput(projet.date_debut),
        date_fin_prevue: formatDateForInput(projet.date_fin_prevue),
        statut: projet.statut,
        priorite: projet.priorite,
        budget: projet.budget?.toString() || '',
        equipe_ids: projet.equipe_ids || []
      });

      // Charger les sous-tâches existantes
      loadSousTaches(projet.id);
    } else {
      // Set default dates
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        date_debut: today,
        date_fin_prevue: nextMonthStr
      }));
      
      // Réinitialiser les sous-tâches pour un nouveau projet
      setSousTaches([]);
    }
  }, [projet]);

  // Synchroniser selectedChefProjet avec chef_projet_id
  useEffect(() => {
    if (projet && projet.chef_projet_id && users.length > 0) {
      const chefProjet = users.find(user => user.id === projet.chef_projet_id);
      if (chefProjet) {
        setSelectedChefProjet(chefProjet);
      }
    }
  }, [projet, users]);

  // Protection contre la réinitialisation des dates lors des modifications de sous-tâches
  useEffect(() => {
    // Ne pas réinitialiser les dates si on est en train de modifier des sous-tâches
    if (showSousTacheForm || editingSousTacheIndex !== null) {
      return;
    }
    
    // Ne réinitialiser que si le projet a changé et que les dates ne sont pas déjà définies
    if (projet && (!formData.date_debut || !formData.date_fin_prevue)) {
      setFormData(prev => ({
        ...prev,
        date_debut: formatDateForInput(projet.date_debut),
        date_fin_prevue: formatDateForInput(projet.date_fin_prevue)
      }));
    }
  }, [projet, showSousTacheForm, editingSousTacheIndex]);

  // Synchroniser selectedEquipe avec equipe_ids
  useEffect(() => {
    if (projet && projet.equipe_ids && users.length > 0) {
      const equipeUsers = users.filter(user => projet.equipe_ids.includes(user.id));
      setSelectedEquipe(equipeUsers);
    }
  }, [projet, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null
      };


      let result;
      if (projet) {
        // Modification d'un projet existant
        result = await apiRequest(`/projets/${projet.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
        
        // Recharger les sous-tâches après modification
        await loadSousTaches(projet.id);
      } else {
        // Création d'un nouveau projet
        result = await apiRequest('/projets', {
          method: 'POST',
          body: JSON.stringify(data)
        });

        // Créer les sous-tâches pour le nouveau projet
        if (sousTaches.length > 0) {
          for (const sousTache of sousTaches) {
            try {
              await apiRequest(`/projets/${result.id}/sous-taches`, {
                method: 'POST',
                body: JSON.stringify({
                  ...sousTache,
                  projet_id: result.id
                })
              });
            } catch (error) {
              console.error('Error creating subtask:', error);
            }
          }
        }
      }

      onSubmit(result);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleEquipeChange = (userId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        equipe_ids: [...prev.equipe_ids, userId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        equipe_ids: prev.equipe_ids.filter(id => id !== userId)
      }));
    }
  };

  const handleAddSousTache = () => {
    setEditingSousTacheIndex(null);
    setShowSousTacheForm(true);
  };

  const handleEditSousTache = (index: number) => {
    setEditingSousTacheIndex(index);
    setShowSousTacheForm(true);
  };

  const handleDeleteSousTache = async (sousTache: SousTache) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette sous-tâche ?')) {
      try {
        if (sousTache.id) {
          // Supprimer de la base de données
          await apiRequest(`/sous-taches/${sousTache.id}`, {
            method: 'DELETE'
          });
        }
        
        // Supprimer de la liste locale
        setSousTaches(prev => prev.filter(st => st.id !== sousTache.id));
      } catch (error) {
        console.error('Error deleting subtask:', error);
        alert('Erreur lors de la suppression de la sous-tâche');
      }
    }
  };

  const handleSousTacheSubmit = async (sousTacheData: Partial<SousTache>) => {
    try {
      if (editingSousTacheIndex !== null && sousTaches[editingSousTacheIndex].id) {
        // Modification d'une sous-tâche existante
        const existingSousTache = sousTaches[editingSousTacheIndex];
        const updatedSousTache = await apiRequest(`/sous-taches/${existingSousTache.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...sousTacheData,
            projet_id: projet?.id
          })
        });
        
        setSousTaches(prev => prev.map((st, i) => 
          i === editingSousTacheIndex ? updatedSousTache : st
        ));
      } else {
        // Création d'une nouvelle sous-tâche
        if (projet) {
          // Projet existant - créer directement en base
          const newSousTache = await apiRequest(`/projets/${projet.id}/sous-taches`, {
            method: 'POST',
            body: JSON.stringify({
              ...sousTacheData,
              projet_id: projet.id
            })
          });
          
          setSousTaches(prev => [...prev, newSousTache]);
        } else {
          // Nouveau projet - ajouter à la liste locale
          setSousTaches(prev => [...prev, sousTacheData as SousTache]);
        }
      }
      
      setShowSousTacheForm(false);
      setEditingSousTacheIndex(null);
      
      // IMPORTANT: Ne pas réinitialiser les données du formulaire principal
      // Les valeurs de chef de projet et dates doivent rester intactes
    } catch (error) {
      console.error('Error saving subtask:', error);
      alert('Erreur lors de la sauvegarde de la sous-tâche');
    }
  };

  const handleSousTacheFormClose = () => {
    setShowSousTacheForm(false);
    setEditingSousTacheIndex(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {projet ? 'Modifier le projet' : 'Nouveau projet'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du projet *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chef de projet *
              </label>
              <UserSearchSelect
                selectedUsers={selectedChefProjet ? [selectedChefProjet] : []}
                onUsersChange={(users) => {
                  if (users.length > 0) {
                    setSelectedChefProjet(users[0]);
                    setFormData(prev => ({ ...prev, chef_projet_id: users[0].id }));
                  } else {
                    setSelectedChefProjet(null);
                    setFormData(prev => ({ ...prev, chef_projet_id: 0 }));
                  }
                }}
                placeholder="Rechercher un chef de projet..."
                multiple={false}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget (MAD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                type="date"
                value={formData.date_debut}
                onChange={(e) => setFormData(prev => ({ ...prev, date_debut: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin prévue *
              </label>
              <input
                type="date"
                value={formData.date_fin_prevue}
                onChange={(e) => setFormData(prev => ({ ...prev, date_fin_prevue: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planifie">Planifié</option>
                <option value="en_cours">En cours</option>
                <option value="suspendu">Suspendu</option>
                <option value="termine">Terminé</option>
                <option value="annule">Annulé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité
              </label>
              <select
                value={formData.priorite}
                onChange={(e) => setFormData(prev => ({ ...prev, priorite: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
              </select>
            </div>
          </div>

          {/* Équipe */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-gray-700">Équipe du projet</h4>
              <span className="text-sm text-gray-500">
                {selectedEquipe.length} membre(s) sélectionné(s)
              </span>
            </div>
            <UserSearchSelect
              selectedUsers={selectedEquipe}
              onUsersChange={(users) => {
                setSelectedEquipe(users);
                setFormData(prev => ({ ...prev, equipe_ids: users.map(u => u.id) }));
              }}
              placeholder="Rechercher des membres d'équipe..."
              multiple={true}
              className="w-full"
            />
            {selectedEquipe.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">Aucun membre sélectionné</p>
            )}
          </div>

          {/* Sous-tâches */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-md font-medium text-gray-700">Sous-tâches planifiées</h4>
              <button
                type="button"
                onClick={handleAddSousTache}
                className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                + Ajouter une sous-tâche
              </button>
            </div>
            
            {loadingSousTaches ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-500">Chargement des sous-tâches...</span>
              </div>
            ) : sousTaches.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sousTaches.map((sousTache, index) => (
                  <div key={sousTache.id || index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {sousTache.nom}
                        {sousTache.id && (
                          <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            Sauvegardé
                          </span>
                        )}
                        {!sousTache.id && (
                          <span className="ml-2 text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                            En attente
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Assigné à: {users.find(u => u.id === sousTache.assigne_id)?.name || 'Non assigné'} | 
                        Début: {sousTache.date_debut} | 
                        Fin: {sousTache.date_fin_prevue}
                        {sousTache.progression !== undefined && (
                          <span> | Progression: {sousTache.progression}%</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleEditSousTache(index)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSousTache(sousTache)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune sous-tâche planifiée
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : (projet ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>

      {/* Sous-tâche Form Modal */}
      {showSousTacheForm && (
        <SousTacheFormModal
          sousTache={editingSousTacheIndex !== null ? sousTaches[editingSousTacheIndex] : undefined}
          users={users}
          onClose={handleSousTacheFormClose}
          onSubmit={handleSousTacheSubmit}
        />
      )}
    </div>
  );
};

// Composant modal pour les sous-tâches
interface SousTacheFormModalProps {
  sousTache?: Partial<SousTache>;
  users: User[];
  onClose: () => void;
  onSubmit: (sousTache: Partial<SousTache>) => void;
}

const SousTacheFormModal: React.FC<SousTacheFormModalProps> = ({
  sousTache,
  users,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    assigne_id: 0,
    date_debut: '',
    date_fin_prevue: '',
    statut: 'not_started' as const,
    priorite: 'medium' as const,
    progression: 0
  });

  useEffect(() => {
    if (sousTache) {
      setFormData({
        nom: sousTache.nom || '',
        description: sousTache.description || '',
        assigne_id: sousTache.assigne_id || 0,
        date_debut: sousTache.date_debut || '',
        date_fin_prevue: sousTache.date_fin_prevue || '',
        statut: sousTache.statut || 'not_started',
        priorite: sousTache.priorite || 'medium',
        progression: sousTache.progression || 0
      });
    } else {
      // Set default dates
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      
      setFormData(prev => ({
        ...prev,
        date_debut: today,
        date_fin_prevue: nextWeekStr
      }));
    }
  }, [sousTache]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.assigne_id === 0) {
      alert('Veuillez sélectionner un utilisateur');
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {sousTache ? 'Modifier la sous-tâche' : 'Nouvelle sous-tâche'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la sous-tâche *
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigné à *
            </label>
            <UserSearchSelect
              selectedUsers={users.filter(u => u.id === formData.assigne_id)}
              onUsersChange={(selectedUsers) => {
                if (selectedUsers.length > 0) {
                  setFormData(prev => ({ ...prev, assigne_id: selectedUsers[0].id }));
                } else {
                  setFormData(prev => ({ ...prev, assigne_id: 0 }));
                }
              }}
              placeholder="Rechercher un utilisateur..."
              multiple={false}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début *
              </label>
              <input
                type="date"
                value={formData.date_debut}
                onChange={(e) => setFormData(prev => ({ ...prev, date_debut: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin prévue *
              </label>
              <input
                type="date"
                value={formData.date_fin_prevue}
                onChange={(e) => setFormData(prev => ({ ...prev, date_fin_prevue: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité
              </label>
              <select
                value={formData.priorite}
                onChange={(e) => setFormData(prev => ({ ...prev, priorite: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progression (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.progression}
                onChange={(e) => setFormData(prev => ({ ...prev, progression: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {sousTache ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
