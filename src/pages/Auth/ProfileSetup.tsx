import { FC, useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { FaWeight, FaRulerVertical } from 'react-icons/fa';
import Input from '../../components/input/Input';
import Button from '../../components/Button/Button';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileFormData {
  fullName: string;
  birthDate: string;
  gender: string;
  height: string;
  weight: string;
  goal: string;
  activityLevel: string;
  experienceLevel: string;
  medicalConditions: string;
  physicalLimitations: string;
}

const ProfileSetup: FC = () => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    birthDate: '',
    gender: '',
    height: '',
    weight: '',
    goal: '',
    activityLevel: '',
    experienceLevel: '',
    medicalConditions: '',
    physicalLimitations: ''
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
      // Simulando um delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsAuthenticated(true); // Define o usuário como autenticado
      navigate('/'); // Redireciona para o dashboard
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Configure seu Perfil
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Precisamos de algumas informações para personalizar sua experiência
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nome Completo"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                icon={<FiUser size={20} />}
                placeholder="Seu nome completo"
                required
              />

              <Input
                label="Data de Nascimento"
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                icon={<FiCalendar size={20} />}
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

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivo Principal
                </label>
                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="perda_peso">Perda de Peso</option>
                  <option value="ganho_massa">Ganho de Massa Muscular</option>
                  <option value="condicionamento">Melhorar Condicionamento</option>
                  <option value="saude">Saúde e Bem-estar</option>
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

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experiência com Exercícios
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </div>
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