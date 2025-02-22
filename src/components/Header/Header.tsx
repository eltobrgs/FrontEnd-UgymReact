import { FC } from 'react';
import { FaCog, FaUser, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  weeklyProgress: number;
  userName: string;
}

const Header: FC<HeaderProps> = ({ title, weeklyProgress, userName }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">Progresso Semanal:</span>
            <span className="text-indigo-600 font-semibold">{weeklyProgress}%</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-700">Olá, {userName}</span>
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Notificações"
          >
            <FaBell size={20} />
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Perfil"
          >
            <FaUser size={20} />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Configurações"
          >
            <FaCog size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;