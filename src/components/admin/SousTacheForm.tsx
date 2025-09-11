import React, { useState, useEffect } from 'react';
import { SousTache, Projet, User } from '../../types';
import { useApi } from '../../hooks/useApi';

interface SousTacheFormProps {
  sousTache?: SousTache | null;
  projet: Projet;
  users: User[];
  onClose: () => void;
  onSubmit: (sousTache: SousTache) => void;
}

export const SousTacheForm: React.FC<SousTacheFormProps> = ({
  sousTache,
  projet,
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

  const [loading, setLoading] = useState(false);
  const { apiRequest } = useApi();

  useEffect(() => {
    if (sousTache) {
      setFormData({
        nom: sousTache.nom,
        description: sousTache.description || '',
        assigne_id: sousTache.assigne_id,
        date_debut: sousTache.date_debut,
        date_fin_prevue: sousTache.date_fin_prevue,
        statut: sousTache.statut,
        priorite: sousTache.priorite,
        progression: sousTache.progression
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        projet_id: projet.id
      };

      let result;
      if (sousTache) {
        result = await apiRequest(`/projets/sous-taches/${sousTache.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } else {
        result = await apiRequest(`/projets/${projet.id}/sous-taches`, {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }

      onSubmit(result);
    } catch (error) {
      console.error('Error saving subtask:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {sousTache ? 'Modifier la sous-tâche' : 'Nouvelle sous-tâche'}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Projet: {projet.nom}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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
                Assigné à *
              </label>
              <select
                value={formData.assigne_id}
                onChange={(e) => setFormData(prev => ({ ...prev, assigne_id: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value={0}>Sélectionner un utilisateur</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.department || 'Sans département'})
                  </option>
                ))}
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
                <option value="not_started">Non démarrée</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminée</option>
                <option value="blocked">Bloquée</option>
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
              {loading ? 'Sauvegarde...' : (sousTache ? 'Modifier' : 'Créer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
