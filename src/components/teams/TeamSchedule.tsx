import React from 'react';
import { Calendar, MapPin } from 'lucide-react';

interface Game {
  week: number;
  opponent: string;
  date: string;
  location: 'Home' | 'Away';
  result?: string;
}

interface TeamScheduleProps {
  schedule: Game[];
  currentWeek: number;
}

export const TeamSchedule: React.FC<TeamScheduleProps> = ({ schedule, currentWeek }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">Season Schedule</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {schedule.map((game) => (
          <div 
            key={`game-${game.week}`}
            className={`p-4 hover:bg-gray-50 transition-colors ${
              game.week === currentWeek ? 'bg-primary-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  game.week === currentWeek 
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {game.week}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{game.opponent}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar size={14} className="mr-1" />
                    <span>{game.date}</span>
                    <MapPin size={14} className="ml-3 mr-1" />
                    <span>{game.location}</span>
                  </div>
                </div>
              </div>
              
              {game.result && (
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-800">{game.result}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};