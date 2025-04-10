import { FC } from 'react';
import { FaCog, FaUser, FaBell, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';

interface PersonalHeaderProps {
  userName: string;
  userImage?: string;
}

interface ApiError {
  message: string;
}

const PersonalHeader: FC<PersonalHeaderProps> = ({ userName, userImage }) => {
  const navigate = useNavigate();

  // Componente de loading para o nome do usuário
  const LoadingName = () => (
    <div className="animate-pulse flex space-x-4">
      <div className="h-4 w-32 bg-gray-300 rounded"></div>
    </div>
  );

  const handleAddStudent = () => {
    Swal.fire({
      title: 'Adicionar Novo Aluno',
      html: `
        <input type="text" id="studentCode" class="swal2-input" placeholder="Código do aluno">
      `,
      showCancelButton: true,
      confirmButtonText: 'Adicionar',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const studentCode = (document.getElementById('studentCode') as HTMLInputElement).value;
        if (!studentCode) {
          Swal.showValidationMessage('Por favor, insira o código do aluno');
          return;
        }
        
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${connectionUrl}/add-student/${studentCode}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao adicionar aluno');
          }

          return response.json();
        } catch (error) {
          const apiError = error as ApiError;
          Swal.showValidationMessage(`Erro: ${apiError.message}`);
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire('Sucesso!', 'Aluno adicionado com sucesso', 'success')
          .then(() => {
            // Recarregar a página ou atualizar a lista de alunos
            window.location.reload();
          });
      }
    });
  };

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
            onClick={handleAddStudent}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <FaPlus size={16} />
            <span>Adicionar Aluno</span>
          </button>
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
            onClick={() => navigate('/personal-profile')}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors relative"
            aria-label="Perfil"
          >
            {userImage ? (
              <img 
                src={userImage} 
                alt={userName} 
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              <FaUser size={20} />
            )}
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

export default PersonalHeader; 