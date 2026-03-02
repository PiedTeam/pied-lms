import { useState, useEffect, useCallback } from "react";

interface UseExamTimerProps {
  roomId: string;
  onTimeUp: () => void;
}

export function useExamTimer({ roomId, onTimeUp }: UseExamTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    // Calculate time remaining from room's endTime (stored in localStorage)
    const roomDataStr = localStorage.getItem(`roomData_${roomId}`);
    if (roomDataStr) {
      try {
        const roomData = JSON.parse(roomDataStr);
        const endTime = new Date(roomData.endTime).getTime();
        const now = Date.now();
        return Math.max(0, Math.floor((endTime - now) / 1000));
      } catch (error) {
        console.error("Error parsing room data:", error);
        return 60 * 60; // Fallback to 60 minutes
      }
    }
    return 60 * 60; // Fallback to 60 minutes if no room data
  });

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onTimeUp]);

  return { timeRemaining, formatTime };
}
