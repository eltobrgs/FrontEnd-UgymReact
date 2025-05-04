import { FC, useState, useEffect } from 'react';
import { connectionUrl } from '../../config/connection';
import { FaMoneyBillWave, FaUser, FaCalendar, FaPlus } from 'react-icons/fa';

interface Aluno {
  id: number;
  userId: number;
  nome: string;
  email: string;
  goal: string;
  statusPagamento: 'PAGO' | 'PENDENTE' | 'ATRASADO';
  ultimoPagamento: string | null;
  dataVencimento: string | null;
  plano: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
  valor: number;
}

interface Pagamento {
  id: number;
  valor: number;
  dataPagamento: string;
  dataVencimento: string;
  status: 'PAGO' | 'PENDENTE' | 'ATRASADO';
  formaPagamento: string;
  tipoPlano: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL';
  observacoes?: string;
  alunoId: number;
  academiaId: number;
  createdAt: string;
  updatedAt: string;
}

const AcademiaFinancas: FC = () => {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [alunoSelecionado, setAlunoSelecionado] = useState<Aluno | null>(null);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPagamentosLoading, setIsPagamentosLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    valor: '',
    dataPagamento: '',
    dataVencimento: '',
    status: 'PAGO',
    formaPagamento: '',
    tipoPlano: 'MENSAL',
    observacoes: ''
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch dos alunos com status de pagamento
  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('Token de autenticação não encontrado');
          return;
        }
        
        const response = await fetch(`${connectionUrl}/alunos/pagamentos`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar alunos: ${response.status}`);
        }
        
        const data = await response.json();
        setAlunos(data);
        
        // Selecionar o primeiro aluno automaticamente se existir
        if (data.length > 0) {
          setAlunoSelecionado(data[0]);
          await fetchPagamentosAluno(data[0].id);
        }
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAlunos();
  }, []);

  // Buscar histórico de pagamentos ao selecionar um aluno
  const fetchPagamentosAluno = async (alunoId: number) => {
    try {
      setIsPagamentosLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch(`${connectionUrl}/alunos/${alunoId}/pagamentos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar pagamentos: ${response.status}`);
      }
      
      const data = await response.json();
      setPagamentos(data);
    } catch (error) {
      console.error('Erro ao buscar pagamentos:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsPagamentosLoading(false);
    }
  };

  const handleSelectAluno = (aluno: Aluno) => {
    setAlunoSelecionado(aluno);
    fetchPagamentosAluno(aluno.id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!alunoSelecionado) return;
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token de autenticação não encontrado');
        return;
      }
      
      const response = await fetch(`${connectionUrl}/pagamentos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          alunoId: alunoSelecionado.id,
          ...formData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao registrar pagamento: ${response.status}`);
      }
      
      // Resetar formulário e fechar modal
      setFormData({
        valor: '',
        dataPagamento: '',
        dataVencimento: '',
        status: 'PAGO',
        formaPagamento: '',
        tipoPlano: 'MENSAL',
        observacoes: ''
      });
      setShowAddModal(false);
      
      // Atualizar lista de pagamentos
      await fetchPagamentosAluno(alunoSelecionado.id);
      
      // Atualizar lista de alunos para refletir novo status
      const alunosResponse = await fetch(`${connectionUrl}/alunos/pagamentos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (alunosResponse.ok) {
        const alunosData = await alunosResponse.json();
        setAlunos(alunosData);
        
        // Atualizar aluno selecionado
        const alunoAtualizado = alunosData.find((a: Aluno) => a.id === alunoSelecionado.id);
        if (alunoAtualizado) {
          setAlunoSelecionado(alunoAtualizado);
        }
      }
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    }
  };

  // Formatar data
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não definido';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Obter cor do status de pagamento
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'bg-green-500';
      case 'PENDENTE':
        return 'bg-yellow-500';
      case 'ATRASADO':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Controle Financeiro</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Erro</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Alunos */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">Alunos</h2>
            <span className="text-sm text-gray-500">{alunos.length} alunos</span>
          </div>
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            {alunos.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum aluno encontrado
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {alunos.map(aluno => (
                  <div 
                    key={aluno.id}
                    onClick={() => handleSelectAluno(aluno)}
                    className={`p-3 cursor-pointer hover:bg-gray-50 transition ${
                      alunoSelecionado?.id === aluno.id ? 'bg-red-50 border-l-4 border-red-500' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(aluno.statusPagamento)}`}></div>
                      <div className="flex-1">
                        <h3 className="font-medium">{aluno.nome}</h3>
                        <div className="flex justify-between">
                          <p className="text-sm text-gray-500">{aluno.goal}</p>
                          <p className="text-sm font-medium">
                            {aluno.dataVencimento ? formatDate(aluno.dataVencimento) : 'Sem vencimento'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Detalhes do Aluno */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md">
          {alunoSelecionado ? (
            <>
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-semibold">Pagamentos - {alunoSelecionado.nome}</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm flex items-center"
                >
                  <FaPlus className="mr-1" /> Novo Pagamento
                </button>
              </div>
              
              <div className="p-4">
                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <FaCalendar className="text-blue-500 mb-2" />
                    <p className="text-sm text-gray-600">Último Pagamento</p>
                    <p className="font-semibold">{formatDate(alunoSelecionado.ultimoPagamento)}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                    <FaCalendar className="text-green-500 mb-2" />
                    <p className="text-sm text-gray-600">Próximo Vencimento</p>
                    <p className="font-semibold">{formatDate(alunoSelecionado.dataVencimento)}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <FaMoneyBillWave className="text-purple-500 mb-2" />
                    <p className="text-sm text-gray-600">Plano Atual</p>
                    <p className="font-semibold">{getPlanoText(alunoSelecionado.plano)}</p>
                  </div>
                </div>
                
                {/* Histórico de Pagamentos */}
                <h3 className="text-lg font-medium mb-3">Histórico de Pagamentos</h3>
                {isPagamentosLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                  </div>
                ) : pagamentos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum pagamento encontrado para este aluno
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Data</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Valor</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Vencimento</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Plano</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Forma</th>
                          <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Status</th>
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
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                pagamento.status === 'PAGO' ? 'bg-green-100 text-green-800' : 
                                pagamento.status === 'PENDENTE' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {getStatusText(pagamento.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 p-8 text-center">
              <div>
                <FaUser className="text-gray-300 text-5xl mx-auto mb-4" />
                <p className="text-gray-500">Selecione um aluno para ver os detalhes de pagamento</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para adicionar novo pagamento */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Registrar Pagamento</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Valor (R$)
                </label>
                <input
                  type="number"
                  name="valor"
                  value={formData.valor}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Data do Pagamento
                </label>
                <input
                  type="date"
                  name="dataPagamento"
                  value={formData.dataPagamento}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Data de Vencimento
                </label>
                <input
                  type="date"
                  name="dataVencimento"
                  value={formData.dataVencimento}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Forma de Pagamento
                </label>
                <input
                  type="text"
                  name="formaPagamento"
                  value={formData.formaPagamento}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                  placeholder="Ex: Cartão de Crédito, PIX, Boleto"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Plano
                </label>
                <select
                  name="tipoPlano"
                  value={formData.tipoPlano}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="MENSAL">Mensal</option>
                  <option value="TRIMESTRAL">Trimestral</option>
                  <option value="SEMESTRAL">Semestral</option>
                  <option value="ANUAL">Anual</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="PAGO">Pago</option>
                  <option value="PENDENTE">Pendente</option>
                  <option value="ATRASADO">Atrasado</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Observações
                </label>
                <textarea
                  name="observacoes"
                  value={formData.observacoes}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={3}
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademiaFinancas; 