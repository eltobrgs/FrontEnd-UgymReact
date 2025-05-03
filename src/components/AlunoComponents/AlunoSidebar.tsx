import { FC } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaHome, 
  FaChartBar, 
  FaDumbbell, 
  // FaUtensils, 
  FaUsers, 
  FaUserTie,
  FaCalendarAlt,
  FaTimes,
  FaBars,
  FaCheckSquare
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
// import { Link } from 'react-router-dom';
// import { FiHome, FiActivity, FiUser } from 'react-icons/fi';

interface AlunoSidebarProps {
  userName: string;
  userPlan: string;
  userImage?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const AlunoSidebar: FC<AlunoSidebarProps> = ({ userName, userPlan, userImage, isOpen, onToggle }) => {
  const menuItems = [
    { icon: FaHome, text: 'Visão Geral', path: '/' },
    { icon: FaDumbbell, text: 'Meu Plano de Treino', path: '/workout-plan' },
    { icon: FaChartBar, text: 'Meus Relatórios', path: '/reports' },
    // { icon: FaUtensils, text: 'Meu Plano Alimentar', path: '/diet-plan' }, tela desativada por momento
    { icon: FaCheckSquare, text: 'Lista de Tarefas', path: '/todo-list' },
    { icon: FaUsers, text: 'Treinadores', path: '/personals' },
    { icon: FaCalendarAlt, text: 'Eventos da Academia', path: '/events' },
    { icon: FaUserTie, text: 'Meu Perfil', path: '/profile' },
  ];

  return (
    <>
      {/* Mobile Overlay with backdrop blur */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="fixed inset-0 backdrop-blur-md bg-black/30 lg:hidden z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Botão de toggle da sidebar para mobile (reposicionado para evitar sobreposição) */}
      <div className="lg:hidden fixed z-20 top-4 left-4">
        <motion.button
          onClick={onToggle}
          className="bg-red-600 text-white p-3 rounded-lg shadow-lg hover:bg-red-700 transition-all focus:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle menu"
        >
          {isOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
        </motion.button>
      </div>

      {/* Sidebar with improved transitions and mobile optimization */}
      <motion.div
        className="fixed top-0 left-0 h-screen w-[85%] max-w-[320px] bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex flex-col
          shadow-2xl z-30 overflow-hidden rounded-br-3xl rounded-br-3xl
          lg:translate-x-0 lg:static lg:w-64 lg:shadow-none"
        animate={{
          x: isOpen ? 0 : "-100%"
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300
        }}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center">
            <motion.button
              onClick={onToggle}
              className="lg:hidden text-white p-2 hover:bg-red-600 rounded-full transition-all"
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Close menu"
            >
              <FaTimes className="w-6 h-6" />
            </motion.button>
          </div>
          <motion.span 
            className="text-2xl font-bold text-white tracking-wide flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600">Ugym</span>
            <motion.svg 
              stroke="currentColor" 
              fill="currentColor" 
              strokeWidth="0" 
              viewBox="0 0 640 512" 
              className="w-8 h-8 text-red-500 ml-1" 
              height="1em" 
              width="1em" 
              xmlns="http://www.w3.org/2000/svg"
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <path d="M104 96H56c-13.3 0-24 10.7-24 24v104H8c-4.4 0-8 3.6-8 8v48c0 4.4 3.6 8 8 8h24v104c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V120c0-13.3-10.7-24-24-24zm528 128h-24V120c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v272c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V288h24c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zM456 32h-48c-13.3 0-24 10.7-24 24v168H256V56c0-13.3-10.7-24-24-24h-48c-13.3 0-24 10.7-24 24v400c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V288h128v168c0 13.3 10.7 24 24 24h48c13.3 0 24-10.7 24-24V56c0-13.3-10.7-24-24-24z"></path>
            </motion.svg>
          </motion.span>
        </div>

        {/* User Profile Section with enhanced styling */}
        <motion.div 
          className="p-6 bg-gradient-to-r from-red-600/20 to-red-800/10 hover:from-red-600/30 hover:to-red-800/20 transition-colors duration-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-4">
            <motion.img 
              src={userImage || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=500&h=500&fit=crop'} 
              alt={userName}
              className="w-12 h-12 rounded-full object-cover border-2 border-red-500 shadow-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
            />
            <div>
              <motion.h2 
                className="font-semibold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {userName}
              </motion.h2>
              <motion.span 
                className="text-sm px-2 py-1 bg-gradient-to-r from-red-600 to-red-500 rounded-full text-white shadow-md inline-block mt-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -2 }}
              >
                {userPlan}
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Navigation Menu with improved interactions */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (index * 0.1) }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center space-x-3 p-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md' 
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'}
                  `}
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-red-500'}`} />
                      </motion.div>
                      <span className="font-medium">{item.text}</span>
                    </>
                  )}
                </NavLink>
              </motion.li>
            ))}
          </ul>
        </nav>
        
        {/* Footer with version */}
        <motion.div 
          className="p-4 text-center text-xs text-gray-500 border-t border-gray-800"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Ugym v1.0.0
        </motion.div>
      </motion.div>
    </>
  );
};

export default AlunoSidebar;