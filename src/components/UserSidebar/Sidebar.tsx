import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaChartBar, 
  FaDumbbell, 
  FaUtensils, 
  FaUsers, 
  FaUserTie,
  FaCalendarAlt,
  FaTimes
} from 'react-icons/fa';
// import { Link } from 'react-router-dom';
// import { FiHome, FiActivity, FiUser } from 'react-icons/fi';

interface SidebarProps {
  userName: string;
  userPlan: string;
  userImage?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: FC<SidebarProps> = ({ userName, userPlan, userImage, isOpen, onToggle }) => {
  const menuItems = [
    { icon: FaHome, text: 'Visão Geral', path: '/' },
    { icon: FaDumbbell, text: 'Meu Plano de Treino', path: '/workout-plan' },
    { icon: FaChartBar, text: 'Meus Relatórios', path: '/reports' },
    { icon: FaUtensils, text: 'Meu Plano Alimentar', path: '/diet-plan' },
    { icon: FaUsers, text: 'Treinadores', path: '/personals' },
    { icon: FaCalendarAlt, text: 'Eventos da Academia', path: '/events' },
    { icon: FaUserTie, text: 'Meu Perfil', path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Overlay with fade transition */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-50 z-20' : 'opacity-0 -z-10'}`}
        onClick={onToggle}
      />

      {/* Mobile Menu Button with smooth transition */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-30 lg:hidden bg-gray-900 text-white p-3 rounded-lg hover:bg-gray-800 transition-all focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
        aria-label="Toggle menu"
      >
        {/* Animated Hamburger Icon */}
        <div className="relative w-6 h-6">
          <div
            className={`absolute w-full h-0.5 bg-white transition-all duration-300
              ${isOpen ? 'rotate-45 top-1/2 -translate-y-1/2' : 'top-0'}`}
          />
          <div
            className={`absolute w-full h-0.5 bg-white transition-all duration-300
              ${isOpen ? 'opacity-0' : 'top-1/2 -translate-y-1/2'}`}
          />
          <div
            className={`absolute w-full h-0.5 bg-white transition-all duration-300
              ${isOpen ? '-rotate-45 top-1/2 -translate-y-1/2' : 'top-full'}`}
          />
        </div>
      </button>

      {/* Sidebar with improved transitions and mobile optimization */}
      <div
        className={`fixed top-0 left-0 h-screen w-[85%] max-w-[320px] bg-gray-900 text-gray-100 flex flex-col
          transform transition-all duration-300 ease-in-out z-30 shadow-2xl
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:w-64 lg:shadow-none`}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center">
            <button
              onClick={onToggle}
              className="lg:hidden text-white p-2 hover:bg-gray-800 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-opacity-50"
              aria-label="Close menu"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          <span className="text-2xl font-bold text-red-600 tracking-wide flex items-center">
            Ugym
            <svg 
              stroke="currentColor" 
              fill="currentColor" 
              strokeWidth="0" 
              viewBox="0 0 640 512" 
              className="w-8 h-8 text-red-600 ml-1" 
              height="1em" 
              width="1em" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M104 96H56c-13.3 0-24 10.7-24 24v104H8c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h24v104c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24zm528 128h-24V120c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v272c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V288h24c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM456 32h-48c-13.3 0-24 10.7-24 24v168H256V56c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v400c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V288h128v168c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24z"></path>
            </svg>
          </span>
        </div>

        {/* User Profile Section with enhanced styling */}
        <div className="p-6 hover:bg-gray-800 transition-colors duration-200">
          <div className="flex items-center space-x-4">
            <img 
              src={userImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&h=500&fit=crop'} 
              alt={userName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h2 className="font-semibold">{userName}</h2>
              <span className="text-sm px-2 py-1 bg-red-600 rounded-full">{userPlan}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Navigation Menu with improved interactions */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center space-x-3 p-3 rounded-lg transition-all duration-200
                    ${isActive ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span className="font-medium">{item.text}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;