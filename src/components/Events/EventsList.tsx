import { FC } from 'react';
import {FaClock } from 'react-icons/fa';

interface Event {
  title: string;
  location: string;
  date: {
    day: number;
    month: string;
  };
  time: string;
}

interface EventsListProps {
  events: Event[];
}

const EventsList: FC<EventsListProps> = () => {
  const events: Event[] = [
    {
      title: 'Retiro Fitness',
      location: 'Casemates du Bock',
      date: { day: 30, month: 'Sáb' },
      time: '16:30'
    },
    {
      title: 'Aulas de Zumba',
      location: 'Barcelona',
      date: { day: 28, month: 'Seg' },
      time: '17:30'
    },
    {
      title: 'Caminhada em Grupo',
      location: 'Paris',
      date: { day: 23, month: 'Qua' },
      time: '20:30'
    }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Próximos Eventos</h2>
      <div className="space-y-6">
        {events.map((event, index) => (
          <div key={index} className="flex items-center space-x-6 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all cursor-pointer transform hover:scale-[1.02]">
            <div className="flex-shrink-0 w-16 h-16 bg-red-600 rounded-xl flex flex-col items-center justify-center text-white shadow-md">
              <span className="text-2xl font-bold">{event.date.day}</span>
              <span className="text-sm">{event.date.month}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                
                <div className="flex items-center space-x-2">
                  <FaClock className="w-4 h-4 text-red-500" />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsList;