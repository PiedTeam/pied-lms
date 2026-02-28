"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
<<<<<<< HEAD
import { Play, CheckCircle, XCircle, Clock, HardDrive } from "lucide-react";
=======
import { Play, CheckCircle, XCircle, Clock } from "lucide-react";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRunTestCase } from "@/service";
<<<<<<< HEAD
import { TESTCASE_MESSAGES } from "@/constants/messages.constants";
=======
import { TESTCASE_MESSAGES, COMPILER_MESSAGES } from "@/constants/messages";
import { useCompileCode } from "@/service";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
import type {
  TestCaseResponse,
  RunTestCaseResponse,
} from "@/interface/testcase/testcase.interface";
<<<<<<< HEAD

interface RunTestCaseFormData {
  code: string;
  language: "python" | "java" | "cpp" | "javascript";
=======
import type { CompileCodeResponse } from "@/interface/compiler/compiler.interface";

interface RunTestCaseFormData {
  code: string;
  language: "c" | "python" | "java" | "cpp" | "javascript";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
}

interface TestCaseRunnerProps {
  testCase: TestCaseResponse;
  onClose: () => void;
}

export function TestCaseRunner({ testCase, onClose }: TestCaseRunnerProps) {
  const { toast } = useToast();
<<<<<<< HEAD
  const [result, setResult] = useState<RunTestCaseResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const { mutate: runTestCase } = useRunTestCase();

  const form = useForm<RunTestCaseFormData>({
    defaultValues: {
      code: "",
      language: "python",
=======
  const [result, setResult] = useState<CompileCodeResponse | null>(null);

  const { mutate: compileCode, isPending: isRunning } = useCompileCode();

  const form = useForm<RunTestCaseFormData>({
    defaultValues: {
      code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your code here
    
    return 0;
}`,
      language: "c",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
    },
  });

  const onSubmit = (data: RunTestCaseFormData) => {
    // Basic validation
    if (!data.code.trim()) {
      toast({
        title: "Lỗi",
<<<<<<< HEAD
        description: TESTCASE_MESSAGES.VALIDATION.CODE_REQUIRED,
=======
        description: COMPILER_MESSAGES.VALIDATION.CODE_REQUIRED,
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        variant: "destructive",
      });
      return;
    }

<<<<<<< HEAD
    if (!data.language) {
      toast({
        title: "Lỗi",
        description: TESTCASE_MESSAGES.VALIDATION.LANGUAGE_REQUIRED,
=======
    if (data.code.trim().length < 10) {
      toast({
        title: "Lỗi",
        description: COMPILER_MESSAGES.VALIDATION.CODE_MIN_LENGTH,
        variant: "destructive",
      });
      return;
    }

    // Only support C language for now
    if (data.language !== "c") {
      toast({
        title: "Lỗi",
        description: "Hiện tại chỉ hỗ trợ ngôn ngữ C",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        variant: "destructive",
      });
      return;
    }

<<<<<<< HEAD
    setIsRunning(true);
    setResult(null);

    runTestCase(
      {
        id: testCase.testCaseId,
        payload: {
          code: data.code,
          language: data.language,
        },
      },
      {
        onSuccess: (response) => {
          setResult(response);
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi thực thi",
            description: error.message,
            variant: "destructive",
          });
        },
        onSettled: () => {
          setIsRunning(false);
        },
=======
    setResult(null);

    toast({
      title: COMPILER_MESSAGES.INFO.COMPILING,
      description: COMPILER_MESSAGES.INFO.EXECUTING,
    });

    // Read input from testCase.inputPath (this should be the actual input content)
    // For now, we'll use empty string as input since we don't have the actual file content
    const input = ""; // TODO: Read from file or pass as prop

    compileCode(
      {
        code: data.code,
        input: input,
        timeLimit: 2000, // 2 seconds
        memoryLimit: 128, // 128 MB
        optimizationLevel: 2, // Use number instead of string
      },
      {
        onSuccess: (response) => {
          // Always display response if we have data (status 200)
          if (response.data) {
            setResult(response.data);

            if (response.data.success) {
              toast({
                title: COMPILER_MESSAGES.SUCCESS.EXECUTED,
                description: `Execution time: ${response.data.executionTime}ms`,
              });
            } else {
              // Compilation or runtime error (still status 200)
              toast({
                title: "Compilation/Runtime Error",
                description:
                  response.message || "Check the error details below",
              });
            }
          } else {
            toast({
              title: COMPILER_MESSAGES.ERROR.EXECUTION_FAILED,
              description: response.message || "No response data",
              variant: "destructive",
            });
          }
        },
        onError: (error: Error) => {
          // Only for network errors or non-200 status codes
          toast({
            title: "Network Error",
            description: error.message || "Could not connect to server",
            variant: "destructive",
          });
        },
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
      },
    );
  };

<<<<<<< HEAD
  const formatTime = (ms: number) => {
=======
  const formatTime = (ms: number | null) => {
    if (!ms) return "N/A";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms}ms`;
  };

<<<<<<< HEAD
  const formatMemory = (mb: number) => {
    return `${mb.toFixed(2)}MB`;
  };

=======
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  return (
    <div className="space-y-6">
      {/* Test Case Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Case Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Input Path:</h4>
            <pre className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
              {testCase.inputPath || "No input path"}
            </pre>
          </div>
          <div>
            <h4 className="font-medium mb-2">Output Path:</h4>
            <pre className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
              {testCase.outputPath || "No output path"}
            </pre>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              Index: {testCase.index}
            </div>
            <div className="flex items-center gap-1">
              {testCase.isHidden ? (
                <Badge variant="secondary">Hidden</Badge>
              ) : (
                <Badge variant="outline">Visible</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Input Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Programming Language</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
<<<<<<< HEAD
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
=======
                    <SelectItem value="c">C</SelectItem>
                    <SelectItem value="python" disabled>
                      Python (Coming soon)
                    </SelectItem>
                    <SelectItem value="java" disabled>
                      Java (Coming soon)
                    </SelectItem>
                    <SelectItem value="cpp" disabled>
                      C++ (Coming soon)
                    </SelectItem>
                    <SelectItem value="javascript" disabled>
                      JavaScript (Coming soon)
                    </SelectItem>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Code</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter your code here..."
                    className="min-h-[200px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button type="submit" disabled={isRunning}>
              {isRunning ? (
                <>
                  <Play className="mr-2 h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Test Case
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
<<<<<<< HEAD
              {result.passed ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Test Passed
=======
              {result.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Execution Successful
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
<<<<<<< HEAD
                  Test Failed
                </>
              )}
              <Badge variant={result.passed ? "default" : "destructive"}>
                {result.passed ? "PASS" : "FAIL"}
=======
                  Execution Failed
                </>
              )}
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "SUCCESS" : "FAILED"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Execution Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
<<<<<<< HEAD
                Execution Time: {formatTime(result.executionTime)}
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                Memory Used: {formatMemory(result.memoryUsed)}
              </div>
=======
                Compilation Time: {formatTime(result.compilationTime)}
              </div>
              {result.executionTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Execution Time: {formatTime(result.executionTime)}
                </div>
              )}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </div>

            <Separator />

<<<<<<< HEAD
            {/* Output Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2 text-green-700">
                  Expected Output:
                </h4>
                <pre className="bg-green-50 border border-green-200 p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-40 overflow-auto">
                  {result.expectedOutput || "No expected output"}
                </pre>
              </div>
              <div>
                <h4 className="font-medium mb-2 text-blue-700">Your Output:</h4>
                <pre className="bg-blue-50 border border-blue-200 p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-40 overflow-auto">
                  {result.actualOutput || "No output"}
                </pre>
              </div>
            </div>
=======
            {/* Output */}
            {result.output && (
              <div>
                <h4 className="font-medium mb-2 text-green-700">Output:</h4>
                <pre className="bg-green-50 border border-green-200 p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-40 overflow-auto">
                  {result.output}
                </pre>
              </div>
            )}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd

            {/* Error Message */}
            {result.error && (
              <div>
<<<<<<< HEAD
                <h4 className="font-medium mb-2 text-red-700">Error:</h4>
=======
                <h4 className="font-medium mb-2 text-red-700">
                  Error ({result.errorCode}):
                </h4>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                <pre className="bg-red-50 border border-red-200 p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                  {result.error}
                </pre>
              </div>
            )}
<<<<<<< HEAD
=======

            {/* Error Details */}
            {result.errorDetails && (
              <div>
                <h4 className="font-medium mb-2 text-red-700">
                  Error Details:
                </h4>
                <pre className="bg-red-50 border border-red-200 p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                  {result.errorDetails}
                </pre>
              </div>
            )}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </CardContent>
        </Card>
      )}
    </div>
  );
}
