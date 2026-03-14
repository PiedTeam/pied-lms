/**
 * @domain hooks
 * @description Exam timer hook types and interfaces
 */

/**
 * Props for the useExamTimer hook
 */
export interface UseExamTimerProps {
  roomId: string;
  onTimeUp: () => void;
}
