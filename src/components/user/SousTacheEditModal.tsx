import React, { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { SousTache } from '../../types';
import { X, Save, RotateCcw } from 'lucide-react';

interface SousTacheEditModalProps {
  sousTache: SousTache;
  onClose: () => void;
  onUpdate: (updatedSousTache: SousTache) => void;
}

export const SousTacheEditModal: React.FC<SousTacheEditModalProps> = ({
  sousTache,
  onClose,
  onUpdate
}) => {
  const [statut, setStatut] = useState(sousTache.statut);
  const [progression, setProgression] = useState(sousTache.progression);
  const [loading, setLoading] = useState(false);
  const { apiRequest } = useApi();

  const handleSave = async () => {
    try {
      setLoading(true);
      
      const updatedSousTache = await apiRequest(`/sous-taches/user/${sousTache.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          statut,
          progression
        })
      });

      onUpdate(updatedSousTache);
      onClose();
    } catch (error) {
      console.error('Error updating subtask:', error);
      alert('Erreur lors de la mise à jour de la sous-tâche');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStatut(sousTache.statut);
    setProgression(sousTache.progression);
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'not_started': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'blocked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'not_started': return 'Non démarrée';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      case 'blocked': return 'Bloquée';
      default: return statut;
    }
  };

  const hasChanges = statut !== sousTache.statut || progression !== sousTache.progression;
  
  // Toujours permettre la sauvegarde, même sans changements
  const canSave = !loading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-900">Modifier la sous-tâche</h2>
              {hasChanges && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Modifications non sauvegardées
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">{sousTache.nom}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
              {sousTache.description || 'Aucune description'}
            </p>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={statut}
              onChange={(e) => setStatut(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="not_started">Non démarrée</option>
              <option value="in_progress">En cours</option>
              <option value="completed">Terminée</option>
              <option value="blocked">Bloquée</option>
            </select>
            <div className="mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatutColor(statut)}`}>
                {getStatutLabel(statut)}
              </span>
            </div>
          </div>

          {/* Progression */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progression ({progression}%)
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                value={progression}
                onChange={(e) => setProgression(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>0%</span>
                <span className="font-medium">{progression}%</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progression}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Informations de la sous-tâche */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Informations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium text-gray-600">Priorité:</span>
                <span className="ml-2 capitalize">{sousTache.priorite}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Date de début:</span>
                <span className="ml-2">{new Date(sousTache.date_debut).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Date de fin prévue:</span>
                <span className="ml-2">{new Date(sousTache.date_fin_prevue).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Projet:</span>
                <span className="ml-2">{sousTache.projet_nom || 'Non spécifié'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions - Toujours visible en bas */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Annuler les modifications
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Fermer
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                hasChanges 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Sauvegarde...' : hasChanges ? 'Sauvegarder les changements' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
