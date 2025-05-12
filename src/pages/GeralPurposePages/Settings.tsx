import { FC, useState } from 'react';
import { FaBell, FaSignOutAlt, FaTrash } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import { connectionUrl } from '../../config/connection';

interface SettingsProps {
  userName: string;
}

const Settings: FC<SettingsProps> = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Você será desconectado da sua conta",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, sair',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      logout();
      navigate('/auth/login');
    }
  };

  const handleDeleteProfile = async () => {
    const result = await Swal.fire({
      title: 'Excluir perfil',
      text: 'Esta ação não pode ser desfeita. Todos os seus dados serão removidos e seus vínculos com alunos, personais ou academias serão desfeitos.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir perfil',
      cancelButtonText: 'Cancelar',
      footer: '<span class="text-sm text-gray-500">Esta ação é definitiva e irreversível</span>'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          Swal.fire('Erro', 'Você precisa estar logado para realizar esta ação', 'error');
          return;
        }

        const response = await fetch(`${connectionUrl}/excluir-perfil`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.ok) {
          Swal.fire({
            title: 'Perfil excluído',
            text: 'Seu perfil foi excluído com sucesso.',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
          });
          
          // Fazer logout após excluir o perfil
          logout();
          navigate('/auth/login');
        } else {
          const error = await response.json();
          Swal.fire('Erro', error.error || 'Erro ao excluir perfil', 'error');
        }
      } catch (error) {
        console.error('Erro ao excluir perfil:', error);
        Swal.fire('Erro', 'Ocorreu um erro ao excluir seu perfil', 'error');
      }
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>

          <div className="space-y-6">
            {/* Notificações */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaBell className="text-indigo-600 text-xl" />
                  <span className="text-lg font-medium">Notificações</span>
                </div>
                <Switch
                  checked={notificationsEnabled}
                  onChange={setNotificationsEnabled}
                  className={`${notificationsEnabled ? 'bg-red-600' : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Ativar notificações</span>
                  <span
                    className={`${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            </div>

            {/* Sair */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaSignOutAlt className="text-red-600 text-xl" />
                  <span className="text-lg font-medium text-red-600">Sair da Conta</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800"
                >
                  Sair
                </button>
              </div>
            </div>

            {/* Excluir Perfil */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaTrash className="text-red-600 text-xl" />
                  <span className="text-lg font-medium text-red-600">Excluir Perfil</span>
                </div>
                <button
                  onClick={handleDeleteProfile}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Esta ação excluirá permanentemente seu perfil e removerá todas as suas informações do sistema. 
                Todos os seus relacionamentos com alunos, personais ou academias serão desvinculados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings; 