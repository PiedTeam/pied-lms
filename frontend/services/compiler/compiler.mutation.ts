import { useMutation } from "@tanstack/react-query";
import { compileCode, judgeCode, judgeCodeFromFile } from "./compiler.service";
import type {
  CompileCodeRequest,
  JudgeCodeRequest,
  JudgeCodeFromFileRequest,
} from "@/interface/compiler/compiler.interface";

// Compile code mutation
export const useCompileCode = () => {
  return useMutation({
    mutationFn: (request: CompileCodeRequest) => compileCode(request),
  });
};

// Judge code mutation
export const useJudgeCode = () => {
  return useMutation({
    mutationFn: (request: JudgeCodeRequest) => judgeCode(request),
  });
};

// Judge code from file mutation
export const useJudgeCodeFromFile = () => {
  return useMutation({
    mutationFn: (request: JudgeCodeFromFileRequest) =>
      judgeCodeFromFile(request),
  });
};
