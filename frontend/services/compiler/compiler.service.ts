import { axiosGeneral as axios } from "@/common/axios";
import type {
  CompileCodeRequest,
  CompileCodeResponse,
  JudgeCodeRequest,
  JudgeCodeResponse,
  JudgeCodeFromFileRequest,
  CompilerApiResponse,
} from "@/interface/compiler/compiler.interface";

// Compile and run code with optional input
export const compileCode = async (
  request: CompileCodeRequest,
): Promise<CompilerApiResponse<CompileCodeResponse>> => {
  const response = await axios.post<CompilerApiResponse<CompileCodeResponse>>(
    "/compiler/compile",
    request,
  );
  return response.data;
};

// Judge code with multiple test cases
export const judgeCode = async (
  request: JudgeCodeRequest,
): Promise<CompilerApiResponse<JudgeCodeResponse>> => {
  const response = await axios.post<CompilerApiResponse<JudgeCodeResponse>>(
    "/compiler/judge",
    request,
  );
  return response.data;
};

// Judge code with test cases from file system (based on examId)
export const judgeCodeFromFile = async (
  request: JudgeCodeFromFileRequest,
): Promise<CompilerApiResponse<JudgeCodeResponse>> => {
  const response = await axios.post<CompilerApiResponse<JudgeCodeResponse>>(
    "/compiler/judge-from-file",
    request,
  );
  return response.data;
};
