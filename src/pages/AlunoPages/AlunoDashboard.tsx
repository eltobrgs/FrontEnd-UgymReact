import { FC, useEffect, useState } from 'react';
import { FaBiking, FaRunning, FaDumbbell } from 'react-icons/fa';
import { connectionUrl } from '../../config/connection';
import TodoListTabs from '../../components/GeralPurposeComponents/TodoListTabs/TodoListTabs';
import EventosTabs from '../../components/GeralPurposeComponents/EventosTabs/EventosTabs';
import PersonalResponsavel from '../../components/AlunoComponents/PersonalResponsavel/PersonalResponsavel';
import StatusPagamento from '../../components/AlunoComponents/StatusPagamento/StatusPagamento';

interface DashboardStats {
  steps: number;
  calories: number;
  progress: number;
}

interface AlunoDashboardProps {
  userName?: string;
  stats?: DashboardStats;
}

const AlunoDashboard: FC<AlunoDashboardProps> = ({ userName, stats: initialStats }) => {
  const [stats, setStats] = useState<DashboardStats>(initialStats || {
    steps: 0,
    calories: 0,
    progress: 0
  });
  const [isLoading, setIsLoading] = useState(!initialStats);

  useEffect(() => {
    // Se já temos estatísticas iniciais, não precisamos buscar
    if (initialStats) {
      return;
    }
    
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${connectionUrl}/aluno/dashboard-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('Erro ao buscar estatísticas:', await response.text());
          // Dados de exemplo em caso de erro
          setStats({
            steps: 8500,
            calories: 750,
            progress: 65
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        // Dados de exemplo em caso de erro
        setStats({
          steps: 8500,
          calories: 750,
          progress: 65
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [initialStats]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Dashboard {userName ? `de ${userName}` : ''}
      </h1>
      
      {/* Cards de Atividade */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Passos</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.steps.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FaRunning className="text-blue-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 bg-gray-200 h-2 rounded-full">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${Math.min((stats.steps / 10000) * 100, 100)}%` }} 
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Meta: 10.000 passos</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Calorias</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.calories} kcal</h3>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <FaBiking className="text-red-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 bg-gray-200 h-2 rounded-full">
            <div 
              className="bg-red-500 h-2 rounded-full" 
              style={{ width: `${Math.min((stats.calories / 1000) * 100, 100)}%` }} 
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Meta: 1.000 kcal</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Progresso</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.progress}%</h3>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <FaDumbbell className="text-green-500 text-xl" />
            </div>
          </div>
          <div className="mt-4 bg-gray-200 h-2 rounded-full">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ width: `${stats.progress}%` }} 
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Meta: 100% dos exercícios</p>
        </div>
      </div>

      {/* Conteúdo Principal do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Responsável */}
        <div className="lg:col-span-2">
          <PersonalResponsavel containerClassName="h-full" />
        </div>
        
        {/* Status de Pagamento */}
        <div className="lg:col-span-1">
          <StatusPagamento containerClassName="h-full" />
        </div>
      </div>
      
      {/* Segunda Linha */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mt-6">
        {/* Lista de Tarefas */}
        <TodoListTabs containerClassName="h-full" />
      </div>
      
      {/* Eventos da Academia */}
      <div className="mt-6">
        <EventosTabs containerClassName="w-full" userRole="ALUNO" />
      </div>
    </div>
  );
};

export default AlunoDashboard;