import { FC, useState, FormEvent, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaWeight, FaRulerVertical } from 'react-icons/fa';
import Input from '../../components/input/Input';
import Button from '../../components/Button/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/api';

interface ProfileFormData {
  birthDate: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
  activityLevel: string;
  medicalConditions: string;
  physicalLimitations: string;
  healthCondition: string;
  experience: string;
}

const ProfileSetup: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setIsAuthenticated } = useAuth();
  const { fetchUserData, userData } = useUser();
  const isEditing = location.pathname === '/edit-profile';
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    birthDate: '',
    gender: '',
    height: '',
    weight: '',
    goal: '',
    activityLevel: '',
    medicalConditions: '',
    physicalLimitations: '',
    healthCondition: '',
    experience: ''
  });

  useEffect(() => {
    const loadUserData = async () => {
      if (!isEditing || !userData?.preferences) return;

      try {
        setFormData({
          birthDate: userData.preferences.birthDate?.split('T')[0] || '',
          gender: userData.preferences.gender || '',
          height: userData.preferences.height || '',
          weight: userData.preferences.weight || '',
          goal: userData.preferences.goal || '',
          activityLevel: userData.preferences.activityLevel || '',
          medicalConditions: userData.preferences.medicalConditions || '',
          physicalLimitations: userData.preferences.physicalLimitations || '',
          healthCondition: userData.preferences.healthCondition || '',
          experience: userData.preferences.experience || ''
        });
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        Swal.fire('Erro!', 'Não foi possível carregar os dados do perfil', 'error');
        navigate(-1);
      }
    };

    loadUserData();
  }, [isEditing, userData, navigate]);

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
      const response = await fetch(`${connectionUrl}/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar preferências');
      }

      setIsAuthenticated(true);
      await fetchUserData();
      await Swal.fire({
        title: 'Sucesso!',
        text: 'Preferências salvas com sucesso!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      if (isEditing) {
        navigate(-1);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Swal.fire('Erro!', 'Falha ao salvar preferências. Tente novamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            {isEditing ? 'Editar Perfil' : 'Configure seu Perfil'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Precisamos de algumas informações para personalizar sua experiência
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
                isLoading={isLoading}
              >
                Concluir Cadastro
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup; 