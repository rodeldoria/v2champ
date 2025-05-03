import React, { useEffect } from 'react';
import { useSleeperStore } from '../store/sleeperStore';
import { TeamSchedule } from '../components/teams/TeamSchedule';
import { fetchMatchups } from '../services/sleeperService';

const Schedule: React.FC = () => {
  const { 
    selectedLeague, 
    currentWeek,
    currentUser,
    matchups,
    teams,
    setMatchups 
  } = useSleeperStore();

  useEffect(() => {
    const loadMatchups = async () => {
      if (selectedLeague?.league_id && currentWeek) {
        try {
          const matchupData = await fetchMatchups(selectedLeague.league_id, currentWeek);
          setMatchups(matchupData);
        } catch (error) {
          console.error('Error loading matchups:', error);
        }
      }
    };

    loadMatchups();
  }, [selectedLeague?.league_id, currentWeek, setMatchups]);

  // Transform matchups into schedule format
  const schedule = matchups.map(matchup => {
    const team1 = teams.find(t => t.roster_id === matchup.roster_id);
    const team2 = teams.find(t => t.roster_id === matchup.matchup_id);

    return {
      week: currentWeek,
      opponent: team2?.settings?.team_name || `Team ${matchup.matchup_id}`,
      date: new Date().toLocaleDateString(), // You may want to add actual dates
      location: team1?.owner_id === currentUser?.user_id ? 'Home' : 'Away',
      result: matchup.points ? `${matchup.points.toFixed(2)} pts` : undefined
    };
  });

  if (!selectedLeague) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No League Selected</h2>
        <p className="text-gray-600">
          Please select a league from the sidebar to view schedule
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Not Logged In</h2>
        <p className="text-gray-600">
          Please log in to view your schedule
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">League Schedule</h1>
        <div className="text-sm text-gray-500">
          Week {currentWeek}
        </div>
      </div>

      {schedule.length > 0 ? (
        <TeamSchedule schedule={schedule} currentWeek={currentWeek} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
          No matchups available for this week
        </div>
      )}
    </div>
  );
};

export default Schedule;