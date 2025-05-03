import React from 'react';
import Plot from 'react-plotly.js';
import { Player } from '../../types/sleeper';
import { calculateAttributes } from '../../services/playerRatingService';

interface PlayerPerformanceRadarProps {
  player: Player;
  stats?: Record<string, number>;
  height?: number;
  width?: string;
}

export const PlayerPerformanceRadar: React.FC<PlayerPerformanceRadarProps> = ({
  player,
  stats = {},
  height = 300,
  width = '100%'
}) => {
  // Return null if player or position is not valid
  if (!player || !player.position || !['QB', 'RB', 'WR', 'TE'].includes(player.position)) {
    return null;
  }

  const attributes = calculateAttributes(player, stats);
  
  // Get attributes based on position
  const getPositionAttributes = () => {
    switch (player.position) {
      case 'QB':
        return {
          Arm: attributes.arm || 0,
          Accuracy: attributes.accuracy || 0,
          Awareness: attributes.awareness || 0,
          Agility: attributes.agility || 0,
          Decision: attributes.awareness || 75, // Use awareness or default
          Pocket: attributes.agility || 75 // Use agility or default
        };
      case 'RB':
        return {
          Speed: attributes.speed || 0,
          Agility: attributes.agility || 0,
          Power: attributes.power || 0,
          Vision: attributes.vision || 0,
          Hands: attributes.hands || 75, // Default if not available
          Blocking: attributes.blocking || 75 // Default if not available
        };
      case 'WR':
        return {
          Speed: attributes.speed || 0,
          Hands: attributes.hands || 0,
          Route: attributes.route || 0,
          Separation: attributes.separation || 0,
          YAC: attributes.speed || 75, // Use speed as proxy or default
          Blocking: attributes.blocking || 75 // Default if not available
        };
      case 'TE':
        return {
          Speed: attributes.speed || 0,
          Hands: attributes.hands || 0,
          Route: attributes.route || 0,
          Blocking: attributes.blocking || 0,
          YAC: attributes.speed || 75, // Use speed as proxy or default
          Redzone: attributes.hands || 75 // Use hands as proxy or default
        };
      default:
        return {};
    }
  };

  const positionAttributes = getPositionAttributes();
  
  // Return null if no attributes are available
  if (!Object.keys(positionAttributes).length) {
    return null;
  }
  
  // Convert attributes to arrays for Plotly
  const attributeNames = Object.keys(positionAttributes);
  const attributeValues = Object.values(positionAttributes);
  
  // Add the first value at the end to close the polygon
  const closedAttributeNames = [...attributeNames, attributeNames[0]];
  const closedAttributeValues = [...attributeValues, attributeValues[0]];

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

  const colors = getPositionColors();

  // Calculate overall rating
  const overall = Math.round(
    attributeValues.reduce((sum, val) => sum + val, 0) / attributeValues.length
  );

  return (
    <div style={{ height: `${height}px`, width, maxWidth: '100%' }}>
      <Plot
        data={[
          {
            type: 'scatterpolar',
            r: closedAttributeValues,
            theta: closedAttributeNames,
            fill: 'toself',
            fillcolor: colors.fill,
            line: {
              color: colors.stroke,
              width: 2
            },
            name: player.position
          }
        ]}
        layout={{
          title: {
            text: `Player Rating: ${overall}`,
            font: {
              family: 'Inter, system-ui, sans-serif',
              size: 16
            }
          },
          polar: {
            radialaxis: {
              visible: true,
              range: [0, 100],
              tickfont: {
                size: 10,
                family: 'Inter, system-ui, sans-serif'
              },
              tickvals: [0, 20, 40, 60, 80, 100],
              ticklen: 2,
              gridcolor: 'rgba(0,0,0,0.1)'
            },
            angularaxis: {
              tickfont: {
                size: 12,
                family: 'Inter, system-ui, sans-serif'
              },
              gridcolor: 'rgba(0,0,0,0.1)'
            },
            bgcolor: 'rgba(240, 240, 240, 0.2)'
          },
          showlegend: false,
          margin: {
            l: 30,
            r: 30,
            t: 40,
            b: 20
          },
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: {
            family: 'Inter, system-ui, sans-serif'
          },
          autosize: true
        }}
        config={{
          responsive: true,
          displayModeBar: false
        }}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
};