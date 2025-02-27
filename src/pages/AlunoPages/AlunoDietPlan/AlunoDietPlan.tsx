import { FC } from 'react';
import { FiSettings } from 'react-icons/fi';
import { FaAppleAlt, FaClock, FaFire, FaWater, FaLeaf } from 'react-icons/fa';
import ChartsSection from '../../../components/GeralPurposeComponents/ChartsSection/ChartsSection';
import Swal from 'sweetalert2';

interface Food {
  name: string;
  amount: string;
  calories: number;
}

interface Meal {
  name: string;
  time: string;
  calories: number;
  foods: Food[];
}

interface AlunoDietPlanProps {
  userName: string;
}

const AlunoDietPlan: FC<AlunoDietPlanProps> = () => {
  // Dados para o gráfico de calorias
  const caloriesData = [
    { hour: '06:00', calories: 0 },
    { hour: '08:00', calories: 450 },
    { hour: '10:00', calories: 650 },
    { hour: '12:00', calories: 1200 },
    { hour: '15:00', calories: 1500 },
    { hour: '18:00', calories: 1700 },
    { hour: '20:00', calories: 2000 },
  ];

  // Dados das refeições
  const meals: Meal[] = [
    {
      name: 'Café da Manhã',
      time: '08:00',
      calories: 450,
      foods: [
        { name: 'Ovos mexidos', amount: '2 unidades', calories: 140 },
        { name: 'Pão integral', amount: '2 fatias', calories: 160 },
        { name: 'Banana', amount: '1 unidade', calories: 105 },
        { name: 'Café com leite', amount: '200ml', calories: 45 },
      ],
    },
    {
      name: 'Almoço',
      time: '12:30',
      calories: 650,
      foods: [
        { name: 'Frango grelhado', amount: '150g', calories: 165 },
        { name: 'Arroz integral', amount: '100g', calories: 111 },
        { name: 'Feijão', amount: '100g', calories: 132 },
        { name: 'Salada', amount: '200g', calories: 242 },
      ],
    },
    {
      name: 'Lanche da Tarde',
      time: '15:00',
      calories: 300,
      foods: [
        { name: 'Iogurte', amount: '200g', calories: 150 },
        { name: 'Granola', amount: '30g', calories: 120 },
        { name: 'Mel', amount: '10g', calories: 30 },
      ],
    },
    {
      name: 'Jantar',
      time: '19:00',
      calories: 600,
      foods: [
        { name: 'Salmão', amount: '150g', calories: 280 },
        { name: 'Batata doce', amount: '150g', calories: 180 },
        { name: 'Legumes', amount: '200g', calories: 140 },
      ],
    },
  ];

  // Dicas nutricionais
  const nutritionTips = [
    { icon: FaWater, text: 'Beba pelo menos 2L de água por dia' },
    { icon: FaLeaf, text: 'Priorize alimentos integrais' },
    { icon: FaClock, text: 'Mantenha um intervalo regular entre as refeições' },
    { icon: FaAppleAlt, text: 'Inclua frutas e vegetais em todas as refeições' },
  ];

  // Função para mostrar os detalhes da refeição
  const showMealDetails = (meal: Meal) => {
    const foodDetails = meal.foods.map((food) => `${food.name} (${food.amount}) - ${food.calories} kcal`).join('<br/>');
    
    Swal.fire({
      title: meal.name,
      html: `
        <strong>Horário:</strong> ${meal.time}<br/>
        <strong>Calorias:</strong> ${meal.calories} kcal<br/>
        <strong>Alimentos:</strong><br/>
        ${foodDetails}
      `,
      icon: 'info',
      confirmButtonText: 'Fechar',
    });
  };

  return (
    <div className="p-4 md:p-8 bg-gray-100 min-h-screen space-y-8">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Plano Alimentar</h1>
            <p className="text-gray-300">Siga seu plano nutricional para alcançar seus objetivos</p>
          </div>
          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <FiSettings size={24} />
          </button>
        </div>
      </div>

      {/* Informações do Plano */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Objetivo Nutricional</h3>
          <p className="text-gray-600">Ganho de massa muscular</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Meta Diária</h3>
          <div className="flex items-center space-x-2">
            <FaFire className="text-red-500" />
            <p className="text-gray-600">2000 kcal</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Progresso Hoje</h3>
          <div className="flex items-center space-x-2">
            <FaFire className="text-red-500" />
            <p className="text-gray-600">1500/2000 kcal</p>
          </div>
        </div>
      </div>

      {/* Gráfico de Calorias */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <ChartsSection
          data={caloriesData}
          chartType="line"
          title="Consumo de Calorias"
          dataKeys={['calories']}
        />
      </div>

      {/* Lista de Refeições */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meals.map((meal, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{meal.name}</h3>
                <div className="flex items-center space-x-2 text-gray-500">
                  <FaClock size={14} />
                  <span>{meal.time}</span>
                </div>
              </div>
              <span className="text-red-500 font-semibold">{meal.calories} kcal</span>
            </div>
            <button 
              onClick={() => showMealDetails(meal)} 
              className="mt-4 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Ver detalhes
            </button>
          </div>
        ))}
      </div>

      {/* Dicas Nutricionais */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Dicas Nutricionais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nutritionTips.map((tip, index) => (
            <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <tip.icon className="text-indigo-600 text-xl" />
              <p className="text-gray-600 text-sm">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Botão Flutuante para Adicionar Refeição */}
      <button className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors">
        <FaAppleAlt size={24} />
      </button>
    </div>
  );
};

export default AlunoDietPlan; 