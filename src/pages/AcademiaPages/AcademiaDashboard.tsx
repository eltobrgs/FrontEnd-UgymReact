import { FC, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { FaUsers, FaUserTie, FaDumbbell, FaCalendarAlt, FaMoneyBillWave } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { connectionUrl } from '../../config/connection';

interface DashboardStats {
  totalStudents: number;
  totalPersonals: number;
  totalEquipment: number;
  upcomingEvents: number;
  monthlyRevenue: number;
}

const AcademiaDashboard: FC = () => {
  const { userData } = useUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalPersonals: 0,
    totalEquipment: 0,
    upcomingEvents: 0,
    monthlyRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${connectionUrl}/academia/perfil`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          // Se não conseguir dados reais, usar dados de exemplo
          setStats({
            totalStudents: 145,
            totalPersonals: 12,
            totalEquipment: 35,
            upcomingEvents: 3,
            monthlyRevenue: 15750
          });
        }
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        // Usar dados de exemplo em caso de erro
        setStats({
          totalStudents: 145,
          totalPersonals: 12,
          totalEquipment: 35,
          upcomingEvents: 3,
          monthlyRevenue: 15750
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard: FC<{ title: string; value: number; icon: IconType; color: string; prefix?: string }> = ({ 
    title, value, icon: Icon, color, prefix = '' 
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
      <div className={`p-4 rounded-full ${color} text-white mr-4`}>
        <Icon size={24} />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        {loading ? (
          <span className="text-2xl font-bold text-gray-800 block">
            <span className="h-8 w-24 bg-gray-200 rounded animate-pulse inline-block"></span>
          </span>
        ) : (
          <span className="text-2xl font-bold text-gray-800 block">
            {prefix}{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </span>
        )}
      </div>
    </div>
  );

  if (!userData || !userData.academia) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Complete seu perfil</h2>
          <p className="text-gray-300 mb-6">
            Para acessar todas as funcionalidades, complete seu perfil de academia.
          </p>
          <Link
            to="/edit-academia-profile"
            className="w-full block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Completar Perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard da Academia</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total de Alunos" 
          value={stats.totalStudents} 
          icon={FaUsers} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Total de Personais" 
          value={stats.totalPersonals} 
          icon={FaUserTie} 
          color="bg-green-500" 
        />
        <StatCard 
          title="Equipamentos" 
          value={stats.totalEquipment} 
          icon={FaDumbbell} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Eventos Próximos" 
          value={stats.upcomingEvents} 
          icon={FaCalendarAlt} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title="Receita Mensal" 
          value={stats.monthlyRevenue} 
          icon={FaMoneyBillWave} 
          color="bg-red-500" 
          prefix="R$ " 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Atividade Recente</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center">
                  <div className="h-10 w-10 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <FaUsers className="text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">Novo aluno registrado</p>
                  <p className="text-sm text-gray-500">Há 2 horas</p>
                </div>
              </div>
              <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <FaUserTie className="text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Personal adicionado</p>
                  <p className="text-sm text-gray-500">Ontem</p>
                </div>
              </div>
              <div className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="bg-yellow-100 p-2 rounded-full mr-3">
                  <FaCalendarAlt className="text-yellow-500" />
                </div>
                <div>
                  <p className="font-medium">Novo evento criado</p>
                  <p className="text-sm text-gray-500">Há 3 dias</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Tarefas Pendentes</h2>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-3 h-5 w-5 text-red-600" />
                  <span>Revisar novos cadastros de alunos</span>
                </div>
                <span className="text-sm text-red-500 font-medium">Hoje</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-3 h-5 w-5 text-red-600" />
                  <span>Atualizar informações de equipamentos</span>
                </div>
                <span className="text-sm text-yellow-500 font-medium">Amanhã</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <input type="checkbox" className="mr-3 h-5 w-5 text-red-600" />
                  <span>Planejar evento de fim de mês</span>
                </div>
                <span className="text-sm text-gray-500 font-medium">Em 5 dias</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademiaDashboard; 