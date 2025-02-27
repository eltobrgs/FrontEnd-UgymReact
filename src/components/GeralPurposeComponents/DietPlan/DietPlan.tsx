import { FC } from 'react';
import { FaStar } from 'react-icons/fa';

interface MealPlan {
  title: string;
  by: string;
  calories: number;
  image: string;
}

interface DietPlanProps {
  meals: MealPlan[];
}

const DietPlan: FC<DietPlanProps> = () => {
  const meals: MealPlan[] = [
    {
      title: 'Steak and Eggs',
      by: 'Freddy Swanson',
      calories: 210,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&h=500&fit=crop'
    },
    {
      title: 'Lean Beef Burger',
      by: 'Freddy Swanson',
      calories: 320,
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&h=500&fit=crop'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">Meu Plano Alimentar</h2>
        <p className="text-sm text-gray-500 leading-relaxed">Nosso especialista em nutrição preparou para você um plano de refeições balanceado para cada dia.</p>
      </div>

      <div className="space-y-6">
        {meals.map((meal, index) => (
          <div key={index} className="flex items-center space-x-6 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
            <img src={meal.image} alt={meal.title} className="w-20 h-20 rounded-xl object-cover shadow-md" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{meal.title}</h3>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-sm text-gray-600">Por: {meal.by}</span>
                <FaStar className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="text-sm font-medium text-red-600">{meal.calories} calorias</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DietPlan;