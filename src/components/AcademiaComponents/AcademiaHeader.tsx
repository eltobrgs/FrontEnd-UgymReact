import { FC } from 'react';
import { FaCog, FaUser, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface AcademiaHeaderProps {
  userName: string;
}

const AcademiaHeader: FC<AcademiaHeaderProps> = ({ userName }) => {
  const navigate = useNavigate();

  // Componente de loading para o nome do usuário
  const LoadingName = () => (
    <div className="animate-pulse flex space-x-4">
      <div className="h-4 w-32 bg-gray-300 rounded"></div>
    </div>
  );

  return (
    <motion.header 
      className="bg-white shadow-md rounded-br-2xl rounded-tr-2xl backdrop-blur-sm bg-white/90"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <motion.div 
          className="flex-1 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-gray-700 font-medium">
            Bem-vindo, <span className="text-red-600 font-semibold">{userName ? userName : <LoadingName />}</span>
          </span>
        </motion.div>
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={() => navigate('/notifications')}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Notificações"
          >
            <FaBell size={20} />
            <motion.span 
              className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, delay: 0.3 }}
            >
              3
            </motion.span>
          </motion.button>
          <motion.button
            onClick={() => navigate('/profile')}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Perfil"
          >
            <FaUser size={20} />
          </motion.button>
          <motion.button
            onClick={() => navigate('/settings')}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Configurações"
          >
            <FaCog size={20} />
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default AcademiaHeader; 