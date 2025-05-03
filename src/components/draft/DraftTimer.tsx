import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface DraftTimerProps {
  pickTimeSeconds: number;
  onTimeExpired?: () => void;
  isPaused?: boolean;
}

export const DraftTimer: React.FC<DraftTimerProps> = ({ 
  pickTimeSeconds, 
  onTimeExpired,
  isPaused = false
}) => {
  const [timeLeft, setTimeLeft] = useState(pickTimeSeconds);
  const [isRunning, setIsRunning] = useState(!isPaused);
  
  useEffect(() => {
    // Reset timer when pick time changes
    setTimeLeft(pickTimeSeconds);
    setIsRunning(!isPaused);
  }, [pickTimeSeconds, isPaused]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            clearInterval(timer);
            if (onTimeExpired) onTimeExpired();
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, onTimeExpired]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Get color based on time left
  const getColorClass = (): string => {
    const percentage = (timeLeft / pickTimeSeconds) * 100;
    
    if (percentage > 50) return 'text-green-600';
    if (percentage > 25) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm">
      <Clock size={18} className={getColorClass()} />
      <span className={`font-mono font-medium ${getColorClass()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
};