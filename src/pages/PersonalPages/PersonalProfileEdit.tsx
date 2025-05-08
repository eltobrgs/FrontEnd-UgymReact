import { FC, useState, FormEvent, useEffect } from 'react';
import Input from '../../components/GeralPurposeComponents/input/Input';
import Button from '../../components/GeralPurposeComponents/Button/Button';
import Modal from '../../components/GeralPurposeComponents/Modal/Modal';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';
import { useUser } from '../../contexts/UserContext';
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
  FaUserEdit 
} from 'react-icons/fa';

interface PersonalProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PersonalProfileEdit: FC<PersonalProfileEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { userData, fetchUserData } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    birthDate: '',
    gender: '',
    specializations: '',
    yearsOfExperience: '',
    workSchedule: '',
    certifications: '',
    biography: '',
    workLocation: '',
    pricePerHour: '',
    languages: '',
    socialMedia: {
      instagram: '',
      linkedin: ''
    }
  });

  // Carregar dados atuais do personal
  useEffect(() => {
    const fetchPersonalData = async () => {
      if (!isOpen || !userData?.id) return;
      
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('Token não encontrado');
        }
        
        const response = await fetch(`${connectionUrl}/personal/detalhes/${userData.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Falha ao buscar dados do personal');
        }
        
        const data = await response.json();
        
        // Formatar data de nascimento para o formato esperado pelo input date
        let formattedDate = '';
        if (data.birthDate) {
          // Se vier como DD/MM/YYYY, converter para YYYY-MM-DD
          if (data.birthDate.includes('/')) {
            const [day, month, year] = data.birthDate.split('/');
            formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } 
          // Se vier como data ISO
          else if (data.birthDate.includes('T')) {
            formattedDate = data.birthDate.split('T')[0];
          }
          // Caso contrário, usar como está
          else {
            formattedDate = data.birthDate;
          }
        }
        
        setFormData({
          birthDate: formattedDate,
          gender: data.gender || '',
          specializations: data.specializations?.join(', ') || '',
          yearsOfExperience: data.yearsOfExperience || '',
          workSchedule: data.workSchedule || '',
          certifications: data.certifications?.join(', ') || '',
          biography: data.biography || '',
          workLocation: data.workLocation || '',
          pricePerHour: data.pricePerHour || '',
          languages: data.languages?.join(', ') || '',
          socialMedia: {
            instagram: data.instagram || '',
            linkedin: data.linkedin || ''
          }
        });
        
        console.log('Dados carregados do personal:', {
          birthDate: formattedDate,
          gender: data.gender
        });
      } catch (error) {
        console.error('Erro ao buscar dados do personal:', error);
      }
    };
    
    fetchPersonalData();
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }

      // Preparando os dados para envio
      const dataToSend: any = {
        specializations: formData.specializations.split(',').map(s => s.trim()).filter(Boolean),
        yearsOfExperience: formData.yearsOfExperience,
        workSchedule: formData.workSchedule,
        certifications: formData.certifications.split(',').map(c => c.trim()).filter(Boolean),
        biography: formData.biography,
        workLocation: formData.workLocation,
        pricePerHour: formData.pricePerHour,
        languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
        instagram: formData.socialMedia.instagram.trim() || null,
        linkedin: formData.socialMedia.linkedin.trim() || null,
        gender: formData.gender
      };

      // Converter data para formato DD/MM/YYYY se fornecida
      if (formData.birthDate) {
        const [year, month, day] = formData.birthDate.split('-');
        dataToSend.birthDate = `${day}/${month}/${year}`;
      }

      console.log('Enviando dados do personal:', dataToSend);

      // Usando o endpoint de edição
      const response = await fetch(`${connectionUrl}/personal/editar-perfil`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
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
      title="Editar Perfil Profissional"
    >
      <div className="p-4 overflow-y-auto max-h-[calc(90vh-100px)]">
        <div className="mb-6 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center">
            <FaUserEdit size={24} />
          </div>
          <h2 className="ml-4 text-xl font-bold text-gray-800">Informações Profissionais</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PersonalProfileEdit; 