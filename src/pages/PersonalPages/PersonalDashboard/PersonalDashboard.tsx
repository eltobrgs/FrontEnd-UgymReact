import { FC, useEffect, useState } from 'react';
import { FaUsers, FaChartLine, FaCalendarCheck, FaMoneyBillWave } from 'react-icons/fa';
import StudentCard from '../../../components/GeralPurposeComponents/StudentCard/StudentCard';
import { connectionUrl } from '../../../config/api';

interface Student {
  id: number;
  name: string;
  age: number;
  weight: string;
  height: string;
  goal: string;
  trainingTime: string;
  imageUrl?: string;
}

const PersonalDashboard: FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${connectionUrl}/students`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar lista de alunos');
        }

        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total de Alunos',
      value: students.length,
      icon: FaUsers,
      color: 'bg-blue-500'
    },
    {
      title: 'Treinos Esta Semana',
      value: 45,
      icon: FaChartLine,
      color: 'bg-green-500'
    },
    {
      title: 'Consultas Hoje',
      value: 8,
      icon: FaCalendarCheck,
      color: 'bg-purple-500'
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 4.500',
      icon: FaMoneyBillWave,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 flex items-center"
          >
            <div className={`${stat.color} p-4 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm text-gray-600">{stat.title}</h2>
              <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Alunos Recentes */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Alunos Recentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.slice(0, 3).map((student) => (
            <StudentCard
              key={student.id}
              {...student}
            />
          ))}
        </div>
      </div>

      {/* Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Progresso dos Alunos</h2>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Gráfico de Progresso</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Análise de Desempenho</h2>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500">Gráfico de Desempenho</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard; 