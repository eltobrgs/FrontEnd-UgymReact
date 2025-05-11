import { FC, useState, FormEvent } from 'react';
import { 
  FaBriefcase, 
  FaBirthdayCake, 
  FaVenusMars, 
  FaDollarSign, 
  FaMapMarkerAlt, 
  FaLanguage, 
  FaInstagram, 
  FaLinkedin, 
  FaCertificate, 
  FaUserTie, 
  FaClock, 
  FaUserPlus 
} from 'react-icons/fa';
import Input from '../../components/GeralPurposeComponents/input/Input';
import Button from '../../components/GeralPurposeComponents/Button/Button';
import Modal from '../../components/GeralPurposeComponents/Modal/Modal';
import ImageUpload from '../../components/GeralPurposeComponents/ImageUpload/ImageUpload';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';

interface PersonalProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  academiaId?: number | null;
  temporaryToken?: string | null;
  initialData?: {
    birthDate: string;
    gender: string;
    specializations: string[];
    yearsOfExperience: string;
    workSchedule: string;
    certifications: string[];
    biography: string;
    workLocation: string;
    pricePerHour: string;
    languages: string[];
    instagram?: string;
    linkedin?: string;
    personalAvatar?: string;
  };
}

const PersonalProfileSetup: FC<PersonalProfileSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  academiaId,
  temporaryToken,
  initialData
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(initialData?.personalAvatar);
  const [formData, setFormData] = useState({
    birthDate: initialData?.birthDate || '',
    gender: initialData?.gender || '',
    specializations: initialData?.specializations?.join(', ') || '',
    yearsOfExperience: initialData?.yearsOfExperience || '',
    workSchedule: initialData?.workSchedule || '',
    certifications: initialData?.certifications?.join(', ') || '',
    biography: initialData?.biography || '',
    workLocation: initialData?.workLocation || '',
    pricePerHour: initialData?.pricePerHour || '',
    languages: initialData?.languages?.join(', ') || '',
    socialMedia: {
      instagram: initialData?.instagram || '',
      linkedin: initialData?.linkedin || ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socialMedia.')) {
      const socialMediaField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialMediaField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setAvatarUrl(imageUrl);
  };

  // Determinar o endpoint de upload com base em quem está fazendo o upload
  const getUploadEndpoint = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    // Se o userId for diferente do usuário logado e o usuário logado for uma academia
    if (userId && userData.id !== userId && userData.role === 'ACADEMIA') {
      return `/upload/avatar/personal/${userId}`;
    }
    // Caso contrário, é o próprio personal fazendo upload
    return '/upload/avatar/personal';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Usar token temporário se disponível, caso contrário usar o token normal
      const token = temporaryToken || localStorage.getItem('token');
      
      if (!token || !userId) {
        throw new Error('Dados de autenticação não encontrados');
      }

      const response = await fetch(`${connectionUrl}/personal/preferencias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          birthDate: formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('pt-BR') : '',
          specializations: formData.specializations.split(',').map(s => s.trim()),
          certifications: formData.certifications.split(',').map(c => c.trim()),
          languages: formData.languages.split(',').map(l => l.trim()),
          academiaId: academiaId || null,
          personalAvatar: avatarUrl
        }),
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
        text: error instanceof Error ? error.message : 'Falha ao salvar perfil',
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
      title="Configure seu Perfil Profissional"
    >
      <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
        <div className="mb-6 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center">
            <FaUserPlus size={24} />
          </div>
          <h2 className="ml-4 text-xl font-bold text-gray-800">Configuração Inicial</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de Imagem */}
          <div className="flex justify-center mb-6">
            <ImageUpload 
              onImageUploaded={handleImageUploaded}
              endpoint={getUploadEndpoint()}
              currentImageUrl={avatarUrl}
              temporaryToken={temporaryToken}
            />
          </div>

          {/* Dados Pessoais */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-4">Dados Pessoais</h3>
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
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-4">Dados Profissionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Anos de Experiência"
                type="number"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                icon={<FaBriefcase size={20} />}
                placeholder="Ex: 5"
                min="0"
                max="50"
                required
              />

              <Input
                label="Preço por Hora (R$)"
                type="number"
                name="pricePerHour"
                value={formData.pricePerHour}
                onChange={handleChange}
                icon={<FaDollarSign size={20} />}
                placeholder="Ex: 100"
                min="0"
                required
              />

              <Input
                label="Local de Trabalho"
                type="text"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleChange}
                icon={<FaMapMarkerAlt size={20} />}
                placeholder="Ex: Academia XYZ, Atendimento domiciliar"
                required
              />

              <Input
                label="Idiomas"
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                icon={<FaLanguage size={20} />}
                placeholder="Ex: Português, Inglês"
                required
              />
            </div>
          </div>

          {/* Redes Sociais */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-4">Redes Sociais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Instagram"
                type="text"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleChange}
                icon={<FaInstagram size={20} />}
                placeholder="@seu.perfil"
              />

              <Input
                label="LinkedIn"
                type="text"
                name="socialMedia.linkedin"
                value={formData.socialMedia.linkedin}
                onChange={handleChange}
                icon={<FaLinkedin size={20} />}
                placeholder="URL do seu perfil"
              />
            </div>
          </div>

          {/* Descrições detalhadas */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaCertificate className="mr-2 text-red-600" size={20} />
                Especializações
              </label>
              <textarea
                name="specializations"
                value={formData.specializations}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Liste suas especializações (ex: Musculação, Crossfit, Pilates)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaCertificate className="mr-2 text-red-600" size={20} />
                Certificações
              </label>
              <textarea
                name="certifications"
                value={formData.certifications}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Liste suas principais certificações e formações"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaUserTie className="mr-2 text-red-600" size={20} />
                Biografia
              </label>
              <textarea
                name="biography"
                value={formData.biography}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Conte um pouco sobre sua trajetória e metodologia de trabalho"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaClock className="mr-2 text-red-600" size={20} />
                Horários de Trabalho
              </label>
              <textarea
                name="workSchedule"
                value={formData.workSchedule}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Descreva sua disponibilidade de horários"
                required
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

export default PersonalProfileSetup; 