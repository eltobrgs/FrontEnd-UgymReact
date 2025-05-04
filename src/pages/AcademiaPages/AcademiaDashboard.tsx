import { FC, useEffect, useState } from 'react';
import { FaUsers, FaUserTie, FaCalendarCheck } from 'react-icons/fa';
import { connectionUrl } from '../../config/connection';
import TodoListTabs from '../../components/GeralPurposeComponents/TodoListTabs/TodoListTabs';
import EventosTabs from '../../components/GeralPurposeComponents/EventosTabs/EventosTabs';
import { useUser } from '../../contexts/UserContext';

interface DashboardStats {
  totalStudents: number;
  totalPersonals: number;
  upcomingEvents: number;
}

const AcademiaDashboard: FC = () => {
  const { userData } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalPersonals: 0,
    upcomingEvents: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!userData || !userData.academia?.id) {
          console.error('Informações da academia não encontradas');
          setStats({
            totalStudents: 0,
            totalPersonals: 0,
            upcomingEvents: 0
          });
          return;
        }

        const academiaId = userData.academia.id;
        
        // Fetch alunos
        const alunosResponse = await fetch(`${connectionUrl}/alunos/listar`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Fetch personais da academia logada
        const personaisResponse = await fetch(`${connectionUrl}/personais/listar?academiaId=${academiaId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Fetch eventos ativos
        const eventosResponse = await fetch(`${connectionUrl}/eventos?futuros=true`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Processamento das respostas
        let totalAlunos = 0;
        let totalPersonals = 0;
        let upcomingEvents = 0;

        if (alunosResponse.ok) {
          const alunosData = await alunosResponse.json();
          totalAlunos = Array.isArray(alunosData) ? alunosData.length : 0;
        }

        if (personaisResponse.ok) {
          const personaisData = await personaisResponse.json();
          totalPersonals = Array.isArray(personaisData) ? personaisData.length : 0;
        }

        if (eventosResponse.ok) {
          const eventosData = await eventosResponse.json();
          upcomingEvents = Array.isArray(eventosData) ? eventosData.length : 0;
        }

        // Atualizar estatísticas
        setStats({
          totalStudents: totalAlunos,
          totalPersonals: totalPersonals,
          upcomingEvents: upcomingEvents
        });
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        // Usar valores padrão em caso de erro
        setStats({
          totalStudents: 0,
          totalPersonals: 0,
          upcomingEvents: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userData) {
      fetchDashboardData();
    }
  }, [userData]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard da Academia</h1>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-blue-500 p-4 rounded-lg">
            <FaUsers className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm text-gray-600">Alunos</h2>
            <p className="text-2xl font-semibold text-gray-800">{stats.totalStudents}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-green-500 p-4 rounded-lg">
            <FaUserTie className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm text-gray-600">Personais</h2>
            <p className="text-2xl font-semibold text-gray-800">{stats.totalPersonals}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
          <div className="bg-purple-500 p-4 rounded-lg">
            <FaCalendarCheck className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-sm text-gray-600">Eventos Ativos</h2>
            <p className="text-2xl font-semibold text-gray-800">{stats.upcomingEvents}</p>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal do Dashboard */}
      <div className="mb-6">
        {/* Lista de Tarefas */}
        <TodoListTabs containerClassName="h-full" />
      </div>
      
      {/* Eventos da Academia */}
      <div className="mt-6">
        <EventosTabs containerClassName="w-full" userRole="ACADEMIA" />
      </div>
    </div>
  );
};

export default AcademiaDashboard; 