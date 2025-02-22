import { FC, useState, useEffect } from 'react';

interface CalendarProps {
  onDayClick: (day: number) => void; // Recebe o dia do mês clicado
  selectedDay: number; // Dia do mês selecionado
}

const Calendar: FC<CalendarProps> = ({ onDayClick, selectedDay }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState<number[]>([]);

  useEffect(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = Array.from({ length: lastDayOfMonth.getDate() }, (_, i) => i + 1);

    setDaysInMonth(days);
  }, [currentDate]);

  const handleDayClick = (day: number) => {
    onDayClick(day);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          className="text-gray-600 hover:text-indigo-600"
        >
          &lt;
        </button>
        <span className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
          className="text-gray-600 hover:text-indigo-600"
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-gray-600 font-medium">
            {day}
          </div>
        ))}
        {daysInMonth.map((day) => (
          <button
            key={day}
            onClick={() => handleDayClick(day)}
            className={`p-2 rounded-full ${
              day === selectedDay
                ? 'bg-indigo-600 text-white' // Destaque para o dia clicado
                : isToday(day)
                ? 'border-2 border-indigo-600' // Destaque para o dia atual
                : 'bg-white text-gray-600 hover:bg-gray-50'
            } font-medium transition-colors`}
          >
            {day}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Calendar;