import { FC, useState, FormEvent } from 'react';
import Input from '../../components/GeralPurposeComponents/input/Input';
import Button from '../../components/GeralPurposeComponents/Button/Button';
import Modal from '../../components/GeralPurposeComponents/Modal/Modal';
import ImageUpload from '../../components/GeralPurposeComponents/ImageUpload/ImageUpload';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';
import { 
  FaBirthdayCake, 
  FaVenusMars, 
  FaBullseye, 
  FaRunning,
  FaHeartbeat,
  FaUserPlus
} from 'react-icons/fa';

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
    alunoAvatar?: string;
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
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialData?.alunoAvatar);
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

  const handleImageUploaded = (imageUrl: string) => {
    setAvatarUrl(imageUrl);
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
        academiaId: academiaId, // Garantir que o academiaId seja incluído
        alunoAvatar: avatarUrl
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

  // Determinar o endpoint de upload com base em quem está fazendo o upload
  const getUploadEndpoint = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    // Se o userId for diferente do usuário logado e o usuário logado for uma academia
    if (userId && userData.id !== userId && userData.role === 'ACADEMIA') {
      return `/upload/avatar/aluno/${userId}`;
    }
    // Caso contrário, é o próprio aluno fazendo upload
    return '/upload/avatar/aluno';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Perfil do Aluno"
    >
      <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
        <div className="mb-6 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center">
            <FaUserPlus size={24} />
          </div>
          <h2 className="ml-4 text-xl font-bold text-gray-800">Informações Iniciais</h2>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Upload de Imagem */}
          <div className="flex justify-center mb-6">
            <ImageUpload 
              onImageUploaded={handleImageUploaded}
              endpoint={getUploadEndpoint()}
              currentImageUrl={avatarUrl}
              temporaryToken={temporaryToken}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              Concluir Cadastro
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AlunoProfileSetup; 