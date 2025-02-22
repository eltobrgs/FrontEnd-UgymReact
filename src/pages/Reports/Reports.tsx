import { FC } from 'react';
import ChartsSection from '../../components/ChartsSection/ChartsSection';

interface ReportsProps {
  userName: string;
}

const Reports: FC<ReportsProps> = ({ userName }) => {
  // Dados para o gráfico de peso ao longo do tempo
  const weightData = [
    { month: 'Jan', Weight: 78 },
    { month: 'Feb', Weight: 77 },
    { month: 'Mar', Weight: 76 },
    { month: 'Apr', Weight: 76 },
    { month: 'May', Weight: 75 },
    { month: 'Jun', Weight: 74 },
    { month: 'Jul', Weight: 73 },
    { month: 'Aug', Weight: 74 },
    { month: 'Sep', Weight: 73 },
    { month: 'Oct', Weight: 72 },
    { month: 'Nov', Weight: 71 },
    { month: 'Dec', Weight: 70 }
  ];

  // Dados para o gráfico de composição corporal
  const bodyCompositionData = [
    { month: 'Jan', Muscle: 45, Fat: 25, Water: 30 },
    { month: 'Feb', Muscle: 46, Fat: 24, Water: 30 },
    { month: 'Mar', Muscle: 47, Fat: 23, Water: 30 },
    { month: 'Apr', Muscle: 48, Fat: 22, Water: 30 },
    { month: 'May', Muscle: 49, Fat: 21, Water: 30 },
    { month: 'Jun', Muscle: 50, Fat: 20, Water: 30 }
  ];

  // Dados para o gráfico de IMC
  const imcData = [
    { name: 'Abaixo do Peso', value: 15 },
    { name: 'Peso Normal', value: 55 },
    { name: 'Sobrepeso', value: 20 },
    { name: 'Obesidade', value: 10 }
  ];

  // Dados para o gráfico de medidas corporais
  const measurementsData = [
    { month: 'Jan', Braço: 32, Cintura: 80, Quadril: 95 },
    { month: 'Feb', Braço: 33, Cintura: 79, Quadril: 94 },
    { month: 'Mar', Braço: 34, Cintura: 78, Quadril: 93 },
    { month: 'Apr', Braço: 35, Cintura: 77, Quadril: 92 },
    { month: 'May', Braço: 36, Cintura: 76, Quadril: 91 },
    { month: 'Jun', Braço: 37, Cintura: 75, Quadril: 90 }
  ];

  // Novo conjunto de dados para gráfico de radar
  const performanceData = [
    { subject: 'Força', A: 120, B: 110, fullMark: 150 },
    { subject: 'Resistência', A: 98, B: 130, fullMark: 150 },
    { subject: 'Agilidade', A: 86, B: 130, fullMark: 150 },
    { subject: 'Flexibilidade', A: 99, B: 100, fullMark: 150 },
    { subject: 'Velocidade', A: 85, B: 90, fullMark: 150 },
    { subject: 'Equilíbrio', A: 65, B: 85, fullMark: 150 },
  ];

  // Dados para gráfico composto
  const progressData = [
    { month: 'Jan', Peso: 78, Meta: 75, Diferença: 3 },
    { month: 'Feb', Peso: 77, Meta: 74, Diferença: 3 },
    { month: 'Mar', Peso: 76, Meta: 73, Diferença: 3 },
    { month: 'Apr', Peso: 75, Meta: 72, Diferença: 3 },
    { month: 'May', Peso: 74, Meta: 71, Diferença: 3 },
    { month: 'Jun', Peso: 73, Meta: 70, Diferença: 3 },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg mb-8">
        <h1 className="text-3xl font-bold mb-2">Relatórios de Progresso</h1>
        <p className="text-gray-300">Acompanhe sua evolução, {userName}</p>
      </div>

      {/* Grid de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Peso (Linha) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <ChartsSection
            data={weightData}
            chartType="line"
            title="Evolução do Peso"
            dataKeys={['Weight']}
          />
        </div>

        {/* Gráfico de Composição Corporal (Área) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <ChartsSection
            data={bodyCompositionData}
            chartType="area"
            title="Composição Corporal"
            dataKeys={['Muscle', 'Fat', 'Water']}
          />
        </div>

        {/* Gráfico de IMC (Pizza) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <ChartsSection
            data={imcData}
            chartType="pie"
            title="Distribuição de IMC"
            dataKeys={['value']}
          />
        </div>

        {/* Gráfico de Medidas (Barras) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <ChartsSection
            data={measurementsData}
            chartType="bar"
            title="Medidas Corporais"
            dataKeys={['Braço', 'Cintura', 'Quadril']}
          />
        </div>

        {/* Gráfico de Performance (Radar) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <ChartsSection
            data={performanceData}
            chartType="radar"
            title="Análise de Performance"
            dataKeys={['A', 'B']}
          />
        </div>

        {/* Gráfico de Progresso (Composto) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <ChartsSection
            data={progressData}
            chartType="composed"
            title="Progresso vs. Meta"
            dataKeys={['Peso', 'Meta', 'Diferença']}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports; 