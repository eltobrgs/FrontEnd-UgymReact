import { FC, useState } from 'react';
import { FaUser, FaBell, FaLock, FaPalette, FaLanguage, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useUser } from '../../../contexts/UserContext';
import Swal from 'sweetalert2';
import ProfileSetup from '../../Auth/AlunoProfileSetup';
import PersonalProfileSetup from '../../Auth/PersonalProfileSetup';

interface SettingsProps {
  userName: string;
}

const Settings: FC<SettingsProps> = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { userData } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  const handleEditProfile = () => {
    if (!userData?.id) return;

    if (userData.role === 'ACADEMIA') {
      navigate('/edit-academia-profile');
      return;
    }

    setShowProfileSetup(true);
  };

  const handleProfileSetupSuccess = () => {
    setShowProfileSetup(false);
  };

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

  const renderProfileSetupModal = () => {
    if (!showProfileSetup || !userData?.id) return null;

    switch (userData.role) {
      case 'ALUNO':
        return (
          <ProfileSetup
            isOpen={showProfileSetup}
            onClose={() => setShowProfileSetup(false)}
            onSuccess={handleProfileSetupSuccess}
            userId={userData.id.toString()}
            initialData={userData.preferenciasAluno}
          />
        );
      case 'PERSONAL':
        return (
          <PersonalProfileSetup
            isOpen={showProfileSetup}
            onClose={() => setShowProfileSetup(false)}
            onSuccess={handleProfileSetupSuccess}
            userId={userData.id.toString()}
            initialData={userData.preferenciasPersonal}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações</h1>

          <div className="space-y-6">
            {/* Perfil */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaUser className="text-indigo-600 text-xl" />
                  <span className="text-lg font-medium">Perfil</span>
                </div>
                <button
                  onClick={handleEditProfile}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  Editar
                </button>
              </div>
            </div>

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

            {/* Segurança */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaLock className="text-indigo-600 text-xl" />
                  <span className="text-lg font-medium">Segurança</span>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800">
                  Alterar Senha
                </button>
              </div>
            </div>

            {/* Aparência */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaPalette className="text-indigo-600 text-xl" />
                  <span className="text-lg font-medium">Aparência</span>
                </div>
                <select className="form-select text-gray-700 border-gray-300 rounded-md">
                  <option>Claro</option>
                  <option>Escuro</option>
                  <option>Sistema</option>
                </select>
              </div>
            </div>

            {/* Idioma */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaLanguage className="text-indigo-600 text-xl" />
                  <span className="text-lg font-medium">Idioma</span>
                </div>
                <select className="form-select text-gray-700 border-gray-300 rounded-md">
                  <option>Português (BR)</option>
                  <option>English</option>
                  <option>Español</option>
                </select>
              </div>
            </div>

            {/* Ajuda */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FaQuestionCircle className="text-indigo-600 text-xl" />
                  <span className="text-lg font-medium">Ajuda</span>
                </div>
                <button className="text-indigo-600 hover:text-indigo-800">
                  Central de Ajuda
                </button>
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
          </div>
        </div>
      </div>

      {renderProfileSetupModal()}
    </>
  );
};

export default Settings; 