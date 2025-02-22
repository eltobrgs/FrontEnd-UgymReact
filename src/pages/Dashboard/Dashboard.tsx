import { FC } from 'react';
import { FaBed, FaBiking, FaRunning, FaDumbbell } from 'react-icons/fa';
import DietPlan from '../../components/DietPlan/DietPlan';
import TrainersList from '../../components/Trainers/TrainersList';
import EventsList from '../../components/Events/EventsList';
import { WelcomeSection } from '../../components/WelcomeSection/WelcomeSection';
import StatsSection from '../../components/StatsSection/StatsSection';
import ActivityCards from '../../components/ActivityCards/ActivityCards';
// import ChartsSection from '../../components/ChartsSection/ChartsSection';

interface DashboardProps {
  userName: string;
  stats: {
    steps: number;
    calories: number;
    progress: number;
  };
}

const Dashboard: FC<DashboardProps> = ({ userName, stats }) => {
  const activities = [
    {
      icon: FaBed,
      title: 'Sono',
      value: '8.3 horas na última noite',
      avgText: '8.5hrs em média na última semana'
    },
    {
      icon: FaBiking,
      title: 'Ciclismo',
      value: '3.5 kms hoje',
      avgText: '2.3hrs em média na última semana'
    },
    {
      icon: FaRunning,
      title: 'Corrida',
      value: '2.8 kms hoje',
      avgText: '2.6hrs em média na última semana'
    },
    {
      icon: FaDumbbell,
      title: 'Academia',
      value: '2.6 horas hoje',
      avgText: '3.2hrs em média na última semana'
    },
    
  ];

  // const fitnessData = [
  //   { name: 'Jan', Running: 30, Workout: 45 },
  //   { name: 'Feb', Running: 45, Workout: 35 },
  //   { name: 'Mar', Running: 35, Workout: 65 },
  //   { name: 'Apr', Running: 55, Workout: 55 },
  //   { name: 'May', Running: 40, Workout: 70 },
  //   { name: 'Jun', Running: 45, Workout: 60 },
  //   { name: 'Jul', Running: 50, Workout: 55 },
  //   { name: 'Aug', Running: 60, Workout: 75 },
  //   { name: 'Sep', Running: 55, Workout: 70 },
  //   { name: 'Oct', Running: 65, Workout: 85 },
  //   { name: 'Nov', Running: 70, Workout: 90 },
  //   { name: 'Dec', Running: 75, Workout: 95 }
  // ];

  // const weightData = [
  //   { month: 'Jan', Weight: 78 },
  //   { month: 'Feb', Weight: 77 },
  //   { month: 'Mar', Weight: 76 },
  //   { month: 'Apr', Weight: 76 },
  //   { month: 'May', Weight: 75 },
  //   { month: 'Jun', Weight: 74 },
  //   { month: 'Jul', Weight: 73 },
  //   { month: 'Aug', Weight: 74 },
  //   { month: 'Sep', Weight: 73 },
  //   { month: 'Oct', Weight: 72 },
  //   { month: 'Nov', Weight: 71 },
  //   { month: 'Dec', Weight: 70 }
  // ];

  // Definindo as estatísticas para passar para o StatsSection
  const statsData = [
    {
      image: 'https://images.unsplash.com/photo-1512483652399-7a1f99aa0dd3?w=500&h=500&fit=crop',
      value: stats.steps,
      label: 'Passos',
      gradientFrom: 'from-red-500',
      gradientTo: 'to-red-600',
    },
    {
      image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&h=500&fit=crop',
      value: stats.calories,
      label: 'Calorias',
      gradientFrom: 'from-gray-700',
      gradientTo: 'to-gray-900',
    },
    {
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
      value: stats.progress,
      label: 'Progresso',
      gradientFrom: 'from-red-400',
      gradientTo: 'to-red-500',
    },
  ];

  return (
    <div className="p-4 md:p-8 bg-gray-100 fade-in w-full overflow-x-hidden space-y-12">
      {/* Welcome Section */}
      <WelcomeSection userName={userName} />

      {/* Stats Section */}
      <StatsSection stats={statsData} />

      {/* Activity Cards */}
      <ActivityCards activities={activities} />

      {/* <ChartsSection data={fitnessData} chartType="line" title="Atividade Física" dataKeys={['Running', 'Workout']} />

      <ChartsSection data={weightData} chartType="bar" title="Estatísticas de Peso" dataKeys={['Weight']} /> */}

      {/* Additional Components Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <DietPlan meals={[
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
          ]} />
        </div>
        <div className="lg:col-span-1">
          <TrainersList trainers={[
            {
              name: 'George Bailey',
              image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&h=500&fit=crop',
              rating: 4.8
            },
            {
              name: 'Amelia Bruklin',
              image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=500&fit=crop',
              rating: 4.9
            },
            {
              name: 'Nannie Guerrero',
              image: 'https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&h=500&fit=crop',
              rating: 4.7
            },
            {
              name: 'Daren Andrade',
              image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&h=500&fit=crop',
              rating: 4.9
            }
          ]} />
        </div>
        <div className="lg:col-span-1">
          <EventsList events={[
            {
              title: 'Fitness Retreats',
              location: 'Casemates du Bock',
              date: { day: 30, month: 'Sat' },
              time: '4:30PM'
            },
            {
              title: 'Zumba Tours',
              location: 'Barcelona',
              date: { day: 28, month: 'Mon' },
              time: '5:30PM'
            },
            {
              title: 'Walkathon',
              location: 'Paris',
              date: { day: 23, month: 'Wed' },
              time: '8:30PM'
            }
          ]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;