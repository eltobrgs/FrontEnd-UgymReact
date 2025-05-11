import { FC, useState, FormEvent, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaGlobe, 
  FaInstagram, 
  FaFacebook,
  FaBuilding,
  FaIdCard,
  FaClock,
  FaList,
  FaClipboardList,
  FaInfoCircle
} from 'react-icons/fa';
import Input from '../../components/GeralPurposeComponents/input/Input';
import Button from '../../components/GeralPurposeComponents/Button/Button';
import Modal from '../../components/GeralPurposeComponents/Modal/Modal';
import { useUser } from '../../contexts/UserContext';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';
import ImageUpload from '../../components/GeralPurposeComponents/ImageUpload/ImageUpload';

interface AcademiaProfileEditProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AcademiaProfileEdit: FC<AcademiaProfileEditProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { userData, fetchUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState({
    cnpj: '',
    endereco: '',
    telefone: '',
    horarioFuncionamento: '',
    descricao: '',
    comodidades: '',
    planos: '',
    website: '',
    socialMedia: {
      instagram: '',
      facebook: ''
    }
  });

  // Carregar dados atuais da academia
  useEffect(() => {
    if (isOpen && userData?.academia) {
      setFormData({
        cnpj: userData.academia.cnpj || '',
        endereco: userData.academia.endereco || '',
        telefone: userData.academia.telefone || '',
        horarioFuncionamento: userData.academia.horarioFuncionamento || '',
        descricao: userData.academia.descricao || '',
        comodidades: userData.academia.comodidades?.join('; ') || '',
        planos: userData.academia.planos?.join('; ') || '',
        website: userData.academia.website || '',
        socialMedia: {
          instagram: userData.academia.instagram || '',
          facebook: userData.academia.facebook || ''
        }
      });

      // Carregar a URL da imagem de perfil atual
      setAvatarUrl(userData.academia.academiaAvatar);
      
      // Log para depuração
      console.log('DEBUG - URL da imagem da academia:', userData.academia.academiaAvatar);
    }
  }, [isOpen, userData]);

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

  // Função para lidar com o upload de imagem
  const handleImageUploaded = (imageUrl: string) => {
    setAvatarUrl(imageUrl);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('Token não encontrado');
      }

      // Formatar os dados antes de enviar
      const dataToSend = {
        cnpj: formData.cnpj.trim(),
        endereco: formData.endereco.trim(),
        telefone: formData.telefone.trim(),
        horarioFuncionamento: formData.horarioFuncionamento.trim(),
        descricao: formData.descricao.trim(),
        comodidades: formData.comodidades ? formData.comodidades.split(';').map(item => item.trim()).filter(Boolean) : [],
        planos: formData.planos ? formData.planos.split(';').map(item => item.trim()).filter(Boolean) : [],
        website: formData.website.trim() || null,
        instagram: formData.socialMedia.instagram.trim() || null,
        facebook: formData.socialMedia.facebook.trim() || null,
        academiaAvatar: avatarUrl
      };

      // Usando o endpoint de edição
      const response = await fetch(`${connectionUrl}/academia/editar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar dados da academia');
      }

      // Atualizar os dados do usuário no contexto
      await fetchUserData();
      
      await Swal.fire({
        title: 'Sucesso!',
        text: 'Dados da academia atualizados com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      Swal.fire('Erro!', error instanceof Error ? error.message : 'Falha ao atualizar dados da academia', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Perfil da Academia"
    >
      <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
        <div className="mb-6 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center">
            <FaBuilding size={24} />
          </div>
          <h2 className="ml-4 text-xl font-bold text-gray-800">Informações da Academia</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload de Imagem */}
          <div className="flex justify-center mb-6">
            <ImageUpload 
              onImageUploaded={handleImageUploaded}
              endpoint="/upload/avatar/academia"
              currentImageUrl={avatarUrl}
            />
          </div>
          
          {/* Informações básicas */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="CNPJ"
                type="text"
                name="cnpj"
                value={formData.cnpj}
                onChange={handleChange}
                icon={<FaIdCard size={20} />}
                disabled={true} // CNPJ não pode ser alterado
                required
              />

              <Input
                label="Telefone"
                type="text"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                icon={<FaPhone size={20} />}
                placeholder="Apenas números com DDD (11 dígitos)"
                required
              />

              <Input
                label="Endereço Completo"
                type="text"
                name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                icon={<FaMapMarkerAlt size={20} />}
                placeholder="Rua, número, bairro, cidade, estado"
                required
              />
            </div>
          </div>

          {/* Redes e Links */}
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-md font-semibold text-gray-700 mb-4">Presença Online</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Website"
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                icon={<FaGlobe size={20} />}
                placeholder="www.seusite.com.br"
              />

              <Input
                label="Instagram"
                type="text"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleChange}
                icon={<FaInstagram size={20} />}
                placeholder="Seu usuário sem @"
              />

              <Input
                label="Facebook"
                type="text"
                name="socialMedia.facebook"
                value={formData.socialMedia.facebook}
                onChange={handleChange}
                icon={<FaFacebook size={20} />}
                placeholder="Seu usuário sem @"
              />
            </div>
          </div>

          {/* Detalhes da Academia */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaClock className="mr-2 text-red-600" size={20} />
                Horário de Funcionamento
              </label>
              <textarea
                name="horarioFuncionamento"
                value={formData.horarioFuncionamento}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Descreva os horários de funcionamento da academia"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaList className="mr-2 text-red-600" size={20} />
                Comodidades
              </label>
              <textarea
                name="comodidades"
                value={formData.comodidades}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Liste as comodidades oferecidas, separadas por ponto e vírgula (;)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaClipboardList className="mr-2 text-red-600" size={20} />
                Planos Oferecidos
              </label>
              <textarea
                name="planos"
                value={formData.planos}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Liste os planos oferecidos, separados por ponto e vírgula (;)"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <FaInfoCircle className="mr-2 text-red-600" size={20} />
                Descrição da Academia
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={4}
                placeholder="Descreva sua academia, modalidades oferecidas e diferenciais"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 border-t pt-4">
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

export default AcademiaProfileEdit; 