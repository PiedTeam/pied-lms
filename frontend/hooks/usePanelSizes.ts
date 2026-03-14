"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface PanelSizes {
  [key: string]: number;
}

interface UsePanelSizesReturn {
  sizes: PanelSizes;
  setSizes: (sizes: PanelSizes) => void;
  resetSizes: () => void;
}

/**
 * Custom hook for managing panel sizes with localStorage persistence.
 * Supports both 2-panel (admin/mentor/teacher) and 3-panel (student) layouts.
 *
 * @param roomId - Unique identifier for the exam room
 * @param defaultSizes - Default panel sizes to use if localStorage is unavailable or invalid
 * @param panelCount - Number of panels (2 or 3)
 * @returns Object containing current sizes, setSizes function, and resetSizes function
 */
export function usePanelSizes(
  roomId: string,
  defaultSizes: PanelSizes,
  panelCount: number = 2,
): UsePanelSizesReturn {
  const [sizes, setSizesState] = useState<PanelSizes>(defaultSizes);
  const initializedRef = useRef(false);

  const storageKey = `exam-room-panel-sizes-${roomId}`;

  /**
   * Validates that sizes are valid numbers between 0-100 and sum to ~100
   */
  const validateSizes = useCallback(
    (data: unknown): boolean => {
      if (!data || typeof data !== "object") return false;

      const values = Object.values(data).filter((v) => typeof v === "number");

      // Check that we have the right number of panels
      if (values.length !== panelCount) return false;

      // Check that all values are between 0-100
      if (!values.every((v) => v >= 0 && v <= 100)) return false;

      // Check that sum equals 100 (with 0.1 tolerance)
      const sum = values.reduce((a, b) => a + b, 0);
      return Math.abs(sum - 100) < 0.1;
    },
    [panelCount],
  );

  /**
   * Saves sizes to localStorage with error handling
   */
  const saveSizesToStorage = useCallback(
    (newSizes: PanelSizes): void => {
      try {
        if (typeof window === "undefined") {
          return;
        }

        if (validateSizes(newSizes)) {
          localStorage.setItem(storageKey, JSON.stringify(newSizes));
        }
      } catch (error) {
        console.warn("Failed to save panel sizes to localStorage:", error);
        // Continue functioning without localStorage
      }
    },
    [storageKey, validateSizes],
  );

  // Load sizes from localStorage on mount only
  useEffect(() => {
    if (initializedRef.current) return;

    try {
      if (typeof window === "undefined") {
        return;
      }

      const stored = localStorage.getItem(storageKey);
      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored);

      if (validateSizes(parsed)) {
        setSizesState(parsed as PanelSizes);
      } else {
        // Invalid data - clear it and use defaults
        try {
          localStorage.removeItem(storageKey);
        } catch (error) {
          console.warn(
            "Failed to clear invalid panel sizes from localStorage:",
            error,
          );
        }
      }
    } catch (error) {
      console.warn("Failed to load panel sizes from localStorage:", error);
    } finally {
      initializedRef.current = true;
    }
  }, [storageKey, validateSizes]);

  /**
   * Updates sizes and saves to localStorage
   */
  const setSizes = useCallback(
    (newSizes: PanelSizes): void => {
      setSizesState(newSizes);
      saveSizesToStorage(newSizes);
    },
    [saveSizesToStorage],
  );

  /**
   * Resets sizes to defaults and clears localStorage
   */
  const resetSizes = useCallback((): void => {
    setSizesState(defaultSizes);
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.warn("Failed to clear panel sizes from localStorage:", error);
    }
  }, [defaultSizes, storageKey]);

  return {
    sizes,
    setSizes,
    resetSizes,
  };
}
