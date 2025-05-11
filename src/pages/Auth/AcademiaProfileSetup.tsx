import { FC, useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import ImageUpload from '../../components/GeralPurposeComponents/ImageUpload/ImageUpload';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';

interface AcademiaProfileFormData {
  cnpj: string;
  endereco: string;
  telefone: string;
  horarioFuncionamento: string;
  descricao: string;
  comodidades: string;
  planos: string;
  website: string;
  socialMedia: {
    instagram: string;
    facebook: string;
  };
}

interface AcademiaProfileSetupProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  userId?: string;
  initialData?: {
    cnpj?: string;
    endereco?: string;
    telefone?: string;
    horarioFuncionamento?: string;
    descricao?: string;
    comodidades?: string[];
    planos?: string[];
    website?: string;
    instagram?: string;
    facebook?: string;
    academiaAvatar?: string;
  };
}

const AcademiaProfileSetup: FC<AcademiaProfileSetupProps> = ({ onSuccess, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUserData } = useUser();
  const { setIsAuthenticated } = useAuth();
  const isEditing = location.pathname === '/edit-academia-profile';
  const [isLoading, setIsLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [formData, setFormData] = useState<AcademiaProfileFormData>({
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

  useEffect(() => {
    const fetchAcademiaData = async () => {
      if (!isEditing) return;

      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          throw new Error('Dados de autenticação não encontrados');
        }

        const response = await fetch(`${connectionUrl}/academia/perfil`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do perfil');
        }

        const data = await response.json();

        setFormData({
          cnpj: data.cnpj || '',
          endereco: data.endereco || '',
          telefone: data.telefone || '',
          horarioFuncionamento: data.horarioFuncionamento || '',
          descricao: data.descricao || '',
          comodidades: data.comodidades?.join(', ') || '',
          planos: data.planos?.join(', ') || '',
          website: data.website || '',
          socialMedia: {
            instagram: data.instagram || '',
            facebook: data.facebook || ''
          }
        });

        if (data.academiaAvatar) {
          setAvatarUrl(data.academiaAvatar);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        Swal.fire('Erro!', 'Falha ao carregar dados do perfil', 'error');
      }
    };

    fetchAcademiaData();
  }, [isEditing]);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token');

      if (!userId || !token) {
        throw new Error('ID do usuário ou token não encontrado');
      }

      // Formatar os dados antes de enviar
      const dadosFormatados = {
        cnpj: formData.cnpj.trim(),
        endereco: formData.endereco.trim(),
        telefone: formData.telefone.trim(),
        horarioFuncionamento: formData.horarioFuncionamento.trim(),
        descricao: formData.descricao.trim(),
        comodidades: formData.comodidades ? formData.comodidades.split(',').map(item => item.trim()).filter(Boolean) : [],
        planos: formData.planos ? formData.planos.split(',').map(item => item.trim()).filter(Boolean) : [],
        website: formData.website.trim() || null,
        instagram: formData.socialMedia.instagram.trim() || null,
        facebook: formData.socialMedia.facebook.trim() || null,
        academiaAvatar: avatarUrl
      };

      console.log('Dados a serem enviados:', dadosFormatados);

      const response = await fetch(`${connectionUrl}/academia/perfil`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dadosFormatados),
      });

      console.log('Status da resposta:', response.status);
      const responseData = await response.json();
      console.log('Resposta da API:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || 'Erro ao salvar dados da academia');
      }

      setIsAuthenticated(true);
      await fetchUserData();
      
      await Swal.fire({
        title: 'Sucesso!',
        text: 'Dados da academia salvos com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      if (onSuccess) {
        onSuccess();
      } else if (isEditing) {
        if (onClose) {
          onClose();
        } else {
          navigate(-1);
        }
      } else {
        navigate('/auth/academia-profile-setup');
      }
    } catch (error) {
      console.error('Erro detalhado ao salvar dados:', error);
      Swal.fire('Erro!', error instanceof Error ? error.message : 'Falha ao salvar dados da academia', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center mb-4">
            <FaBuilding size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isEditing ? 'Editar Perfil da Academia' : 'Configure o Perfil da Academia'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete o perfil para começar a receber alunos
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
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
                  disabled={isEditing}
                  icon={<FaIdCard size={20} />}
                  placeholder="Apenas números (14 dígitos)"
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

            {/* Presença online */}
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

            {/* Informações detalhadas */}
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
                  placeholder="Descreva os horários de funcionamento da academia (ex: Segunda a Sexta: 6h às 22h, Sábado: 8h às 18h)"
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
                  placeholder="Liste as comodidades oferecidas (ex: Estacionamento, Vestiários, Armários, Wi-Fi)"
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
                  placeholder="Liste os planos oferecidos (ex: Mensal, Trimestral, Anual)"
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
                onClick={() => navigate(-1)}
              >
                Voltar
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
              >
                {isEditing ? 'Salvar Alterações' : 'Concluir Cadastro'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcademiaProfileSetup; 