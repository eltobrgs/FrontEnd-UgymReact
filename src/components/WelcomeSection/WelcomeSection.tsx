import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface WelcomeSectionProps {
  userName: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName }) => {
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const [daysState, setDaysState] = useState<{ [key: string]: number[] }>({});
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    // Carregar o estado dos dias do localStorage
    const storedDays = localStorage.getItem('daysState');
    if (storedDays) {
      setDaysState(JSON.parse(storedDays));
    } else {
      // Inicializa o estado com os dias neutros (0) para o mês atual
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
      setDaysState({ [monthKey]: Array(daysInMonth.length).fill(0) });
    }
  }, [currentDate]);

  const handleDayClick = (day: number) => {
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const newDaysState = { ...daysState };

    // Verifica se o mês atual já existe no estado
    if (!newDaysState[monthKey]) {
      const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
      newDaysState[monthKey] = Array(daysInMonth.length).fill(0);
    }

    Swal.fire({
      title: 'Você foi?',
      text: "Escolha uma opção:",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Foi',
      cancelButtonText: 'Não Foi'
    }).then((result) => {
      if (result.isConfirmed) {
        // Atualiza o estado do dia para verde (1)
        newDaysState[monthKey][day - 1] = 1;
      } else if (result.isDismissed) {
        // Atualiza o estado do dia para vermelho (2)
        newDaysState[monthKey][day - 1] = 2;
      }

      setDaysState(newDaysState);
      localStorage.setItem('daysState', JSON.stringify(newDaysState));
    });
  };

  const resetDays = () => {
    const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
    const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const resetState = { ...daysState, [monthKey]: Array(daysInMonth.length).fill(0) };
    setDaysState(resetState);
    localStorage.setItem('daysState', JSON.stringify(resetState));
  };

  const changeMonth = (increment: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const getDaysInMonth = (year: number, month: number) => {
    const lastDayOfMonth = new Date(year, month + 1, 0);
    return Array.from({ length: lastDayOfMonth.getDate() }, (_, i) => i + 1);
  };

  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
  const currentDaysState = daysState[monthKey] || Array(daysInMonth.length).fill(0);

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-8 text-white shadow-lg transform hover:scale-[1.02] transition-transform relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-2xl font-semibold text-gray-200">Bom Trabalho,</h2>
        <h1 className="text-4xl font-bold text-white">{userName}</h1>
        <p className="mt-2 text-gray-200">Aqui está seu progresso de treino para este mês.</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => changeMonth(-1)}
          className="text-gray-600 hover:text-indigo-600"
        >
          &lt; Mês Anterior
        </button>
        <span className="text-lg font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button
          onClick={() => changeMonth(1)}
          className="text-gray-600 hover:text-indigo-600"
        >
          Próximo Mês &gt;
        </button>
      </div>

      <div className="mt-8 grid grid-cols-7 gap-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-gray-200 font-medium">
            {day}
          </div>
        ))}
        {daysInMonth.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDayClick(day)}
            className={`p-2 rounded-full ${
              currentDaysState[day - 1] === 1 ? 'bg-green-500' : currentDaysState[day - 1] === 2 ? 'bg-red-500' : 'bg-gray-600'
            } font-medium transition-colors`}
          >
            {day}
          </button>
        ))}
      </div>

      <button
        onClick={resetDays}
        className="mt-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
      >
        Reset
      </button>
    </div>
  );
};