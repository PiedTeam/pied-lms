"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Play, CheckCircle, XCircle, Clock, HardDrive } from "lucide-react";
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
import { TESTCASE_MESSAGES } from "@/constants/messages.constants";
import type {
  TestCaseResponse,
  RunTestCaseResponse,
} from "@/interface/testcase/testcase.interface";

interface RunTestCaseFormData {
  code: string;
  language: "python" | "java" | "cpp" | "javascript";
}

interface TestCaseRunnerProps {
  testCase: TestCaseResponse;
  onClose: () => void;
}

export function TestCaseRunner({ testCase, onClose }: TestCaseRunnerProps) {
  const { toast } = useToast();
  const [result, setResult] = useState<RunTestCaseResponse | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const { mutate: runTestCase } = useRunTestCase();

  const form = useForm<RunTestCaseFormData>({
    defaultValues: {
      code: "",
      language: "python",
    },
  });

  const onSubmit = (data: RunTestCaseFormData) => {
    // Basic validation
    if (!data.code.trim()) {
      toast({
        title: "Lỗi",
        description: TESTCASE_MESSAGES.VALIDATION.CODE_REQUIRED,
        variant: "destructive",
      });
      return;
    }

    if (!data.language) {
      toast({
        title: "Lỗi",
        description: TESTCASE_MESSAGES.VALIDATION.LANGUAGE_REQUIRED,
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setResult(null);

    runTestCase(
      {
        id: testCase.id,
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
      },
    );
  };

  const formatTime = (ms: number) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${ms}ms`;
  };

  const formatMemory = (mb: number) => {
    return `${mb.toFixed(2)}MB`;
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
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="java">Java</SelectItem>
                    <SelectItem value="cpp">C++</SelectItem>
                    <SelectItem value="javascript">JavaScript</SelectItem>
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
              {result.passed ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Test Passed
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Test Failed
                </>
              )}
              <Badge variant={result.passed ? "default" : "destructive"}>
                {result.passed ? "PASS" : "FAIL"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Execution Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Execution Time: {formatTime(result.executionTime)}
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="h-4 w-4" />
                Memory Used: {formatMemory(result.memoryUsed)}
              </div>
            </div>

            <Separator />

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

            {/* Error Message */}
            {result.error && (
              <div>
                <h4 className="font-medium mb-2 text-red-700">Error:</h4>
                <pre className="bg-red-50 border border-red-200 p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-32 overflow-auto">
                  {result.error}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
