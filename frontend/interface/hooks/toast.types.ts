/**
 * @domain hooks
 * @description Toast notification types and interfaces
 */

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

/**
 * Represents a single toast notification
 */
export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

/**
 * Action types for toast state management
 */
export const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

/**
 * Type for action type constants
 */
export type ActionType = typeof actionTypes;

/**
 * Union type for all possible toast actions
 */
export type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

/**
 * Toast state interface
 */
export interface State {
  toasts: ToasterToast[];
}

/**
 * Toast type (without id, used for creating new toasts)
 */
export type Toast = Omit<ToasterToast, "id">;
