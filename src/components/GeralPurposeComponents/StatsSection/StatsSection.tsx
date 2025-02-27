import React from 'react';

interface Stat {
  image: string;
  value: number;
  label: string;
  gradientFrom: string;
  gradientTo: string;
}

interface StatsSectionProps {
  stats: Stat[];
}

const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} rounded-2xl p-6 text-white flex items-center space-x-4 stat-card hover:shadow-xl transform hover:scale-[1.02] transition-all`}
        >
          <img
            src={stat.image}
            alt={stat.label}
            className="w-16 h-16 rounded-full bg-white p-2 shadow-md object-cover"
            loading="lazy"
          />
          <div>
            <div className="text-3xl font-bold animate-pulse">{stat.value}</div>
            <div className="text-sm opacity-90">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsSection; 