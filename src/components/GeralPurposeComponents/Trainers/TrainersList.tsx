import { FC } from 'react';
import { FaStar, FaChevronRight } from 'react-icons/fa';

interface Trainer {
  name: string;
  image: string;
  rating: number;
}

interface TrainersListProps {
  trainers: Trainer[];
}

const TrainersList: FC<TrainersListProps> = () => {
  const trainers: Trainer[] = [
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
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Treinadores Pessoais</h2>
      <div className="space-y-4">
        {trainers.map((trainer, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
            <div className="flex items-center space-x-4">
              <img src={trainer.image} alt={trainer.name} className="w-14 h-14 rounded-full object-cover shadow-md" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{trainer.name}</h3>
                <div className="flex items-center space-x-1">
                  <FaStar className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-600">{trainer.rating}</span>
                </div>
              </div>
            </div>
            <FaChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainersList;