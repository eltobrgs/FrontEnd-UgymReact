import { FC, useState, FormEvent, useEffect } from 'react';
import Input from '../../components/GeralPurposeComponents/input/Input';
import Button from '../../components/GeralPurposeComponents/Button/Button';
import Modal from '../../components/GeralPurposeComponents/Modal/Modal';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';
import { useUser } from '../../contexts/UserContext';
import ImageUpload from '../../components/GeralPurposeComponents/ImageUpload/ImageUpload';
import { 
  FaBirthdayCake, 
  FaVenusMars, 
  FaBullseye, 
  FaRunning,
  FaHeartbeat,
  FaDumbbell,
  FaUserEdit
} from 'react-icons/fa';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AlunoProfileEdit: FC<ProfileEditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess
}) => {
  const { userData, fetchUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState({
    birthDate: '',
    gender: '',
    goal: '',
    healthCondition: '',
    experience: '',
    activityLevel: '',
    physicalLimitations: ''
  });

  // Carregar dados atuais do usuário
  useEffect(() => {
    if (isOpen && userData?.preferenciasAluno) {
      // Formatar data de nascimento para o formato esperado pelo input date
      let formattedDate = '';
      if (userData.preferenciasAluno.birthDate) {
        // Se vier como DD/MM/YYYY, converter para YYYY-MM-DD
        if (userData.preferenciasAluno.birthDate.includes('/')) {
          const [day, month, year] = userData.preferenciasAluno.birthDate.split('/');
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        } 
        // Se vier como data ISO
        else if (userData.preferenciasAluno.birthDate.includes('T')) {
          formattedDate = userData.preferenciasAluno.birthDate.split('T')[0];
        }
        // Caso contrário, usar como está
        else {
          formattedDate = userData.preferenciasAluno.birthDate;
        }
      }

      setFormData({
        birthDate: formattedDate,
        gender: userData.preferenciasAluno.gender || '',
        goal: userData.preferenciasAluno.goal || '',
        healthCondition: userData.preferenciasAluno.healthCondition || '',
        experience: userData.preferenciasAluno.experience || '',
        activityLevel: userData.preferenciasAluno.activityLevel || '',
        physicalLimitations: userData.preferenciasAluno.physicalLimitations || ''
      });
      
      // Carregar a URL da imagem de perfil atual
      setAvatarUrl(userData.preferenciasAluno.alunoAvatar);
      
      console.log('Dados carregados:', {
        birthDate: formattedDate,
        gender: userData.preferenciasAluno.gender,
        activityLevel: userData.preferenciasAluno.activityLevel,
        avatarUrl: userData.preferenciasAluno.alunoAvatar
      });
      
      // Log adicional para depuração da imagem
      console.log('DEBUG - URL da imagem do aluno:', userData.preferenciasAluno.alunoAvatar);
    }
  }, [isOpen, userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Função para lidar com o upload de imagem
  const handleImageUploaded = (imageUrl: string) => {
    setAvatarUrl(imageUrl);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }

      // Preparar dados para envio
      // Converter data para formato DD/MM/YYYY que o backend espera
      let formattedData: any = {...formData};
      
      if (formData.birthDate) {
        const [year, month, day] = formData.birthDate.split('-');
        formattedData.birthDate = `${day}/${month}/${year}`;
      }

      // Adicionar a URL da imagem aos dados enviados
      if (avatarUrl) {
        formattedData.alunoAvatar = avatarUrl;
      }

      console.log('Enviando dados:', formattedData);

      // Usar o endpoint de edição
      const response = await fetch(`${connectionUrl}/aluno/editar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar perfil');
      }

      // Atualizar os dados do usuário no contexto
      await fetchUserData();

      await Swal.fire({
        title: 'Sucesso!',
        text: 'Perfil atualizado com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      Swal.fire({
        title: 'Erro!',
        text: error instanceof Error ? error.message : 'Falha ao atualizar perfil',
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
      title="Editar Perfil do Aluno"
    >
      <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
        <div className="mb-6 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center">
            <FaUserEdit size={24} />
          </div>
          <h2 className="ml-4 text-xl font-bold text-gray-800">Informações do Perfil</h2>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Upload de Imagem */}
          <div className="flex justify-center mb-6">
            <ImageUpload 
              onImageUploaded={handleImageUploaded}
              endpoint="/upload/avatar/aluno"
              currentImageUrl={avatarUrl}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Data de Nascimento"
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              icon={<FaBirthdayCake size={20} />}
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaVenusMars className="mr-2 text-red-600" size={20} />
                Gênero
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
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
              icon={<FaBullseye size={20} />}
              placeholder="Ex: Perder peso, Ganhar massa muscular"
              required
            />

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaRunning className="mr-2 text-red-600" size={20} />
                Nível de Atividade
              </label>
              <select
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
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
              label="Experiência"
              type="text"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              icon={<FaDumbbell size={20} />}
              placeholder="Sua experiência com exercícios"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaHeartbeat className="mr-2 text-red-600" size={20} />
                Condições de Saúde
              </label>
              <textarea
                name="healthCondition"
                value={formData.healthCondition}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Descreva condições de saúde relevantes para sua prática de exercícios"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaUserEdit className="mr-2 text-red-600" size={20} />
                Restrições Físicas
              </label>
              <textarea
                name="physicalLimitations"
                value={formData.physicalLimitations}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Liste quaisquer restrições físicas que possam afetar seus exercícios (opcional)"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6 border-t pt-4">
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
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AlunoProfileEdit; 