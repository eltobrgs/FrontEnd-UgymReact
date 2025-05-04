import { FC, useState, useEffect } from 'react';
import { connectionUrl } from '../../../config/connection';
import { FaMoneyBillWave, FaCalendar, FaClock } from 'react-icons/fa';

interface StatusPagamentoProps {
  containerClassName?: string;
}

interface ResumoPagamento {
  proximoVencimento: string;
  diasRestantes: number;
  planoAtual: string;
  valorMensalidade: number;
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO';
}

const StatusPagamento: FC<StatusPagamentoProps> = ({ containerClassName = "" }) => {
  const [resumo, setResumo] = useState<ResumoPagamento | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResumo = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('Token de autenticação não encontrado');
          return;
        }
        
        const response = await fetch(`${connectionUrl}/pagamentos/resumo`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          console.error(`Erro ao buscar resumo de pagamento: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        setResumo(data);
      } catch (error) {
        console.error('Erro ao buscar resumo de pagamento:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResumo();
  }, []);

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Obter cor do status de pagamento
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

  // Obter cor do indicador de dias restantes
  const getDiasRestantesColor = (dias: number) => {
    if (dias <= 3) return 'bg-red-100 text-red-800';
    if (dias <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${containerClassName}`}>
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Status do Pagamento</h2>
        <FaMoneyBillWave className="text-red-600" />
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
          </div>
        ) : !resumo ? (
          <div className="text-center py-4 text-gray-500">
            Informações de pagamento não disponíveis
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <FaCalendar className="text-red-500 mr-2" />
                <span className="text-gray-700">Próximo vencimento:</span>
              </div>
              <span className="font-medium">{formatDate(resumo.proximoVencimento)}</span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <FaClock className="text-red-500 mr-2" />
                <span className="text-gray-700">Dias restantes:</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getDiasRestantesColor(resumo.diasRestantes)}`}>
                {resumo.diasRestantes > 0 
                  ? `${resumo.diasRestantes} dias` 
                  : 'Vencido!'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaMoneyBillWave className="text-red-500 mr-2" />
                <span className="text-gray-700">Status:</span>
              </div>
              <span className={`font-medium ${getStatusColor(resumo.status)}`}>
                {getStatusText(resumo.status)}
              </span>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-center">
                <span className="text-gray-500 text-sm">
                  Plano {resumo.planoAtual.toLowerCase()} - R$ {resumo.valorMensalidade.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusPagamento; 