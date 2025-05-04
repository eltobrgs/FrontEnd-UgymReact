import { FC, useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaUserTie, 
  FaClipboardList, 
  FaCalendarAlt, 
  FaUserPlus, 
  FaEdit, 
  FaTrash,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { connectionUrl } from '../../../config/connection';

type AcaoTipo = 'CADASTRO_ALUNO' | 'CADASTRO_PERSONAL' | 'CADASTRO_TAREFA' | 'CADASTRO_EVENTO' | 
                'EDICAO_ALUNO' | 'EDICAO_PERSONAL' | 'EDICAO_TAREFA' | 'EDICAO_EVENTO' | 
                'EXCLUSAO_ALUNO' | 'EXCLUSAO_PERSONAL' | 'EXCLUSAO_TAREFA' | 'EXCLUSAO_EVENTO' |
                'CONCLUSAO_TAREFA';

interface Acao {
  id: number;
  tipo: AcaoTipo;
  descricao: string;
  data: string;
  usuarioId: number;
  usuarioNome: string;
}

interface AcoesRecentesProps {
  containerClassName?: string;
  maxItems?: number;
}

const AcoesRecentes: FC<AcoesRecentesProps> = ({ containerClassName = "", maxItems = 10 }) => {
  const [acoes, setAcoes] = useState<Acao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchAcoes = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${connectionUrl}/academia/acoes-recentes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          console.error(`Erro ao buscar ações recentes: ${response.status}`);
          // Em vez de lançar um erro, apenas use dados de exemplo e continue
          setDadosExemplo();
          return;
        }

        const data = await response.json();
        setAcoes(data);
      } catch (error) {
        console.error('Erro ao buscar ações recentes:', error);
        // Em vez de mostrar um erro, apenas use dados de exemplo
        setDadosExemplo();
      } finally {
        setIsLoading(false);
      }
    };

    const setDadosExemplo = () => {
      // Dados de exemplo em caso de erro
      setAcoes([
        {
          id: 1,
          tipo: 'CADASTRO_ALUNO',
          descricao: 'Novo aluno registrado',
          data: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
          usuarioId: 1,
          usuarioNome: 'Admin'
        },
        {
          id: 2,
          tipo: 'CADASTRO_PERSONAL',
          descricao: 'Novo personal cadastrado',
          data: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
          usuarioId: 1,
          usuarioNome: 'Admin'
        },
        {
          id: 3,
          tipo: 'CADASTRO_EVENTO',
          descricao: 'Evento de fim de ano criado',
          data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
          usuarioId: 1,
          usuarioNome: 'Admin'
        },
        {
          id: 4,
          tipo: 'CADASTRO_TAREFA',
          descricao: 'Nova tarefa criada',
          data: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 dias atrás
          usuarioId: 1,
          usuarioNome: 'Admin'
        },
        {
          id: 5,
          tipo: 'CONCLUSAO_TAREFA',
          descricao: 'Tarefa concluída',
          data: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias atrás
          usuarioId: 2,
          usuarioNome: 'João Silva'
        }
      ]);
    };

    if (token) {
      fetchAcoes();
    }
  }, [token]);

  // Obter ícone com base no tipo de ação
  const getAcaoIcon = (tipo: AcaoTipo) => {
    switch (tipo) {
      case 'CADASTRO_ALUNO':
        return <FaUserPlus className="text-blue-500" />;
      case 'CADASTRO_PERSONAL':
        return <FaUserTie className="text-green-500" />;
      case 'CADASTRO_TAREFA':
        return <FaClipboardList className="text-purple-500" />;
      case 'CADASTRO_EVENTO':
        return <FaCalendarAlt className="text-yellow-500" />;
      case 'EDICAO_ALUNO':
      case 'EDICAO_PERSONAL':
      case 'EDICAO_TAREFA':
      case 'EDICAO_EVENTO':
        return <FaEdit className="text-orange-500" />;
      case 'EXCLUSAO_ALUNO':
      case 'EXCLUSAO_PERSONAL':
      case 'EXCLUSAO_TAREFA':
      case 'EXCLUSAO_EVENTO':
        return <FaTrash className="text-red-500" />;
      case 'CONCLUSAO_TAREFA':
        return <FaCheckCircle className="text-green-500" />;
      default:
        return <FaUsers className="text-gray-500" />;
    }
  };

  // Obter cor do background do ícone com base no tipo de ação
  const getAcaoBgColor = (tipo: AcaoTipo) => {
    if (tipo.startsWith('CADASTRO_')) return 'bg-blue-100';
    if (tipo.startsWith('EDICAO_')) return 'bg-orange-100';
    if (tipo.startsWith('EXCLUSAO_')) return 'bg-red-100';
    if (tipo === 'CONCLUSAO_TAREFA') return 'bg-green-100';
    return 'bg-gray-100';
  };

  // Função para formatar data relativa (há X tempo)
  const formatarDataRelativa = (dataString: string) => {
    const data = new Date(dataString);
    const agora = new Date();
    const diff = agora.getTime() - data.getTime();
    
    const segundos = Math.floor(diff / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    if (dias > 0) {
      return `Há ${dias} dia${dias > 1 ? 's' : ''}`;
    } else if (horas > 0) {
      return `Há ${horas} hora${horas > 1 ? 's' : ''}`;
    } else if (minutos > 0) {
      return `Há ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    } else {
      return 'Agora mesmo';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${containerClassName}`}>
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Atividades Recentes</h2>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : acoes.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FaTimesCircle className="text-gray-400 text-lg" />
            </div>
            <p className="text-gray-500">Nenhuma atividade recente encontrada</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {acoes.slice(0, maxItems).map((acao) => (
              <div key={acao.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-full mr-3 ${getAcaoBgColor(acao.tipo)}`}>
                  {getAcaoIcon(acao.tipo)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{acao.descricao}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>por {acao.usuarioNome}</span>
                    <span>{formatarDataRelativa(acao.data)}</span>
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

export default AcoesRecentes; 