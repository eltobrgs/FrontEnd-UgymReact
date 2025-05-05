import { FC, useState, FormEvent } from 'react';
import Input from '../../components/GeralPurposeComponents/input/Input';
import Button from '../../components/GeralPurposeComponents/Button/Button';
import Modal from '../../components/GeralPurposeComponents/Modal/Modal';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  academiaId?: number | null;
  temporaryToken?: string | null;
  initialData?: {
    birthDate: string;
    gender: string;
    goal: string;
    healthCondition: string;
    experience: string;
    activityLevel: string;
    physicalLimitations: string;
  };
}

const AlunoProfileSetup: FC<ProfileSetupModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  userId, 
  academiaId, 
  temporaryToken,
  initialData 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    birthDate: initialData?.birthDate || '',
    gender: initialData?.gender || '',
    goal: initialData?.goal || '',
    healthCondition: initialData?.healthCondition || '',
    experience: initialData?.experience || '',
    activityLevel: initialData?.activityLevel || '',
    physicalLimitations: initialData?.physicalLimitations || ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Usar token temporário se disponível, caso contrário usar o token normal
      const token = temporaryToken || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }

      console.log("Configurando perfil do aluno. AcademiaId:", academiaId);
      console.log("Token utilizado:", token.substring(0, 15) + "...");
      console.log("UserId:", userId);

      // Preparar dados para envio incluindo o ID do aluno quando necessário
      const dataToSend = {
        ...formData,
        academiaId: academiaId // Garantir que o academiaId seja incluído
      };

      // Se o userId for fornecido e for diferente do usuário logado, adicionar como alunoId
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userId && userData.id !== userId) {
        (dataToSend as any).alunoId = userId;
      }

      // Enviar dados para a API
      const response = await fetch(`${connectionUrl}/aluno/preferencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
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
      <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
        <p className="text-sm text-gray-600 mb-6">
          Precisamos de algumas informações para personalizar sua experiência
        </p>

        <form onSubmit={handleFormSubmit} className="space-y-6">
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