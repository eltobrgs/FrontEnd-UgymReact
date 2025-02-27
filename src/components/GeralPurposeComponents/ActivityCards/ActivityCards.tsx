import React from 'react';

interface Activity {
  icon: React.ElementType;
  title: string;
  value: string;
  avgText: string;
}

interface ActivityCardsProps {
  activities: Activity[];
}

const ActivityCards: React.FC<ActivityCardsProps> = ({ activities }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {activities.map((activity, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-sm activity-card hover:shadow-lg transform hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-4">
            <activity.icon className="w-8 h-8 text-red-600" />
            <div className="text-sm text-gray-500">{activity.title}</div>
          </div>
          <div className="text-xl font-semibold text-gray-900 mb-2">{activity.value}</div>
          <div className="text-sm text-gray-500">{activity.avgText}</div>
        </div>
      ))}
    </div>
  );
};

export default ActivityCards; 