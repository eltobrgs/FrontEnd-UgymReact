import { FC, useState, useEffect } from 'react';
import { FaUsers, FaUserFriends, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { connectionUrl } from '../../../config/connection';
import StudentCard from '../../GeralPurposeComponents/StudentCard/StudentCard';
import Swal from 'sweetalert2';

interface Student {
  id: number;
  name: string;
  age: number | string;
  weight: string;
  height: string;
  goal: string;
  trainingTime: string;
  imageUrl?: string;
}

interface AlunosTabsProps {
  containerClassName?: string;
}

const AlunosTabs: FC<AlunosTabsProps> = ({ containerClassName = "" }) => {
  const [activeTab, setActiveTab] = useState<'meus' | 'todos'>('meus');
  const [meusAlunos, setMeusAlunos] = useState<Student[]>([]);
  const [todosAlunos, setTodosAlunos] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const token = localStorage.getItem('token');

  // Buscar alunos vinculados ao personal
  useEffect(() => {
    const fetchMeusAlunos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${connectionUrl}/personal/meus-alunos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar alunos vinculados');
        }

        const data = await response.json();
        setMeusAlunos(data);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        Swal.fire('Erro', 'Não foi possível carregar seus alunos', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && activeTab === 'meus') {
      fetchMeusAlunos();
    }
  }, [token, activeTab]);

  // Buscar todos os alunos da academia
  useEffect(() => {
    const fetchTodosAlunos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${connectionUrl}/alunos/listar`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar todos os alunos');
        }

        const data = await response.json();
        setTodosAlunos(data);
      } catch (error) {
        console.error('Erro ao buscar todos os alunos:', error);
        Swal.fire('Erro', 'Não foi possível carregar a lista de alunos', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (token && activeTab === 'todos') {
      fetchTodosAlunos();
    }
  }, [token, activeTab]);

  // Filtrar alunos com base no termo de pesquisa
  const getFilteredAlunos = () => {
    const alunosList = activeTab === 'meus' ? meusAlunos : todosAlunos;
    
    if (!searchTerm) return alunosList;
    
    const term = searchTerm.toLowerCase();
    return alunosList.filter(aluno => 
      aluno.name.toLowerCase().includes(term) || 
      aluno.goal.toLowerCase().includes(term)
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${containerClassName}`}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Alunos</h2>
          
          {/* Campo de pesquisa */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar aluno..."
              className="pl-8 pr-4 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            />
            <FaSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('meus')}
          className={`flex-1 py-2 px-4 text-center relative ${
            activeTab === 'meus'
              ? 'text-red-600 border-b-2 border-red-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <FaUserFriends className="mr-2" />
            <span>Meus Alunos</span>
          </div>
          {activeTab === 'meus' && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-red-500 w-full"
              layoutId="activeTabIndicator"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab('todos')}
          className={`flex-1 py-2 px-4 text-center relative ${
            activeTab === 'todos'
              ? 'text-red-600 border-b-2 border-red-500'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center">
            <FaUsers className="mr-2" />
            <span>Todos os Alunos</span>
          </div>
          {activeTab === 'todos' && (
            <motion.div
              className="absolute bottom-0 left-0 h-0.5 bg-red-500 w-full"
              layoutId="activeTabIndicator"
            />
          )}
        </button>
      </div>

      {/* Conteúdo das Abas */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : getFilteredAlunos().length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaUsers className="text-gray-400 text-lg" />
            </div>
            <p className="text-gray-500">
              {activeTab === 'meus' 
                ? searchTerm 
                  ? 'Nenhum aluno encontrado com esse termo' 
                  : 'Você ainda não tem alunos vinculados'
                : searchTerm 
                  ? 'Nenhum aluno encontrado com esse termo' 
                  : 'Não há alunos cadastrados na academia'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {getFilteredAlunos().map((aluno) => (
              <StudentCard
                key={aluno.id}
                id={aluno.id}
                name={aluno.name}
                age={aluno.age}
                weight={aluno.weight}
                height={aluno.height}
                goal={aluno.goal}
                trainingTime={aluno.trainingTime}
                imageUrl={aluno.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlunosTabs; 