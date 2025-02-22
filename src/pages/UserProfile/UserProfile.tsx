import { FC } from 'react';
import { FiEdit2 } from 'react-icons/fi';
import { 
  FaWeight, 
  FaRulerVertical, 
  FaPercent, 
  FaBullseye, 
  FaHeartbeat,
  FaEnvelope,
  FaBirthdayCake,
  FaVenusMars
} from 'react-icons/fa';

interface UserProfileProps {
  userName: string;
}

const UserProfile: FC<UserProfileProps> = ({ userName }) => {
  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Cabeçalho do Perfil */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg mb-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <button className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full hover:bg-indigo-700 transition-colors">
              <FiEdit2 size={16} />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold">{userName}</h1>
            <p className="text-gray-300">Membro desde 2024</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Informações Básicas */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Informações Básicas</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600">
              <FaEnvelope className="text-indigo-600" />
              <span>usuario@email.com</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <FaBirthdayCake className="text-indigo-600" />
              <span>01/01/1990</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <FaVenusMars className="text-indigo-600" />
              <span>Masculino</span>
            </div>
          </div>
        </div>

        {/* Dados Físicos */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Dados Físicos</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FaRulerVertical className="text-indigo-600" />
                <span>Altura: 1.75m</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaWeight className="text-indigo-600" />
                <span>Peso: 70kg</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-600">
                <FaPercent className="text-indigo-600" />
                <span>IMC: 22.9</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-600">
                <FaPercent className="text-indigo-600" />
                <span>Gordura: 15%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Objetivos */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Objetivos</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600">
              <FaBullseye className="text-indigo-600" />
              <span>Objetivo: Ganho de massa muscular</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <FaWeight className="text-indigo-600" />
              <span>Meta de peso: 75kg</span>
            </div>
          </div>
        </div>

        {/* Saúde */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Saúde</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-gray-600">
              <FaHeartbeat className="text-indigo-600" />
              <span>Condições médicas: Nenhuma</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-600">
              <FaHeartbeat className="text-indigo-600" />
              <span>Restrições físicas: Nenhuma</span>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Edição */}
      <div className="fixed bottom-8 right-8">
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
          <FiEdit2 size={20} />
          <span>Editar Perfil</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile; 