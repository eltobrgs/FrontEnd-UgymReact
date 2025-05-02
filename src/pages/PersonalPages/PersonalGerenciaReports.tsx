import { useState, useEffect } from 'react';
import { connectionUrl } from '../../config/connection';
import { useAuth } from '../../contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';

interface Student {
  id: number;
  userId: number;
  name: string;
  email: string;
  gender: string;
  goal: string;
  age: number;
}

interface Report {
  id: number;
  valor: number;
  data: string;
  observacao?: string;
}

interface ReportsByType {
  [key: string]: Report[];
}

type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'composed';

const tiposRelatorioPT: Record<string, string> = {
  'peso': 'Peso (kg)',
  'IMC': 'IMC',
  'medidas_braco': 'Medidas do Braço (cm)',
  'medidas_perna': 'Medidas da Perna (cm)',
  'medidas_cintura': 'Medidas da Cintura (cm)',
  'gordura_corporal': 'Gordura Corporal (%)'
};

const chartTypeLabels: Record<ChartType, string> = {
  'line': 'Linha',
  'bar': 'Barras',
  'area': 'Área',
  'pie': 'Pizza',
  'radar': 'Radar',
  'composed': 'Composto'
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const PersonalGerenciaReports = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<ReportsByType>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReport, setNewReport] = useState({
    tipo: 'peso',
    valor: '',
    data: '',
    observacao: ''
  });
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [chartTypes, setChartTypes] = useState<Record<string, ChartType>>({});
  const [expandedHistories, setExpandedHistories] = useState<Record<string, boolean>>({});

  // Inicializar tipos de gráfico e estados de expansão
  useEffect(() => {
    // Definir o tipo de gráfico padrão para cada relatório e o estado padrão para o histórico (fechado)
    const types: Record<string, ChartType> = {};
    const histories: Record<string, boolean> = {};
    
    Object.keys(reports).forEach(tipo => {
      if (!chartTypes[tipo]) {
        types[tipo] = 'line';
      }
      if (expandedHistories[tipo] === undefined) {
        histories[tipo] = false;
      }
    });
    
    if (Object.keys(types).length > 0) {
      setChartTypes(prev => ({ ...prev, ...types }));
    }
    
    if (Object.keys(histories).length > 0) {
      setExpandedHistories(prev => ({ ...prev, ...histories }));
    }
  }, [reports]);

  // Buscar alunos vinculados ao personal
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${connectionUrl}/personal/meus-alunos`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar alunos: ${response.status}`);
        }
        
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar seus alunos.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchStudents();
    }
  }, [token]);

  // Buscar relatórios do aluno selecionado
  const fetchReports = async (studentId: number) => {
    try {
      setIsLoading(true);
      console.log(`Buscando relatórios para o aluno ID ${studentId}`);
      
      const response = await fetch(`${connectionUrl}/personal/aluno/${studentId}/reports`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Tentar decodificar o body da resposta mesmo em caso de erro
      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error("Erro ao parsear resposta:", e);
        console.log("Resposta recebida:", responseText);
      }
      
      if (!response.ok) {
        const errorMessage = data?.error || `Erro ${response.status}: ${response.statusText}`;
        console.error(`Erro na requisição: ${errorMessage}`, data);
        throw new Error(errorMessage);
      }
      
      setReports(data.reports || {});
      console.log("Relatórios recebidos:", data.reports);
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: error instanceof Error ? error.message : 'Não foi possível carregar os relatórios deste aluno.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Selecionar um aluno e buscar seus relatórios
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    fetchReports(student.id);
    setShowAddForm(false);
    setEditingReport(null);
  };

  // Salvar um novo relatório ou atualizar um existente
  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedStudent) return;
    
    try {
      setIsLoading(true);
      
      const reportData = {
        ...newReport,
        valor: parseFloat(newReport.valor),
        id: editingReport?.id
      };
      
      const response = await fetch(
        `${connectionUrl}/personal/aluno/${selectedStudent.id}/reports`, 
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify(reportData)
        }
      );
      
      if (!response.ok) {
        throw new Error(`Erro ao salvar relatório: ${response.status}`);
      }
      
      // Recarregar os relatórios
      fetchReports(selectedStudent.id);
      
      // Limpar o formulário
      setNewReport({
        tipo: 'peso',
        valor: '',
        data: '',
        observacao: ''
      });
      
      setShowAddForm(false);
      setEditingReport(null);
      
      Swal.fire({
        icon: 'success',
        title: 'Sucesso',
        text: `Relatório ${editingReport ? 'atualizado' : 'adicionado'} com sucesso!`
      });
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erro',
        text: `Não foi possível ${editingReport ? 'atualizar' : 'adicionar'} o relatório.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar a edição de um relatório
  const handleEditReport = (tipo: string, report: Report) => {
    setEditingReport(report);
    setNewReport({
      tipo,
      valor: report.valor.toString(),
      data: formatDate(report.data),
      observacao: report.observacao || ''
    });
    setShowAddForm(true);
  };

  // Preparar o formulário para adicionar um novo relatório
  const handleAddReport = () => {
    setEditingReport(null);
    setNewReport({
      tipo: 'peso',
      valor: '',
      data: '',
      observacao: ''
    });
    setShowAddForm(true);
  };

  // Alternar tipo de gráfico
  const toggleChartType = (tipo: string) => {
    const types: ChartType[] = ['line', 'bar', 'area', 'pie', 'radar', 'composed'];
    
    setChartTypes(prev => {
      const currentIndex = types.indexOf(prev[tipo] || 'line');
      const nextIndex = (currentIndex + 1) % types.length;
      return {
        ...prev,
        [tipo]: types[nextIndex]
      };
    });
  };

  // Alternar exibição do histórico
  const toggleHistory = (tipo: string) => {
    setExpandedHistories(prev => {
      // Cria uma nova cópia do objeto expandedHistories
      const newExpandedHistories = { ...prev };
      // Muda o estado apenas para o tipo específico
      newExpandedHistories[tipo] = !newExpandedHistories[tipo];
      return newExpandedHistories;
    });
  };

  // Formatar dados para os gráficos
  const formatChartData = (reportData: Report[], tipo?: string) => {
    const formattedData = reportData.map(report => ({
      data: formatDate(report.data),
      valor: report.valor,
      name: formatDate(report.data) // Para gráficos do tipo pie e radar
    })).sort((a, b) => {
      const dateA = new Date(a.data.split('/').reverse().join('-'));
      const dateB = new Date(b.data.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    // Para radar charts, precisamos de uma estrutura específica
    if (tipo && chartTypes[tipo] === 'radar') {
      return formattedData.map(item => ({
        subject: item.data,
        valor: item.valor
      }));
    }
    
    return formattedData;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Gerenciamento de Relatórios</h1>
      
      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Lista de alunos */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Meus Alunos</h2>
            <div className="bg-white rounded-lg shadow-md p-4 max-h-[70vh] overflow-y-auto">
              {students.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {students.map(student => (
                    <li 
                      key={student.id} 
                      className={`py-3 px-2 cursor-pointer hover:bg-gray-50 rounded transition ${selectedStudent?.id === student.id ? 'bg-red-50 border-l-4 border-red-500' : ''}`}
                      onClick={() => handleSelectStudent(student)}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                          {student.name[0].toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-500">{student.goal}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Você ainda não tem alunos vinculados.
                </div>
              )}
            </div>
          </div>
          
          {/* Conteúdo principal */}
          <div className="md:col-span-2">
            {selectedStudent ? (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Relatórios de {selectedStudent.name}</h2>
                  <button
                    onClick={handleAddReport}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    {showAddForm ? 'Cancelar' : 'Adicionar Relatório'}
                  </button>
                </div>
                
                {/* Formulário para adicionar/editar relatório */}
                {showAddForm && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-md p-6 mb-6"
                  >
                    <h3 className="text-lg font-medium mb-4">
                      {editingReport ? 'Editar Relatório' : 'Adicionar Novo Relatório'}
                    </h3>
                    <form onSubmit={handleSaveReport}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                          <select
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={newReport.tipo}
                            onChange={(e) => setNewReport({...newReport, tipo: e.target.value})}
                            required
                          >
                            {Object.entries(tiposRelatorioPT).map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                          <input
                            type="number"
                            step="0.01"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={newReport.valor}
                            onChange={(e) => setNewReport({...newReport, valor: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                          <input
                            type="text"
                            placeholder="DD/MM/AAAA"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={newReport.data}
                            onChange={(e) => setNewReport({...newReport, data: e.target.value})}
                          />
                          <small className="text-gray-500">Deixe em branco para usar a data atual</small>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={newReport.observacao}
                            onChange={(e) => setNewReport({...newReport, observacao: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          className="bg-gray-200 text-gray-800 px-4 py-2 rounded mr-2 hover:bg-gray-300 transition"
                          onClick={() => setShowAddForm(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
                
                {/* Gráficos e tabelas */}
                {Object.keys(reports).length > 0 ? (
                  <div className="space-y-8">
                    {Object.entries(reports).map(([tipo, reportData]) => (
                      <motion.div
                        key={tipo}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-lg shadow-md p-6"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium">{tiposRelatorioPT[tipo] || tipo}</h3>
                          <button 
                            onClick={() => toggleChartType(tipo)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm"
                          >
                            {chartTypeLabels[chartTypes[tipo] || 'line']}
                          </button>
                        </div>
                        
                        {/* Gráfico */}
                        <div className="h-[300px] mb-6">
                          <ResponsiveContainer width="100%" height="100%">
                            {chartTypes[tipo] === 'line' ? (
                              <LineChart
                                data={formatChartData(reportData, tipo)}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="data" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="valor" 
                                  stroke="#e53e3e" 
                                  activeDot={{ r: 8 }} 
                                  name={tiposRelatorioPT[tipo] || tipo}
                                />
                              </LineChart>
                            ) : chartTypes[tipo] === 'bar' ? (
                              <BarChart
                                data={formatChartData(reportData, tipo)}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="data" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar 
                                  dataKey="valor" 
                                  fill="#e53e3e" 
                                  name={tiposRelatorioPT[tipo] || tipo}
                                />
                              </BarChart>
                            ) : chartTypes[tipo] === 'area' ? (
                              <AreaChart
                                data={formatChartData(reportData, tipo)}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="data" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area 
                                  type="monotone" 
                                  dataKey="valor" 
                                  fill="#e53e3e" 
                                  stroke="#e53e3e"
                                  name={tiposRelatorioPT[tipo] || tipo}
                                />
                              </AreaChart>
                            ) : chartTypes[tipo] === 'pie' ? (
                              <PieChart
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <Pie 
                                  data={formatChartData(reportData, tipo)} 
                                  dataKey="valor" 
                                  nameKey="data" 
                                  cx="50%" 
                                  cy="50%" 
                                  outerRadius={100} 
                                  fill="#e53e3e"
                                  label={(entry) => entry.data}
                                >
                                  {formatChartData(reportData, tipo).map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={`#${(index * 2 + 5).toString(16)}53e3e`} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            ) : chartTypes[tipo] === 'radar' ? (
                              <RadarChart 
                                cx="50%" 
                                cy="50%" 
                                outerRadius="80%" 
                                data={formatChartData(reportData, tipo)}
                              >
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis />
                                <Radar 
                                  name={tiposRelatorioPT[tipo] || tipo} 
                                  dataKey="valor" 
                                  stroke="#e53e3e" 
                                  fill="#e53e3e" 
                                  fillOpacity={0.6} 
                                />
                                <Tooltip />
                                <Legend />
                              </RadarChart>
                            ) : (
                              <ComposedChart
                                data={formatChartData(reportData, tipo)}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="data" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="valor" barSize={20} fill="#413ea0" />
                                <Line type="monotone" dataKey="valor" stroke="#ff7300" />
                              </ComposedChart>
                            )}
                          </ResponsiveContainer>
                        </div>
                        
                        {/* Tabela */}
                        <div>
                          <button 
                            onClick={() => toggleHistory(tipo)}
                            className="flex items-center justify-between w-full font-medium text-gray-700 py-2 px-1 border-b border-gray-200 hover:bg-gray-50 transition-colors rounded"
                          >
                            <span>Histórico</span>
                            <svg 
                              className={`w-5 h-5 transition-transform ${expandedHistories[tipo] ? 'transform rotate-180' : ''}`}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24" 
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </button>
                          
                          {expandedHistories[tipo] && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-x-auto mt-2"
                            >
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observação</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {reportData.map((report) => (
                                    <tr key={report.id}>
                                      <td className="px-6 py-4 whitespace-nowrap">{formatDate(report.data)}</td>
                                      <td className="px-6 py-4 whitespace-nowrap">{report.valor}</td>
                                      <td className="px-6 py-4">{report.observacao || "-"}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button
                                          onClick={() => handleEditReport(tipo, report)}
                                          className="text-red-600 hover:text-red-800 transition"
                                        >
                                          Editar
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <p className="text-gray-500">
                      Nenhum relatório encontrado para este aluno. Clique em "Adicionar Relatório" para começar.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Selecione um aluno</h3>
                <p className="text-gray-500">
                  Escolha um aluno na lista à esquerda para visualizar e gerenciar seus relatórios.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalGerenciaReports;
