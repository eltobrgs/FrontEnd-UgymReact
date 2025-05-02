import { FC, useState } from 'react';
import { FaCog, FaUser, FaBell, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';
import { motion } from 'framer-motion';

interface PersonalHeaderProps {
  userName: string;
  userImage?: string;
}

interface ApiError {
  message: string;
}

const PersonalHeader: FC<PersonalHeaderProps> = ({ userName, userImage }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Componente de loading para o nome do usuário
  const LoadingName = () => (
    <div className="animate-pulse flex space-x-4">
      <div className="h-4 w-32 bg-gray-300 rounded"></div>
    </div>
  );

  const handleAddStudent = async () => {
    const { value: studentCode, isConfirmed } = await Swal.fire({
      title: 'Adicionar Aluno',
      input: 'text',
      inputLabel: 'Digite o código do aluno',
      inputPlaceholder: 'Código do aluno',
      confirmButtonText: 'Adicionar',
      confirmButtonColor: '#dc2626',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      customClass: {
        title: 'text-gray-800 font-bold',
        popup: 'rounded-xl shadow-xl'
      },
      inputValidator: (value) => {
        if (!value) {
          return 'Por favor, digite o código do aluno';
        }
        return null;
      }
    });

    if (!isConfirmed || !studentCode) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      const response = await fetch(`${connectionUrl}/personal/adicionar-aluno/${studentCode}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao adicionar aluno');
      }

      const result = await response.json();
      Swal.fire({
        icon: 'success',
        title: 'Sucesso!',
        text: 'Aluno adicionado com sucesso!',
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'rounded-xl shadow-xl'
        }
      });
      
      return result;
    } catch (error) {
      const apiError = error as ApiError;
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: `Erro: ${apiError.message}`,
        confirmButtonColor: '#dc2626',
        customClass: {
          popup: 'rounded-xl shadow-xl'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

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
            onClick={handleAddStudent}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
          >
            <FaPlus size={16} />
            <span>{isLoading ? 'Adicionando...' : 'Adicionar Aluno'}</span>
          </motion.button>
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
            onClick={() => navigate('/personal-profile')}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Perfil"
          >
            {userImage ? (
              <motion.img 
                src={userImage} 
                alt={userName} 
                className="w-6 h-6 rounded-full object-cover border border-gray-300"
                whileHover={{ borderColor: "#dc2626" }}
              />
            ) : (
              <FaUser size={20} />
            )}
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

export default PersonalHeader; 