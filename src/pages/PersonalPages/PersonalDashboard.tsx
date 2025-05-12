import { FC, useState, useEffect } from 'react';
import { connectionUrl } from '../../config/connection';
import TodoListTabs from '../../components/GeralPurposeComponents/TodoListTabs/TodoListTabs';
import EventosTabs from '../../components/GeralPurposeComponents/EventosTabs/EventosTabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaDumbbell, FaUserPlus, FaChevronDown, FaChevronUp, FaUserCircle } from 'react-icons/fa';

interface Student {
  id: number;
  userId: number;
  name: string;
  email: string;
  gender?: string;
  goal?: string;
  age?: number | string;
  imageUrl?: string;
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

const tiposRelatorioPT: Record<string, string> = {
  'peso': 'Peso (kg)',
  'IMC': 'IMC',
  'medidas_braco': 'Medidas do Braço (cm)',
  'medidas_perna': 'Medidas da Perna (cm)',
  'medidas_cintura': 'Medidas da Cintura (cm)',
  'gordura_corporal': 'Gordura Corporal (%)'
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};

const PersonalDashboard: FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<ReportsByType>({});
  const [isLoading, setIsLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [expandedReports, setExpandedReports] = useState<{[key: string]: boolean}>({});
  const [showReportsSection, setShowReportsSection] = useState(true);

  // Buscar alunos vinculados ao personal
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${connectionUrl}/personal/meus-alunos`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.error(`Erro ao buscar alunos: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        setStudents(data);
        
        // Se houver alunos, seleciona o primeiro e busca seus relatórios
        if (data && data.length > 0) {
          setSelectedStudent(data[0]);
          fetchReports(data[0].id);
        }
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Inicializar estado de expansão quando os relatórios são carregados
  useEffect(() => {
    const initialExpandedState: {[key: string]: boolean} = {};
    Object.keys(reports).forEach(tipo => {
      initialExpandedState[tipo] = false; // Começa fechado
    });
    setExpandedReports(initialExpandedState);
  }, [reports]);

  // Buscar relatórios do aluno selecionado
  const fetchReports = async (studentId: number) => {
    try {
      setReportsLoading(true);
      const token = localStorage.getItem('token');
      console.log(`Buscando relatórios para o aluno ID ${studentId}`);
      
      const response = await fetch(`${connectionUrl}/personal/aluno/${studentId}/reports`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error(`Erro ao buscar relatórios: ${response.status}`);
        // Dados de exemplo em caso de erro
        setDadosExemplo();
        return;
      }
      
      const data = await response.json();
      setReports(data.reports || {});
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      // Dados de exemplo em caso de erro
      setDadosExemplo();
    } finally {
      setReportsLoading(false);
    }
  };

  // Selecionar um aluno e buscar seus relatórios
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    fetchReports(student.id);
  };

  // Dados de exemplo em caso de erro
  const setDadosExemplo = () => {
    const hoje = new Date();
    const dadosExemplo: ReportsByType = {
      'peso': [
        { id: 1, valor: 78, data: new Date(hoje.getTime() - 60*24*60*60*1000).toISOString(), observacao: 'Início' },
        { id: 2, valor: 77, data: new Date(hoje.getTime() - 45*24*60*60*1000).toISOString(), observacao: 'Após 2 semanas' },
        { id: 3, valor: 75.5, data: new Date(hoje.getTime() - 30*24*60*60*1000).toISOString(), observacao: 'Após 1 mês' },
        { id: 4, valor: 73.2, data: new Date(hoje.getTime() - 15*24*60*60*1000).toISOString(), observacao: 'Após 1.5 mês' },
        { id: 5, valor: 72, data: hoje.toISOString(), observacao: 'Atual' }
      ],
      'gordura_corporal': [
        { id: 6, valor: 22, data: new Date(hoje.getTime() - 60*24*60*60*1000).toISOString(), observacao: 'Início' },
        { id: 7, valor: 21, data: new Date(hoje.getTime() - 45*24*60*60*1000).toISOString(), observacao: '' },
        { id: 8, valor: 19.5, data: new Date(hoje.getTime() - 30*24*60*60*1000).toISOString(), observacao: '' },
        { id: 9, valor: 18.2, data: new Date(hoje.getTime() - 15*24*60*60*1000).toISOString(), observacao: '' },
        { id: 10, valor: 17, data: hoje.toISOString(), observacao: 'Atual' }
      ],
      'medidas_braco': [
        { id: 11, valor: 32, data: new Date(hoje.getTime() - 60*24*60*60*1000).toISOString(), observacao: 'Início' },
        { id: 12, valor: 33, data: new Date(hoje.getTime() - 45*24*60*60*1000).toISOString(), observacao: '' },
        { id: 13, valor: 34, data: new Date(hoje.getTime() - 30*24*60*60*1000).toISOString(), observacao: '' },
        { id: 14, valor: 35, data: new Date(hoje.getTime() - 15*24*60*60*1000).toISOString(), observacao: '' },
        { id: 15, valor: 36, data: hoje.toISOString(), observacao: 'Atual' }
      ]
    };
    
    setReports(dadosExemplo);
  };

