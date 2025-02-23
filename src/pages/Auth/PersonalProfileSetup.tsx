import { FC, useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBriefcase } from 'react-icons/fa';
import Input from '../../components/input/Input';
import Button from '../../components/Button/Button';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/api';


interface PersonalProfileFormData {
  birthDate: string;
  gender: string;
  specializations: string;
  yearsOfExperience: string;
  workSchedule: string;
  certifications: string;
  biography: string;
  workLocation: string;
  pricePerHour: string;
  languages: string;
  socialMedia: {
    instagram: string;
    linkedin: string;
  };
}

const PersonalProfileSetup: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = location.pathname === '/edit-personal-profile';
  const [formData, setFormData] = useState<PersonalProfileFormData>({
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

  useEffect(() => {
    const fetchPersonalData = async () => {
      if (!isEditing) return;

      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (!token || !userId) {
          throw new Error('Dados de autenticação não encontrados');
        }

        const response = await fetch(`${connectionUrl}/personal/${userId}`, {
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
          birthDate: data.birthDate?.split('T')[0] || '',
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
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Swal.fire('Erro!', 'Não foi possível carregar os dados do perfil', 'error');
        navigate(-1);
      }
    };

    fetchPersonalData();
  }, [isEditing, navigate]);

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

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch(`${connectionUrl}/personal-preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          specializations: formData.specializations.split(',').map(s => s.trim()),
          certifications: formData.certifications.split(',').map(c => c.trim()),
          languages: formData.languages.split(',').map(l => l.trim())
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar preferências');
      }

      await response.json();
      Swal.fire('Sucesso!', 'Perfil configurado com sucesso!', 'success');
      
      const userId = localStorage.getItem('userId');
      
      if (isEditing) {
        navigate(-1);
      } else {
        navigate(`/personal/${userId}`);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Swal.fire('Erro!', error instanceof Error ? error.message : 'Falha ao salvar perfil. Tente novamente.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isEditing ? 'Editar Perfil Profissional' : 'Configure seu Perfil Profissional'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Complete seu perfil para começar a atender alunos
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
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
                placeholder="Ex: Academia XYZ, Atendimento domiciliar"
                required
              />

              <Input
                label="Idiomas"
                type="text"
                name="languages"
                value={formData.languages}
                onChange={handleChange}
                placeholder="Ex: Português, Inglês"
                required
              />

              <Input
                label="Instagram"
                type="text"
                name="socialMedia.instagram"
                value={formData.socialMedia.instagram}
                onChange={handleChange}
                placeholder="@seu.perfil"
              />

              <Input
                label="LinkedIn"
                type="text"
                name="socialMedia.linkedin"
                value={formData.socialMedia.linkedin}
                onChange={handleChange}
                placeholder="URL do seu perfil"
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Especializações
                </label>
                <textarea
                  name="specializations"
                  value={formData.specializations}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Liste suas especializações (ex: Musculação, Crossfit, Pilates)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certificações
                </label>
                <textarea
                  name="certifications"
                  value={formData.certifications}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Liste suas principais certificações e formações"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografia
                </label>
                <textarea
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Conte um pouco sobre sua trajetória e metodologia de trabalho"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horários de Trabalho
                </label>
                <textarea
                  name="workSchedule"
                  value={formData.workSchedule}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Descreva sua disponibilidade de horários"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Voltar
              </Button>
              <Button
                type="submit"
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

export default PersonalProfileSetup; 