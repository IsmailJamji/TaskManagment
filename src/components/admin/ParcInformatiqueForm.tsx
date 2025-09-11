import React, { useState, useEffect } from 'react';
import { ParcInformatique } from '../../types';
import { useApi } from '../../hooks/useApi';

interface ParcInformatiqueFormProps {
  item?: ParcInformatique | null;
  onClose: () => void;
  onSubmit: (item: ParcInformatique) => void;
}

export const ParcInformatiqueForm: React.FC<ParcInformatiqueFormProps> = ({
  item,
  onClose,
  onSubmit
}) => {
  const { apiRequest } = useApi();
  const [formData, setFormData] = useState({
    type: 'laptop' as 'laptop' | 'desktop' | 'unite_centrale' | 'clavier' | 'imprimante' | 'telephone' | 'routeur' | 'serveur' | 'souris' | 'ecran' | 'casque' | 'autre',
    marque: '',
    modele: '',
    serial_number: '',
    ticket_numero: '',
    specifications: {
      disque_dur: '',
      processeur: '',
      ram: '',
      os: '',
      autres: ''
    },
    proprietaire: '',
    ville_societe: '',
    poste: '',
    departement: '',
    est_premiere_main: true,
    date_acquisition: '',
    equipements_supplementaires: {
      clavier: false,
      souris: false,
      ecran: false,
      casque: false
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        type: item.type,
        marque: item.marque,
        modele: item.modele,
        serial_number: item.serial_number,
        ticket_numero: item.ticket_numero || '',
        specifications: {
          disque_dur: item.specifications?.disque_dur || '',
          processeur: item.specifications?.processeur || '',
          ram: item.specifications?.ram || '',
          os: item.specifications?.os || '',
          autres: item.specifications?.autres || ''
        },
        proprietaire: item.proprietaire || '',
        ville_societe: item.ville_societe || '',
        poste: item.poste || '',
        departement: item.departement || '',
        est_premiere_main: item.est_premiere_main,
        date_acquisition: item.date_acquisition,
        equipements_supplementaires: {
          clavier: item.equipements_supplementaires?.clavier || false,
          souris: item.equipements_supplementaires?.souris || false,
          ecran: item.equipements_supplementaires?.ecran || false,
          casque: item.equipements_supplementaires?.casque || false
        }
      });
    } else {
      // Set default date to today
      setFormData(prev => ({
        ...prev,
        date_acquisition: new Date().toISOString().split('T')[0]
      }));
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
      // Convertir la date au format ISO si nécessaire
      let dateAcquisition = formData.date_acquisition;
      if (dateAcquisition && !dateAcquisition.includes('T')) {
        // Si la date est au format DD/MM/YYYY, la convertir en YYYY-MM-DD
        if (dateAcquisition.includes('/')) {
          const [day, month, year] = dateAcquisition.split('/');
          dateAcquisition = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }

      const data = {
        type: formData.type,
        marque: formData.marque,
        modele: formData.modele,
        serial_number: formData.serial_number,
        ticket_numero: formData.ticket_numero,
        specifications: {
          disque_dur: formData.specifications.disque_dur || undefined,
          processeur: formData.specifications.processeur || undefined,
          ram: formData.specifications.ram || undefined,
          os: formData.specifications.os || undefined,
          autres: formData.specifications.autres || undefined
        },
        equipements_supplementaires: {
          clavier: formData.equipements_supplementaires.clavier || false,
          souris: formData.equipements_supplementaires.souris || false,
          ecran: formData.equipements_supplementaires.ecran || false,
          casque: formData.equipements_supplementaires.casque || false
        },
        proprietaire: formData.proprietaire,
        ville_societe: formData.ville_societe,
        poste: formData.poste,
        departement: formData.departement,
        est_premiere_main: formData.est_premiere_main,
        date_acquisition: dateAcquisition
      };

      let result;
      if (item) {
        result = await apiRequest(`/parc-informatique/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } else {
        result = await apiRequest('/parc-informatique', {
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
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marque *
              </label>
              <input
                type="text"
                value={formData.marque}
                onChange={(e) => setFormData(prev => ({ ...prev, marque: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modèle
              </label>
              <input
                type="text"
                value={formData.modele}
                onChange={(e) => setFormData(prev => ({ ...prev, modele: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de série
              </label>
              <input
                type="text"
                value={formData.serial_number}
                onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Numéro
              </label>
              <input
                type="text"
                value={formData.ticket_numero}
                onChange={(e) => setFormData(prev => ({ ...prev, ticket_numero: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: TKT-2024-001"
              />
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'acquisition *
              </label>
              <input
                type="date"
                value={formData.date_acquisition}
                onChange={(e) => setFormData(prev => ({ ...prev, date_acquisition: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="est_premiere_main"
                checked={formData.est_premiere_main}
                onChange={(e) => setFormData(prev => ({ ...prev, est_premiere_main: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="est_premiere_main" className="ml-2 text-sm text-gray-700">
                Première main
              </label>
            </div>
          </div>

          {/* Specifications */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">Spécifications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processeur
                </label>
                <input
                  type="text"
                  value={formData.specifications.processeur}
                  onChange={(e) => handleSpecificationChange('processeur', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RAM
                </label>
                <input
                  type="text"
                  value={formData.specifications.ram}
                  onChange={(e) => handleSpecificationChange('ram', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disque dur
                </label>
                <input
                  type="text"
                  value={formData.specifications.disque_dur}
                  onChange={(e) => handleSpecificationChange('disque_dur', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Système d'exploitation
                </label>
                <input
                  type="text"
                  value={formData.specifications.os}
                  onChange={(e) => handleSpecificationChange('os', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autres spécifications
                </label>
                <textarea
                  value={formData.specifications.autres}
                  onChange={(e) => handleSpecificationChange('autres', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Équipements supplémentaires - Cases à cocher conditionnelles */}
          {(formData.type === 'laptop' || formData.type === 'unite_centrale') && (
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">Équipements supplémentaires</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="clavier"
                    checked={formData.equipements_supplementaires.clavier}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      equipements_supplementaires: {
                        ...prev.equipements_supplementaires,
                        clavier: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="clavier" className="ml-2 text-sm text-gray-700">
                    Clavier
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="souris"
                    checked={formData.equipements_supplementaires.souris}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      equipements_supplementaires: {
                        ...prev.equipements_supplementaires,
                        souris: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="souris" className="ml-2 text-sm text-gray-700">
                    Souris
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="ecran"
                    checked={formData.equipements_supplementaires.ecran}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      equipements_supplementaires: {
                        ...prev.equipements_supplementaires,
                        ecran: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="ecran" className="ml-2 text-sm text-gray-700">
                    Écran
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="casque"
                    checked={formData.equipements_supplementaires.casque}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      equipements_supplementaires: {
                        ...prev.equipements_supplementaires,
                        casque: e.target.checked
                      }
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="casque" className="ml-2 text-sm text-gray-700">
                    Casque
                  </label>
                </div>
              </div>
            </div>
          )}

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
