import { FC, useState, useEffect } from 'react';
import { connectionUrl } from '../../config/connection';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';

interface ReportsProps {
  userName: string;
}

interface Report {
  id: number;
  valor: number;
  data: string;
  observacao?: string;
  personal?: string;
}

interface ReportsByType {
  [key: string]: Report[];
}

type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'radar' | 'composed';

const tiposRelatorioPT: Record<string, string> = {
  'peso': 'Peso (kg)',
  'altura': 'Altura (cm)',
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

const Reports: FC<ReportsProps> = ({ userName }) => {
  const { token } = useAuth();
  const [reports, setReports] = useState<ReportsByType>({});
  const [isLoading, setIsLoading] = useState(true);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reports]);

  // Calcular IMC com base nos valores de peso e altura disponíveis
  useEffect(() => {
    if (!reports.peso || !reports.altura || reports.peso.length === 0 || reports.altura.length === 0) {
      return;
    }

    // Criar um mapa de datas de peso para facilitar a busca
    const pesosPorData = new Map<string, number>();
    reports.peso.forEach(report => {
      const data = new Date(report.data).toISOString().split('T')[0];
      pesosPorData.set(data, report.valor);
    });

    // Para cada medida de altura, tentar encontrar um peso correspondente na mesma data
    // ou usar o peso mais próximo anterior para calcular o IMC
    const imcReports: Report[] = [];
    const imcDates = new Set<string>(); // Para evitar duplicatas

    reports.altura.forEach(alturaReport => {
      const alturaData = new Date(alturaReport.data).toISOString().split('T')[0];
      const alturaEmMetros = alturaReport.valor / 100;
      
      // Verificar se há um peso registrado na mesma data
      if (pesosPorData.has(alturaData)) {
        const peso = pesosPorData.get(alturaData)!;
        const imc = peso / (alturaEmMetros * alturaEmMetros);
        
        imcReports.push({
          id: 0, // Será substituído pelo backend
          valor: parseFloat(imc.toFixed(2)),
          data: alturaReport.data,
          observacao: `Calculado automaticamente: Peso ${peso}kg, Altura ${alturaReport.valor}cm`
        });
        
        imcDates.add(alturaData);
      }
    });

    // Adicionar relatórios de IMC para pesos que não têm altura na mesma data
    // (usando a altura mais recente disponível)
    reports.peso.forEach(pesoReport => {
      const pesoData = new Date(pesoReport.data).toISOString().split('T')[0];
      
      // Se já temos um IMC para esta data, pular
      if (imcDates.has(pesoData)) {
        return;
      }
      
      // Encontrar a altura mais recente antes ou igual à data do peso
      const alturasAnteriores = reports.altura
        .filter(a => new Date(a.data) <= new Date(pesoReport.data))
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      
      if (alturasAnteriores.length > 0) {
        const alturaRecente = alturasAnteriores[0];
        const alturaEmMetros = alturaRecente.valor / 100;
        const imc = pesoReport.valor / (alturaEmMetros * alturaEmMetros);
        
        imcReports.push({
          id: 0,
          valor: parseFloat(imc.toFixed(2)),
          data: pesoReport.data,
          observacao: `Calculado automaticamente: Peso ${pesoReport.valor}kg, Altura ${alturaRecente.valor}cm (${formatDate(alturaRecente.data)})`
        });
      }
    });

    // Atualizar os relatórios se houver novos cálculos de IMC
    if (imcReports.length > 0) {
      const updatedReports = { ...reports, IMC: imcReports };
      setReports(updatedReports);
    }
  }, [reports.peso, reports.altura]);

  // Buscar relatórios do aluno
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${connectionUrl}/aluno/meus-reports`, {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        });
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar relatórios: ${response.status}`);
        }
        
        const data = await response.json();
        setReports(data.reports || {});
      } catch (error) {
        console.error('Erro ao buscar relatórios:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erro',
          text: 'Não foi possível carregar seus relatórios.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchReports();
    }
  }, [token]);

  // Formatar dados para os gráficos
  const formatChartData = (reportData: Report[], key: string) => {
    const formattedData = reportData
      .map(report => ({
        date: formatDate(report.data),
        [tiposRelatorioPT[key] || key]: report.valor,
        name: formatDate(report.data) // Para gráficos do tipo pie e radar
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date.split('/').reverse().join('-'));
        const dateB = new Date(b.date.split('/').reverse().join('-'));
        return dateA.getTime() - dateB.getTime();
      });
      
    // Para radar charts, precisamos de uma estrutura específica
    if (chartTypes[key] === 'radar') {
      return formattedData.map(item => ({
        subject: item.date,
        [tiposRelatorioPT[key] || key]: item[tiposRelatorioPT[key] || key]
      }));
    }
    
    return formattedData;
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

  // Alternar exibição do histórico para um tipo específico
  const toggleHistory = (tipo: string) => {
    setExpandedHistories(prev => {
      // Cria uma nova cópia do objeto expandedHistories
      const newExpandedHistories = { ...prev };
      // Muda o estado apenas para o tipo específico
      newExpandedHistories[tipo] = !newExpandedHistories[tipo];
      return newExpandedHistories;
    });
  };

  // Obter contexto adicional para o gráfico de IMC
  const getIMCContext = (imc: number) => {
    if (imc < 18.5) return 'Abaixo do peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidade grau I';
    if (imc < 40) return 'Obesidade grau II';
    return 'Obesidade grau III';
  };

  // Gerar gráficos com base nos dados reais
  const generateCharts = () => {
    if (Object.keys(reports).length === 0) {
      return (
        <div className="col-span-2 bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">Nenhum relatório encontrado</h3>
          <p className="text-gray-500">
            Seu personal trainer ainda não registrou nenhum relatório para você.
          </p>
        </div>
      );
    }

    return Object.entries(reports).map(([tipo, reportData]) => (
      <motion.div 
        key={tipo} 
        className="bg-white rounded-xl shadow-sm p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{tiposRelatorioPT[tipo] || tipo}</h3>
          <button 
            onClick={() => toggleChartType(tipo)}
            className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors text-sm"
          >
            {chartTypeLabels[chartTypes[tipo] || 'line']}
          </button>
        </div>
        
        {/* Indicador de progresso para IMC */}
        {tipo === 'IMC' && reportData.length > 0 && (
          <div className="mb-6">
            {(() => {
              const sortedData = [...reportData].sort((a, b) => 
                new Date(b.data).getTime() - new Date(a.data).getTime()
              );
              const latestIMC = sortedData[0].valor;
              const imcContext = getIMCContext(latestIMC);
              
              // Determinar a cor com base no IMC
              let statusColor = 'bg-green-500';
              if (latestIMC < 18.5 || latestIMC >= 25) statusColor = 'bg-yellow-500';
              if (latestIMC >= 30) statusColor = 'bg-red-500';
              
              return (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Último IMC: {latestIMC.toFixed(2)}</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      latestIMC < 18.5 ? 'bg-blue-100 text-blue-800' :
                      latestIMC < 25 ? 'bg-green-100 text-green-800' :
                      latestIMC < 30 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {imcContext}
                    </span>
                  </div>
                  
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${statusColor}`} 
                      style={{ width: `${Math.min(latestIMC * 2, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>15</span>
                    <span>Normal: 18.5-24.9</span>
                    <span>50</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        
        {chartTypes[tipo] === 'line' ? (
          <div className="h-[300px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={formatChartData(reportData, tipo)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey={tiposRelatorioPT[tipo] || tipo} 
                  stroke="#e53e3e" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : chartTypes[tipo] === 'bar' ? (
          <div className="h-[300px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formatChartData(reportData, tipo)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={tiposRelatorioPT[tipo] || tipo} fill="#e53e3e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : chartTypes[tipo] === 'area' ? (
          <div className="h-[300px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={formatChartData(reportData, tipo)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey={tiposRelatorioPT[tipo] || tipo} 
                  fill="#e53e3e" 
                  stroke="#e53e3e" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : chartTypes[tipo] === 'pie' ? (
          <div className="h-[300px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <Pie 
                  data={formatChartData(reportData, tipo)} 
                  dataKey={tiposRelatorioPT[tipo] || tipo} 
                  nameKey="date" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  fill="#e53e3e"
                  label={entry => entry.date}
                >
                  {formatChartData(reportData, tipo).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={`#${(index * 2 + 5).toString(16)}53e3e`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : chartTypes[tipo] === 'radar' ? (
          <div className="h-[300px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={formatChartData(reportData, tipo)}>
                <PolarGrid />
                <PolarAngleAxis dataKey="date" />
                <PolarRadiusAxis />
                <Radar 
                  name={tiposRelatorioPT[tipo] || tipo} 
                  dataKey={tiposRelatorioPT[tipo] || tipo} 
                  stroke="#e53e3e" 
                  fill="#e53e3e" 
                  fillOpacity={0.6} 
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[300px] mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={formatChartData(reportData, tipo)}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={tiposRelatorioPT[tipo] || tipo} barSize={20} fill="#413ea0" />
                <Line type="monotone" dataKey={tiposRelatorioPT[tipo] || tipo} stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="mt-4">
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observação</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Personal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.map((report) => (
                    <tr key={report.id}>
                      <td className="px-4 py-2 whitespace-nowrap">{formatDate(report.data)}</td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        {report.valor}
                        {tipo === 'IMC' && (
                          <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                            report.valor < 18.5 ? 'bg-blue-100 text-blue-800' :
                            report.valor < 25 ? 'bg-green-100 text-green-800' :
                            report.valor < 30 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {getIMCContext(report.valor)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2">{report.observacao || "-"}</td>
                      <td className="px-4 py-2">{report.personal || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
      </motion.div>
    ));
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">Relatórios de Progresso</h1>
        <p className="text-gray-300">Acompanhe sua evolução, {userName}</p>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="col-span-2 flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
        ) : (
          generateCharts()
        )}
      </div>
    </div>
  );
};

export default Reports; 