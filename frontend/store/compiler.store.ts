import { create } from "zustand";
import type { CompilerState } from "@/interface/store/compiler.types";

const DEFAULT_CODE = `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`;

export const useCompilerStore = create<CompilerState>((set) => ({
  code: DEFAULT_CODE,
  output: "",
  error: "",
  isLoading: false,
  setCode: (code: string): void => set({ code }),
  setOutput: (output: string): void => set({ output, error: "" }),
  setError: (error: string): void => set({ error, output: "" }),
  setIsLoading: (isLoading: boolean): void => set({ isLoading }),
  reset: (): void =>
    set({
      code: DEFAULT_CODE,
      output: "",
      error: "",
      isLoading: false,
    }),
}));
