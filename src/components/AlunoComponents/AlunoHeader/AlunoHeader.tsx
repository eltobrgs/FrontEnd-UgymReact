import { FC } from 'react';
import { FaCog, FaUser, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface AlunoHeaderProps {
  userName: string;
}

const AlunoHeader: FC<AlunoHeaderProps> = ({ userName }) => {
  const navigate = useNavigate();

  // Componente de loading para o nome do usuário
  const LoadingName = () => (
    <div className="animate-pulse flex space-x-4">
      <div className="h-4 w-32 bg-gray-300 rounded"></div>
    </div>
  );

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex-1 flex justify-center">
          <span className="text-gray-700">
            Bem-vindo, {userName ? userName : <LoadingName />}
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors relative"
            aria-label="Notificações"
          >
            <FaBell size={20} />
            <span className="absolute top-0 right-0 h-4 w-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Perfil"
          >
            <FaUser size={20} />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Configurações"
          >
            <FaCog size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default AlunoHeader;