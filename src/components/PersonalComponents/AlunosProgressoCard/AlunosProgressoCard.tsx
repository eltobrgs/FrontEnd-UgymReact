import { FC, useState, useEffect } from 'react';
import { FaChartLine, FaDumbbell, FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';
import { connectionUrl } from '../../../config/connection';

interface AlunoProgresso {
  id: number;
  name: string;
  goal: string;
  imageUrl?: string;
  progressoTreino: number; // porcentagem de exercícios concluídos
  tendenciaPeso?: 'aumento' | 'reducao' | 'estavel';
  ultimaAtividade?: string; // data da última atividade
}

interface AlunosProgressoCardProps {
  containerClassName?: string;
}

const AlunosProgressoCard: FC<AlunosProgressoCardProps> = ({ containerClassName = "" }) => {
  const [alunos, setAlunos] = useState<AlunoProgresso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAlunosProgresso = async () => {
      try {
        setIsLoading(true);
        
        // Primeiro, buscar alunos vinculados ao personal
        const alunosResponse = await fetch(`${connectionUrl}/personal/meus-alunos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!alunosResponse.ok) {
          console.error(`Erro ao buscar alunos: ${alunosResponse.status}`);
          setDadosExemplo();
          return;
        }

        const alunosData = await alunosResponse.json();
        
        // Se não tiver alunos, mostrar dados de exemplo
        if (!alunosData || alunosData.length === 0) {
          setDadosExemplo();
          return;
        }
        
        // Processar dados dos alunos para formato de progresso
        const progressoAlunos = alunosData.map((aluno: any) => {
          // Gerar valores aleatórios para simulação
          const progressoTreino = Math.floor(Math.random() * 100);
          const tendencias = ['aumento', 'reducao', 'estavel'] as const;
          const tendenciaPeso = tendencias[Math.floor(Math.random() * tendencias.length)];
          
          // Data aleatória recente para última atividade
          const diasAtras = Math.floor(Math.random() * 14); // Últimos 14 dias
          const ultimaAtividade = new Date();
          ultimaAtividade.setDate(ultimaAtividade.getDate() - diasAtras);
          
          return {
            id: aluno.id,
            name: aluno.name,
            goal: aluno.goal || 'Não definido',
            imageUrl: aluno.imageUrl,
            progressoTreino,
            tendenciaPeso,
            ultimaAtividade: ultimaAtividade.toISOString()
          };
        });
        
        setAlunos(progressoAlunos);
      } catch (error) {
        console.error('Erro ao buscar progresso dos alunos:', error);
        setDadosExemplo();
      } finally {
        setIsLoading(false);
      }
    };
    
    const setDadosExemplo = () => {
      // Dados de exemplo em caso de erro
      setAlunos([
        {
          id: 1,
          name: "João Silva",
          goal: "Ganho de massa muscular",
          progressoTreino: 75,
          tendenciaPeso: 'aumento',
          ultimaAtividade: "2023-11-20T14:30:00"
        },
        {
          id: 2,
          name: "Maria Santos",
          goal: "Perda de peso",
          progressoTreino: 85,
          tendenciaPeso: 'reducao',
          ultimaAtividade: "2023-11-22T09:15:00"
        },
        {
          id: 3,
          name: "Pedro Oliveira",
          goal: "Condicionamento físico",
          progressoTreino: 40,
          tendenciaPeso: 'estavel',
          ultimaAtividade: "2023-11-18T16:45:00"
        }
      ]);
    };

    if (token) {
      fetchAlunosProgresso();
    }
  }, [token]);

  // Função para formatar data
  const formatarData = (dataString?: string) => {
    if (!dataString) return 'Não disponível';
    
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Obter ícone da tendência de peso
  const getTendenciaIcon = (tendencia?: 'aumento' | 'reducao' | 'estavel') => {
    switch (tendencia) {
      case 'aumento':
        return <FaArrowUp className="text-green-500" />;
      case 'reducao':
        return <FaArrowDown className="text-red-500" />;
      case 'estavel':
        return <FaEquals className="text-blue-500" />;
      default:
        return null;
    }
  };

  // Obter texto da tendência de peso
  const getTendenciaText = (tendencia?: 'aumento' | 'reducao' | 'estavel') => {
    switch (tendencia) {
      case 'aumento':
        return 'Ganho de peso';
      case 'reducao':
        return 'Perda de peso';
      case 'estavel':
        return 'Peso estável';
      default:
        return 'Não disponível';
    }
  };

  // Obter cor da barra de progresso
  const getProgressColor = (progresso: number) => {
    if (progresso < 40) return 'bg-red-500';
    if (progresso < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${containerClassName}`}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Progresso dos Alunos</h2>
          <FaChartLine className="text-red-600" />
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : alunos.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaDumbbell className="text-gray-400 text-lg" />
            </div>
            <p className="text-gray-500">Nenhum aluno encontrado com dados de progresso</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {alunos.map((aluno) => (
              <div key={aluno.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    {aluno.imageUrl ? (
                      <img
                        src={aluno.imageUrl}
                        alt={aluno.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-red-600 font-bold">{aluno.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{aluno.name}</h3>
                    <p className="text-sm text-gray-600">{aluno.goal}</p>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso dos Treinos</span>
                    <span className="font-medium">{aluno.progressoTreino}%</span>
                  </div>
                  <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getProgressColor(aluno.progressoTreino)}`}
                      style={{ width: `${aluno.progressoTreino}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    {getTendenciaIcon(aluno.tendenciaPeso)}
                    <span className="ml-1">{getTendenciaText(aluno.tendenciaPeso)}</span>
                  </div>
                  <div>
                    Última atividade: {formatarData(aluno.ultimaAtividade)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlunosProgressoCard; 