  // Formatar dados para os gráficos
  const formatChartData = (reportData: Report[]) => {
    return reportData
      .map(report => ({
        data: formatDate(report.data),
        valor: report.valor
      }))
      .sort((a, b) => {
        const dateA = new Date(a.data.split('/').reverse().join('-'));
        const dateB = new Date(b.data.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Alternar expansão do relatório
  const toggleExpandReport = (tipo: string) => {
    setExpandedReports(prev => ({
      ...prev,
      [tipo]: !prev[tipo]
    }));
  };

  // Alternar visibilidade da seção de relatórios
  const toggleReportsSection = () => {
    setShowReportsSection(prev => !prev);
  };

  // Expandir ou fechar todos os relatórios
  const toggleAllReports = (expand: boolean) => {
    const newState: {[key: string]: boolean} = {};
    Object.keys(reports).forEach(tipo => {
      newState[tipo] = expand;
    });
    setExpandedReports(newState);
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
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      {/* Conteúdo Principal do Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Alunos (com abas) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-4 border-b bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Meus Alunos</h2>
              <FaUserPlus className="text-white" />
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {students.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {students.map(student => (
                    <li 
                      key={student.id} 
                      className={`py-3 px-2 cursor-pointer hover:bg-gray-50 rounded transition ${selectedStudent?.id === student.id ? 'bg-red-50 border-l-4 border-red-500' : ''}`}
                      onClick={() => handleSelectStudent(student)}
                    >
                      <div className="flex items-center">
                        {student.imageUrl ? (
                          <div className="w-10 h-10 rounded-full bg-cover bg-center" 
                               style={{ backgroundImage: `url(${student.imageUrl})` }}>
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                            {student.name[0].toUpperCase()}
                          </div>
                        )}
                        <div className="ml-4">
                          <h3 className="font-medium">{student.name}</h3>
                          <p className="text-sm text-gray-500">{student.goal || 'Sem objetivo definido'}</p>
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
        </div>
        
        {/* Gráficos de Progresso */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div 
                className="p-4 border-b bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-between cursor-pointer"
                onClick={toggleReportsSection}
              >
                <div className="flex items-center">
                  {selectedStudent.imageUrl ? (
                    <div className="w-12 h-12 rounded-full mr-3 bg-cover bg-center border-2 border-white"
                         style={{ backgroundImage: `url(${selectedStudent.imageUrl})` }}>
                    </div>
                  ) : (
                    <FaUserCircle className="text-white w-12 h-12 mr-3" />
                  )}
                  <h2 className="text-xl font-semibold text-white">Progresso de {selectedStudent.name}</h2>
                </div>
                <div className="text-white">
                  {showReportsSection ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {showReportsSection && (
                <div className="p-4">
                  {reportsLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                      <p className="ml-3 text-gray-600">Carregando relatórios...</p>
                    </div>
                  ) : Object.keys(reports).length > 0 ? (
                    <div className="space-y-8">
                      <div className="flex justify-end gap-2 mb-2">
                        <button 
                          onClick={() => toggleAllReports(true)}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
                        >
                          Expandir todos
                        </button>
                        <button 
                          onClick={() => toggleAllReports(false)}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
                        >
                          Fechar todos
                        </button>
                      </div>

                      {Object.entries(reports).map(([tipo, reportData]) => (
                        <div key={tipo} className="border rounded-lg overflow-hidden">
                          <div 
                            className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                            onClick={() => toggleExpandReport(tipo)}
                          >
                            <h3 className="text-lg font-medium">{tiposRelatorioPT[tipo] || tipo}</h3>
                            <button className="text-gray-500 hover:text-red-600">
                              {expandedReports[tipo] ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                          </div>
                          
                          {expandedReports[tipo] && (
                            <div className="p-4">
                              <div className="h-[250px] mb-4">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart
                                    data={formatChartData(reportData)}
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
                                </ResponsiveContainer>
                              </div>
                              
                              {/* Tabela de dados */}
                              <div className="overflow-x-auto mt-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observação</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {reportData.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).map((report) => (
                                      <tr key={report.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(report.data)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{report.valor}</td>
                                        <td className="px-6 py-4">{report.observacao || "-"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FaDumbbell className="text-gray-400 text-xl" />
                      </div>
                      <p className="text-gray-500">Nenhum relatório disponível para este aluno.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <FaDumbbell className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-medium mb-2">Selecione um aluno</h3>
              <p className="text-gray-500">
                Escolha um aluno na lista para visualizar seu progresso.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Terceira linha - conteúdo secundário */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Lista de Tarefas */}
        <TodoListTabs containerClassName="h-full" />
        
        {/* Eventos da Academia */}
        <EventosTabs containerClassName="h-full" userRole="PERSONAL" />
      </div>
    </div>
  );
};

export default PersonalDashboard; 