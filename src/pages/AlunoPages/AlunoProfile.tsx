import { FC, useState } from 'react';
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
  FaBookMedical,
  FaUserMd,
  FaClipboardList
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import ProfileSetup from '../Auth/AlunoProfileSetup';

interface AlunoProfileProps {
  userName: string;
}

const AlunoProfile: FC<AlunoProfileProps> = () => {
  const { userData } = useUser();
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const handleEditProfile = () => {
    if (userData?.id) {
      setShowProfileSetup(true);
    }
  };

  const handleProfileSetupSuccess = () => {
    setShowProfileSetup(false);
  };

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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaRulerVertical className="text-red-600" />
                  <span>Altura: {userData?.preferenciasAluno?.height || '0'} cm</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaWeight className="text-red-600" />
                  <span>Peso: {userData?.preferenciasAluno?.weight || '0'} kg</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaPercent className="text-red-600" />
                  <span>IMC: {userData?.preferenciasAluno?.imc?.toFixed(2) || 'Não calculado'}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <FaRunning className="text-red-600" />
                  <span>Nível de Atividade: {userData?.preferenciasAluno?.activityLevel || 'Não informado'}</span>
                </div>
              </div>
            </div>
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
                <span>Condição de Saúde: {userData?.preferenciasAluno?.healthCondition || 'Não informada'}</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaBookMedical className="text-red-600" />
                <span>Condições Médicas: {userData?.preferenciasAluno?.medicalConditions || 'Nenhuma'}</span>
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

      {showProfileSetup && (
        <ProfileSetup
          isOpen={showProfileSetup}
          onClose={() => setShowProfileSetup(false)}
          onSuccess={handleProfileSetupSuccess}
          userId={userData?.id?.toString() || ''}
          initialData={userData?.preferenciasAluno}
        />
      )}
    </>
  );
};

export default AlunoProfile; 