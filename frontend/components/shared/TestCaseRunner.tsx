"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Play, CheckCircle, XCircle, Clock } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRunTestCase } from "@/service";
import { TESTCASE_MESSAGES, COMPILER_MESSAGES } from "@/constants/messages";
import { useCompileCode } from "@/service";
import type {
  TestCaseResponse,
  RunTestCaseResponse,
} from "@/interface/testcase/testcase.interface";
import type { CompileCodeResponse } from "@/interface/compiler/compiler.interface";

interface RunTestCaseFormData {
  code: string;
  language: "c" | "python" | "java" | "cpp" | "javascript";
}

interface TestCaseRunnerProps {
  testCase: TestCaseResponse;
  onClose: () => void;
}

export function TestCaseRunner({ testCase, onClose }: TestCaseRunnerProps) {
  const { toast } = useToast();
  const [result, setResult] = useState<CompileCodeResponse | null>(null);
  const [testInput, setTestInput] = useState("");

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
    },
  });

  const onSubmit = (data: RunTestCaseFormData) => {
    // Basic validation
    if (!data.code.trim()) {
      toast({
        title: "Lỗi",
        description: COMPILER_MESSAGES.VALIDATION.CODE_REQUIRED,
        variant: "destructive",
      });
      return;
    }

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
        variant: "destructive",
      });
      return;
    }

    setResult(null);

    toast({
      title: COMPILER_MESSAGES.INFO.COMPILING,
      description: COMPILER_MESSAGES.INFO.EXECUTING,
    });

    // Use compile API with user input
    compileCode(
      {
        code: data.code,
        input: testInput,
        timeLimit: 2000,
        memoryLimit: 128,
        optimizationLevel: 2,
      },
      {
        onSuccess: (response) => {
          if (response.data) {
            setResult(response.data);

            if (response.data.success) {
              toast({
                title: COMPILER_MESSAGES.SUCCESS.EXECUTED,
                description: `Execution time: ${response.data.executionTime}ms`,
              });
            } else {
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
          toast({
            title: "Network Error",
            description: error.message || "Could not connect to server",
            variant: "destructive",
          });
        },
      },
    );
  };

  const formatTime = (ms: number | null) => {
    if (!ms) return "N/A";
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms}ms`;
  };

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

          <div className="space-y-2">
            <Label htmlFor="testInput">Test Input</Label>
            <Textarea
              id="testInput"
              placeholder="Enter test input here..."
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="min-h-[100px] font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Enter the input data for testing your code
            </p>
          </div>

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
              {result.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Execution Successful
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Execution Failed
                </>
              )}
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "SUCCESS" : "FAILED"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Execution Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Compilation Time: {formatTime(result.compilationTime)}
              </div>
              {result.executionTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Execution Time: {formatTime(result.executionTime)}
                </div>
              )}
            </div>

            <Separator />

            {/* Output */}
            {result.output && (
              <div>
                <h4 className="font-medium mb-2 text-green-700">Output:</h4>
                <pre className="bg-green-50 border border-green-200 p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-40 overflow-auto">
                  {result.output}
                </pre>
              </div>
            )}

            {/* Error Message */}
            {result.error && (
              <div>
                <h4 className="font-medium mb-2 text-red-700">
                  Error ({result.errorCode}):
                </h4>
                <pre className="bg-red-50 border border-red-200 p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                  {result.error}
                </pre>
              </div>
            )}

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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
