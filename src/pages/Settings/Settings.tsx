import { FC } from 'react';
import { FaUser, FaBell, FaLock, FaPalette, FaLanguage, FaQuestionCircle, FaSignOutAlt } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface SettingsProps {
  userName: string;
}

interface SettingItem {
  icon: React.ElementType;
  label: string;
  type: 'link' | 'toggle' | 'select';
  path?: string;
  enabled?: boolean;
  options?: string[];
}

interface SettingsGroup {
  title: string;
  items: SettingItem[];
}

const Settings: FC<SettingsProps> = ({ userName }) => {
  const navigate = useNavigate();
  const { setIsAuthenticated } = useAuth();

  const settingsGroups: SettingsGroup[] = [
    {
      title: 'Conta',
      items: [
        { icon: FaUser, label: 'Informações Pessoais', type: 'link', path: '/profile' },
        { icon: FaBell, label: 'Notificações', type: 'toggle', enabled: true },
        { icon: FaLock, label: 'Privacidade e Segurança', type: 'link' },
      ]
    },
    {
      title: 'Preferências',
      items: [
        { icon: FaPalette, label: 'Tema do App', type: 'toggle', enabled: false },
        { icon: FaLanguage, label: 'Idioma', type: 'select', options: ['Português', 'English', 'Español'] },
      ]
    },
    {
      title: 'Suporte',
      items: [
        { icon: FaQuestionCircle, label: 'Ajuda e Suporte', type: 'link' },
      ]
    }
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-gray-300">Personalize sua experiência, {userName}</p>
      </div>

      {/* Grupos de Configurações */}
      <div className="space-y-8">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800">{group.title}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <item.icon className="text-indigo-600 text-xl" />
                    <span className="text-gray-700">{item.label}</span>
                  </div>
                  {item.type === 'toggle' && (
                    <Switch
                      checked={item.enabled}
                      onChange={() => {}}
                      className={`${
                        item.enabled ? 'bg-indigo-600' : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                    >
                      <span
                        className={`${
                          item.enabled ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                      />
                    </Switch>
                  )}
                  {item.type === 'select' && (
                    <select className="form-select rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
                      {item.options?.map((option, optionIndex) => (
                        <option key={optionIndex}>{option}</option>
                      ))}
                    </select>
                  )}
                  {item.type === 'link' && (
                    <button className="text-indigo-600 hover:text-indigo-700">
                      Configurar
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botão de Sair */}
      <div className="mt-8">
        <button
          onClick={() => {
            setIsAuthenticated(false);
            navigate('/auth/login');
          }}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <FaSignOutAlt />
          <span>Sair</span>
        </button>
      </div>

      {/* Versão do App */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Versão 1.0.0</p>
      </div>
    </div>
  );
};

export default Settings; 