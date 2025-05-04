import { FC, useState, useEffect } from 'react';
import { connectionUrl } from '../../config/connection';
import { FaMoneyBillWave, FaCalendarAlt, FaClock, FaCreditCard } from 'react-icons/fa';

interface Pagamento {
  id: number;
  valor: number;
  dataPagamento: string;
  dataVencimento: string;
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO';
  formaPagamento: string;
  tipoPlano: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
  observacoes?: string;
}

interface ResumoPagamento {
  proximoVencimento: string;
  diasRestantes: number;
  planoAtual: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
  valorMensalidade: number;
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO';
}

const AlunoPagamentos: FC = () => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [resumo, setResumo] = useState<ResumoPagamento | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPagamentos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Token de autenticação não encontrado');
          return;
        }
        
        const response = await fetch(`${connectionUrl}/pagamentos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar pagamentos: ${response.status}`);
        }
        
        const data = await response.json();
        setPagamentos(data.historico || []);
        setResumo(data.resumo);
      } catch (error) {
        console.error('Erro ao buscar pagamentos:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPagamentos();
  }, []);

  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Obter texto do status de pagamento
  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'Pago';
      case 'PENDENTE':
        return 'Pendente';
      case 'ATRASADO':
        return 'Atrasado';
      default:
        return status;
    }
  };

  // Obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'text-green-600';
      case 'PENDENTE':
        return 'text-yellow-600';
      case 'ATRASADO':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Obter cor do badge de status
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'bg-green-100 text-green-800';
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'ATRASADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obter texto do plano
  const getPlanoText = (plano: string) => {
    switch (plano) {
      case 'MENSAL':
        return 'Mensal';
      case 'TRIMESTRAL':
        return 'Trimestral';
      case 'SEMESTRAL':
        return 'Semestral';
      case 'ANUAL':
        return 'Anual';
      default:
        return plano;
    }
  };

  // Obter cor do indicador de dias restantes
  const getDiasRestantesColor = (dias: number) => {
    if (dias <= 3) return 'bg-red-100 text-red-800';
    if (dias <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Meus Pagamentos</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Resumo do Plano */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {resumo ? (
          <>
            <h2 className="text-xl font-semibold mb-6">Resumo da Mensalidade</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <FaMoneyBillWave className="text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Plano Atual</p>
                  <p className="text-lg font-semibold">{getPlanoText(resumo.planoAtual)}</p>
                  <p className="text-sm text-gray-500">R$ {resumo.valorMensalidade.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <FaCalendarAlt className="text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Próximo Vencimento</p>
                  <p className="text-lg font-semibold">{formatDate(resumo.proximoVencimento)}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <FaClock className="text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Dias Restantes</p>
                  <p className="text-lg font-semibold">
                    <span className={`px-2 py-1 rounded-full text-xs ${getDiasRestantesColor(resumo.diasRestantes)}`}>
                      {resumo.diasRestantes > 0 
                        ? `${resumo.diasRestantes} dias restantes` 
                        : 'Vencido!'}
                    </span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 flex-shrink-0 
                  ${resumo.status === 'PAGO' ? 'bg-green-100' : 
                  resumo.status === 'PENDENTE' ? 'bg-yellow-100' : 'bg-red-100'}`}>
                  <FaCreditCard className={
                    resumo.status === 'PAGO' ? 'text-green-500' : 
                    resumo.status === 'PENDENTE' ? 'text-yellow-500' : 'text-red-500'
                  } />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={`text-lg font-semibold ${getStatusColor(resumo.status)}`}>
                    {getStatusText(resumo.status)}
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaMoneyBillWave className="text-gray-400 text-xl" />
            </div>
            <p className="text-gray-500">Você ainda não possui informações de pagamento</p>
          </div>
        )}
      </div>
      
      {/* Histórico de Pagamentos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Histórico de Pagamentos</h2>
        </div>
        
        <div className="p-4">
          {pagamentos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-3 px-4 text-left">Data</th>
                    <th className="py-3 px-4 text-left">Valor</th>
                    <th className="py-3 px-4 text-left">Vencimento</th>
                    <th className="py-3 px-4 text-left">Plano</th>
                    <th className="py-3 px-4 text-left">Forma de Pagamento</th>
                    <th className="py-3 px-4 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pagamentos.map(pagamento => (
                    <tr key={pagamento.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDate(pagamento.dataPagamento)}</td>
                      <td className="py-3 px-4">R$ {pagamento.valor.toFixed(2)}</td>
                      <td className="py-3 px-4">{formatDate(pagamento.dataVencimento)}</td>
                      <td className="py-3 px-4">{getPlanoText(pagamento.tipoPlano)}</td>
                      <td className="py-3 px-4">{pagamento.formaPagamento}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeColor(pagamento.status)}`}>
                          {getStatusText(pagamento.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMoneyBillWave className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500">Nenhum pagamento encontrado no histórico</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlunoPagamentos; 