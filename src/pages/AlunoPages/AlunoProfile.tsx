import { FC, useState, useEffect } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import {
  FaWeight,
  FaRulerVertical,
  FaPercent,
  FaBullseye,
  FaHeartbeat,
  FaEnvelope,
  FaBirthdayCake,
  FaVenusMars,
  FaRunning,
  FaUserMd,
  FaClipboardList
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { connectionUrl } from '../../config/connection';
import { useAuth } from '../../contexts/AuthContext';
import AlunoProfileEdit from './AlunoProfileEdit';

interface AlunoProfileProps {
  userName: string;
}

interface ReportsByType {
  peso?: { id: number; valor: number; data: string }[];
  altura?: { id: number; valor: number; data: string }[];
  [key: string]: { id: number; valor: number; data: string }[] | undefined;
}

const AlunoProfile: FC<AlunoProfileProps> = () => {
  const { userData } = useUser();
  const { token } = useAuth();
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [reports, setReports] = useState<ReportsByType>({});
  const [loading, setLoading] = useState(true);

  // Buscar relatórios do aluno
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${connectionUrl}/aluno/meus-reports`, {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar relatórios: ${response.status}`);
        }
        
        const data = await response.json();
        setReports(data.reports || {});
      } catch (error) {
        console.error('Erro ao buscar relatórios:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReports();
    }
  }, [token]);

  const handleEditProfile = () => {
    if (userData?.id) {
      setShowProfileEdit(true);
    }
  };

  const handleProfileEditSuccess = () => {
    setShowProfileEdit(false);
  };

  // Obter o valor mais recente do relatório de peso
  const getLatestWeight = () => {
    if (!reports.peso || reports.peso.length === 0) return null;
    
    const sortedReports = [...reports.peso].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    
    return sortedReports[0].valor;
  };

  // Obter o valor mais recente do relatório de altura
  const getLatestHeight = () => {
    if (!reports.altura || reports.altura.length === 0) return null;
    
    const sortedReports = [...reports.altura].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    
    return sortedReports[0].valor;
  };

  // Calcular IMC com base nos relatórios mais recentes
  const calculateIMC = () => {
    const weight = getLatestWeight();
    const height = getLatestHeight();
    
    if (!weight || !height) return null;
    
    // IMC = peso (kg) / altura² (m)
    const heightInMeters = height / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const latestWeight = getLatestWeight();
  const latestHeight = getLatestHeight();
  const calculatedIMC = calculateIMC();

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        {/* Cabeçalho do Perfil */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-3xl">👤</span>
              </div>
              <button
                className="absolute bottom-0 right-0 bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors"
                onClick={handleEditProfile}
              >
                <FiEdit2 size={16} />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{userData?.name || 'Usuário'}</h1>
              <div className="mt-2 inline-block px-3 py-1 bg-red-500 rounded-full text-sm">
                ID: {userData?.id}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Informações Básicas</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FaEnvelope className="text-red-600" />
                <span>{userData?.email || 'Email não cadastrado'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaBirthdayCake className="text-red-600" />
                <span>{userData?.preferenciasAluno?.birthDate ? userData.preferenciasAluno.birthDate.split('T')[0] : 'Data não cadastrada'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaVenusMars className="text-red-600" />
                <span>{userData?.preferenciasAluno?.gender || 'Não informado'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaBullseye className="text-red-600" />
                <span>Objetivo: {userData?.preferenciasAluno?.goal || 'Não definido'}</span>
              </div>
            </div>
          </div>

          {/* Dados Físicos */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Dados Físicos</h2>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaRulerVertical className="text-red-600" />
                    <span>Altura: {latestHeight ? `${latestHeight} cm` : 'Não registrado'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaWeight className="text-red-600" />
                    <span>Peso: {latestWeight ? `${latestWeight} kg` : 'Não registrado'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaPercent className="text-red-600" />
                    <span>IMC: {calculatedIMC ? calculatedIMC.toFixed(2) : 'Não calculado'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-600">
                    <FaRunning className="text-red-600" />
                    <span>Nível de Atividade: {userData?.preferenciasAluno?.activityLevel || 'Não informado'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Objetivos e Experiência */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Objetivos e Experiência</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FaBullseye className="text-red-600" />
                <span>Objetivo: {userData?.preferenciasAluno?.goal || 'Não definido'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaClipboardList className="text-red-600" />
                <span>Experiência: {userData?.preferenciasAluno?.experience || 'Não informada'}</span>
              </div>
            </div>
          </div>

          {/* Saúde */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Saúde</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FaHeartbeat className="text-red-600" />
                <span>Condições de Saúde: {userData?.preferenciasAluno?.healthCondition || 'Não informada'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaUserMd className="text-red-600" />
                <span>Limitações Físicas: {userData?.preferenciasAluno?.physicalLimitations || 'Nenhuma'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Edição */}
        <div className="fixed bottom-8 right-8">
          <button
            className="absolute bottom-0 right-0 bg-red-600 p-2 rounded-full hover:bg-red-700 transition-colors text-white"
            onClick={handleEditProfile}
          >
            <FiEdit2 size={16} />
          </button>
        </div>
      </div>

      {showProfileEdit && (
        <AlunoProfileEdit
          isOpen={showProfileEdit}
          onClose={() => setShowProfileEdit(false)}
          onSuccess={handleProfileEditSuccess}
        />
      )}
    </>
  );
};

export default AlunoProfile; 