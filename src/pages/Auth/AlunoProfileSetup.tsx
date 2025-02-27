import { FC, useState, FormEvent } from 'react';
import { FaWeight, FaRulerVertical } from 'react-icons/fa';
import Input from '../../components/GeralPurposeComponents/input/Input';
import Button from '../../components/GeralPurposeComponents/Button/Button';
import Modal from '../../components/GeralPurposeComponents/Modal/Modal';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/api';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  initialData?: {
    birthDate: string;
    gender: string;
    goal: string;
    healthCondition: string;
    experience: string;
    height: string;
    weight: string;
    activityLevel: string;
    medicalConditions: string;
    physicalLimitations: string;
  };
}

const AlunoProfileSetup: FC<ProfileSetupModalProps> = ({ isOpen, onClose, onSuccess, userId, initialData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    birthDate: initialData?.birthDate || '',
    gender: initialData?.gender || '',
    goal: initialData?.goal || '',
    healthCondition: initialData?.healthCondition || '',
    experience: initialData?.experience || '',
    height: initialData?.height || '',
    weight: initialData?.weight || '',
    activityLevel: initialData?.activityLevel || '',
    medicalConditions: initialData?.medicalConditions || '',
    physicalLimitations: initialData?.physicalLimitations || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        throw new Error('Dados de autenticação não encontrados');
      }

      const dataToSend = {
        ...formData,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('pt-BR') : '',
        userId: parseInt(userId)
      };

      const response = await fetch(`${connectionUrl}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar preferências');
      }

      await Swal.fire({
        title: 'Sucesso!',
        text: 'Cadastro realizado com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Swal.fire({
        title: 'Erro!',
        text: error instanceof Error ? error.message : 'Falha ao salvar preferências',
        icon: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure seu Perfil"
    >
      <div className="p-4">
        <p className="text-sm text-gray-600 mb-6">
          Precisamos de algumas informações para personalizar sua experiência
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Data de Nascimento"
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Selecione...</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
                <option value="prefiro_nao_dizer">Prefiro não dizer</option>
              </select>
            </div>

            <Input
              label="Altura (cm)"
              type="number"
              name="height"
              value={formData.height}
              onChange={handleChange}
              icon={<FaRulerVertical size={20} />}
              placeholder="Ex: 175"
              min="100"
              max="250"
              required
            />

            <Input
              label="Peso (kg)"
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              icon={<FaWeight size={20} />}
              placeholder="Ex: 70"
              min="30"
              max="300"
              required
            />

            <Input
              label="Objetivo"
              type="text"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
              placeholder="Ex: Perder peso, Ganhar massa muscular"
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nível de Atividade
              </label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              >
                <option value="">Selecione...</option>
                <option value="sedentario">Sedentário</option>
                <option value="leve">Levemente Ativo</option>
                <option value="moderado">Moderadamente Ativo</option>
                <option value="muito_ativo">Muito Ativo</option>
                <option value="extremamente_ativo">Extremamente Ativo</option>
              </select>
            </div>

            <Input
              label="Condições de Saúde"
              type="text"
              name="healthCondition"
              value={formData.healthCondition}
              onChange={handleChange}
              placeholder="Descreva suas condições de saúde (opcional)"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condições Médicas
              </label>
              <textarea
                name="medicalConditions"
                value={formData.medicalConditions}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Liste quaisquer condições médicas relevantes (opcional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restrições Físicas
              </label>
              <textarea
                name="physicalLimitations"
                value={formData.physicalLimitations}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
                placeholder="Liste quaisquer restrições físicas que possam afetar seus exercícios (opcional)"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              Concluir Cadastro
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AlunoProfileSetup; 