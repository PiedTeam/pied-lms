/**
 * @domain store
 * @description Compiler store types and interfaces
 */

/**
 * Compiler store state interface
 * Manages code compilation state, output, and related operations
 */
export interface CompilerState {
  code: string;
  output: string;
  error: string;
  isLoading: boolean;
  setCode: (code: string) => void;
  setOutput: (output: string) => void;
  setError: (error: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  reset: () => void;
}
