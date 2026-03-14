/**
 * @domain components
 * @description UI component prop interfaces
 */

/**
 * Props for the RoomCard component
 */
export interface RoomCardProps {
  roomId: string;
  roomUuid?: string;
  roomName: string;
  creatorName?: string;
  creatorEmail?: string;
  openTime: string;
  openDate: string;
  closeTime: string;
  closeDate: string;
  className?: string;
}

/**
 * Props for the DateTimePicker component
 */
export interface DateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
