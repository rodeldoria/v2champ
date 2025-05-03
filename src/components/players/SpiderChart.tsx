import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { Player } from '../../types/sleeper';
import { calculateAttributes } from '../../services/playerRatingService';

interface SpiderChartProps {
  player: Player;
  stats?: Record<string, number>;
  colors?: {
    fill: string;
    stroke: string;
  };
}

export const SpiderChart: React.FC<SpiderChartProps> = ({
  player,
  stats,
  colors = {
    fill: 'rgba(99, 102, 241, 0.2)',
    stroke: 'rgb(99, 102, 241)'
  }
}) => {
  const attributes = calculateAttributes(player, stats);
  const isDefensive = ['DEF', 'DL', 'LB', 'DB'].includes(player.position || '');

  // Get position-specific attributes
  const getPositionAttributes = () => {
    switch (player.position) {
      case 'QB':
        return {
          arm: attributes.arm || 0,
          accuracy: attributes.accuracy || 0,
          awareness: attributes.awareness || 0,
          agility: attributes.agility || 0,
          decision: attributes.awareness || 75, // Use awareness or default
          pocket: attributes.agility || 75 // Use agility or default
        };
      case 'RB':
        return {
          speed: attributes.speed || 0,
          agility: attributes.agility || 0,
          power: attributes.power || 0,
          vision: attributes.vision || 0,
          hands: attributes.hands || 75, // Default if not available
          blocking: attributes.blocking || 75 // Default if not available
        };
      case 'WR':
        return {
          speed: attributes.speed || 0,
          hands: attributes.hands || 0,
          route: attributes.route || 0,
          separation: attributes.separation || 0,
          yac: attributes.speed || 75, // Use speed as proxy or default
          blocking: attributes.blocking || 75 // Default if not available
        };
      case 'TE':
        return {
          speed: attributes.speed || 0,
          hands: attributes.hands || 0,
          route: attributes.route || 0,
          blocking: attributes.blocking || 0,
          yac: attributes.speed || 75, // Use speed as proxy or default
          redzone: attributes.hands || 75 // Use hands as proxy or default
        };
      default:
        return attributes;
    }
  };

  const positionAttributes = getPositionAttributes();

  // Transform attributes for Recharts
  const chartData = Object.entries(positionAttributes).map(([key, value]) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    A: value,
    fullMark: 99
  }));

  // Calculate overall rating
  const overall = Math.round(
    Object.values(positionAttributes).reduce((sum, val) => sum + val, 0) / 
    Object.values(positionAttributes).length
  );

  // Custom label component for the center
  const CenterLabel = ({ viewBox }: { viewBox?: { cx: number; cy: number } }) => {
    if (!viewBox) return null;
    return (
      <g>
        <text
          x={viewBox.cx}
          y={viewBox.cy - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-4xl font-bold fill-gray-800"
        >
          {overall}
        </text>
        <text
          x={viewBox.cx}
          y={viewBox.cy + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm fill-gray-500"
        >
          {isDefensive ? 'DEF' : 'OVR'}
        </text>
      </g>
    );
  };

  // Get position-specific colors
  const getPositionColors = () => {
    switch (player.position) {
      case 'QB':
        return { fill: 'rgba(239, 68, 68, 0.2)', stroke: 'rgb(239, 68, 68)' }; // Red
      case 'RB':
        return { fill: 'rgba(59, 130, 246, 0.2)', stroke: 'rgb(59, 130, 246)' }; // Blue
      case 'WR':
        return { fill: 'rgba(34, 197, 94, 0.2)', stroke: 'rgb(34, 197, 94)' }; // Green
      case 'TE':
        return { fill: 'rgba(168, 85, 247, 0.2)', stroke: 'rgb(168, 85, 247)' }; // Purple
      default:
        return { fill: 'rgba(99, 102, 241, 0.2)', stroke: 'rgb(99, 102, 241)' }; // Default primary
    }
  };

  const positionColors = getPositionColors();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
        <PolarGrid stroke="rgba(0,0,0,0.1)" />
        <PolarAngleAxis 
          dataKey="subject"
          tick={{ fill: '#4B5563', fontSize: 12 }}
          axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 99]} 
          tick={{ fill: '#4B5563', fontSize: 10 }}
          axisLine={{ stroke: 'rgba(0,0,0,0.1)' }}
        />
        <Radar
          name="Player"
          dataKey="A"
          stroke={positionColors.stroke}
          fill={positionColors.fill}
          fillOpacity={0.6}
        />
        <CenterLabel />
      </RadarChart>
    </ResponsiveContainer>
  );
};