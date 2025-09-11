import React, { useState, useEffect } from 'react';
import { ParcTelecom } from '../../types';
import { useApi } from '../../hooks/useApi';

interface ParcTelecomFormProps {
  item?: ParcTelecom | null;
  onClose: () => void;
  onSubmit: (item: ParcTelecom) => void;
}

export const ParcTelecomForm: React.FC<ParcTelecomFormProps> = ({
  item,
  onClose,
  onSubmit
}) => {
  const { apiRequest } = useApi();
  const [formData, setFormData] = useState({
    numero_puce: '',
    operateur: 'iam' as const,
    proprietaire: '',
    ville_societe: '',
    poste: '',
    departement: '',
    specifications: {
      type_abonnement: '',
      forfait: '',
      date_activation: '',
      type: '',
      autres: ''
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        numero_puce: item.numero_puce,
        operateur: item.operateur,
        proprietaire: item.proprietaire,
        ville_societe: item.ville_societe || '',
        poste: item.poste || '',
        departement: item.departement || '',
        specifications: item.specifications || {
          type_abonnement: '',
          forfait: '',
          date_activation: '',
          type: '',
          autres: ''
        }
      });
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.proprietaire.trim()) {
      alert('Veuillez saisir le nom du propriétaire');
      return;
    }
    
    setLoading(true);

    try {
      const data = {
        ...formData,
        specifications: {
          type_abonnement: formData.specifications.type_abonnement || undefined,
          forfait: formData.specifications.forfait || undefined,
          date_activation: formData.specifications.date_activation || undefined,
          autres: formData.specifications.autres || undefined
        }
      };

      let result;
      if (item) {
        result = await apiRequest(`/parc-telecom/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } else {
        result = await apiRequest('/parc-telecom', {
          method: 'POST',
          body: JSON.stringify(data)
        });
      }

      onSubmit(result);
    } catch (error) {
      console.error('Error saving item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la sauvegarde';
      alert(`Erreur lors de la sauvegarde: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecificationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {item ? 'Modifier l\'élément' : 'Ajouter un élément'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de puce
              </label>
              <input
                type="text"
                value={formData.numero_puce}
                onChange={(e) => setFormData(prev => ({ ...prev, numero_puce: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opérateur *
              </label>
              <select
                value={formData.operateur}
                onChange={(e) => setFormData(prev => ({ ...prev, operateur: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="iam">IAM</option>
                <option value="inwi">INWI</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom du propriétaire *
              </label>
              <input
                type="text"
                value={formData.proprietaire}
                onChange={(e) => setFormData(prev => ({ ...prev, proprietaire: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville/Société
              </label>
              <input
                type="text"
                value={formData.ville_societe}
                onChange={(e) => setFormData(prev => ({ ...prev, ville_societe: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Poste
              </label>
              <input
                type="text"
                value={formData.poste}
                onChange={(e) => setFormData(prev => ({ ...prev, poste: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Département
              </label>
              <input
                type="text"
                value={formData.departement}
                onChange={(e) => setFormData(prev => ({ ...prev, departement: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* Specifications */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">Spécifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'abonnement
                </label>
                <input
                  type="text"
                  value={formData.specifications.type_abonnement}
                  onChange={(e) => handleSpecificationChange('type_abonnement', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forfait
                </label>
                <input
                  type="text"
                  value={formData.specifications.forfait}
                  onChange={(e) => handleSpecificationChange('forfait', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'activation
                </label>
                <input
                  type="date"
                  value={formData.specifications.date_activation}
                  onChange={(e) => handleSpecificationChange('date_activation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autres informations
                </label>
                <input
                  type="text"
                  value={formData.specifications.autres}
                  onChange={(e) => handleSpecificationChange('autres', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
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
              {loading ? 'Sauvegarde...' : (item ? 'Modifier' : 'Ajouter')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
