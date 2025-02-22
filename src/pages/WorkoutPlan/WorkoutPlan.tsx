import { FC, useState } from 'react';
import Calendar from '../../components/Calendar/Calendar';
import { WelcomeSection } from '../../components/WelcomeSection/WelcomeSection';  
import ProgressSummary from '../../components/ProgressSummary/ProgressSummary';

interface WorkoutPlanProps {
  userName: string;
}

const WorkoutPlan: FC<WorkoutPlanProps> = ({ userName }) => {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate()); // Dia do mês selecionado

  // Dados fictícios para os exercícios de cada dia da semana
  const exercisesData = {
    0: [ // Domingo
      { name: 'Rest Day', sets: 0, time: '0 Min', status: 'completed', image: 'https://via.placeholder.com/150' },
    ],
    1: [ // Segunda-feira
      { name: 'Forward Lunge', sets: 4, time: '30 Sec', status: 'completed', image: 'https://raw.githubusercontent.com/your-repo/your-images/main/forward-lunge-1.png' },
      { name: 'Push Up', sets: 3, time: '1 Min', status: 'completed', image: 'https://raw.githubusercontent.com/your-repo/your-images/main/push-up.png' },
    ],
    2: [ // Terça-feira
      { name: 'Squat', sets: 4, time: '45 Sec', status: 'inprogress', image: 'https://raw.githubusercontent.com/your-repo/your-images/main/squat.png' },
      { name: 'Plank', sets: 3, time: '1 Min', status: 'not-started', image: 'https://raw.githubusercontent.com/your-repo/your-images/main/plank.png' },
    ],
    3: [ // Quarta-feira
      { name: 'Deadlift', sets: 4, time: '30 Sec', status: 'completed', image: 'https://raw.githubusercontent.com/your-repo/your-images/main/deadlift.png' },
      { name: 'Burpee', sets: 3, time: '1 Min', status: 'completed', image: 'https://raw.githubusercontent.com/your-repo/your-images/main/burpee.png' },
    ],
    4: [ // Quinta-feira
      { name: 'Bench Press', sets: 4, time: '30 Sec', status: 'not-started', image: 'https://raw.githubusercontent.com/your-repo/your-images/main/bench-press.png' },
      { name: 'Mountain Climber', sets: 3, time: '1 Min', status: 'not-started', image: 'https://raw.githubusercontent.com/your-repo/your-images/main/mountain-climber.png' },
    ],
    5: [ // Sexta-feira
      { name: 'Bicep Curl', sets: 4, time: '30 Sec', status: 'inprogress', image: 'https://raw.githubusercontent.com/your-repo/your-images/main/bicep-curl.png' },
      { name: 'Tricep Dip', sets: 3, time: '1 Min', status: 'completed', image: 'https://raw.githubusercontent.com/your-repo/your-images/main/tricep-dip.png' },
    ],
    6: [ // Sábado
      { name: 'Yoga', sets: 1, time: '30 Min', status: 'not-started', image: 'https://via.placeholder.com/150' },
    ],
  };

  // Obtém o dia da semana (0-6) com base no dia do mês selecionado
  const getDayOfWeek = (day: number) => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    return new Date(year, month, day).getDay();
  };

  const selectedDayOfWeek = getDayOfWeek(selectedDay); // Dia da semana do dia selecionado

  return (
    <div className="p-4 md:p-8 bg-gray-100 fade-in w-full overflow-x-hidden space-y-12">
      <WelcomeSection userName={userName} />

      {/* Calendar Component */}
      <Calendar onDayClick={setSelectedDay} selectedDay={selectedDay} />

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercisesData[selectedDayOfWeek as keyof typeof exercisesData]?.map((exercise, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all transform hover:scale-[1.02]"
          >
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <img
                src={exercise.image}
                alt={exercise.name}
                className="rounded-lg object-cover w-full h-48"
              />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-gray-600">Séries - {exercise.sets}</p>
              <p className="text-sm text-gray-600">Tempo - {exercise.time}</p>
            </div>
            <div className="mt-4">
              <div
                className={`h-2 rounded-full ${
                  exercise.status === 'completed'
                    ? 'bg-teal-500'
                    : exercise.status === 'inprogress'
                    ? 'bg-indigo-500'
                    : 'bg-gray-200'
                }`}
              />
              <p className="mt-2 text-sm capitalize text-gray-600">
                {exercise.status.replace('-', ' ')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <ProgressSummary />
    </div>
  );
};

export default WorkoutPlan; 