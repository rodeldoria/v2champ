import React from 'react';

interface StatListProps {
  title: string;
  data: Record<string, number>;
}

export const StatList: React.FC<StatListProps> = ({ title, data }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="bg-gray-50 rounded-lg p-3">
            <span className="text-sm text-gray-500">{key.replace(/_/g, ' ').toUpperCase()}</span>
            <div className="text-lg font-semibold text-gray-800">{value.toFixed(1)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};