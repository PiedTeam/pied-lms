"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Send, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";
import { useJudgeCodeFromFile, useCompileCode } from "@/service";
import { useGetExamById } from "@/services";
import { useStartExam } from "@/services/exam-participation/exam-participation.service";
import { COMPILER_MESSAGES } from "@/constants/messages";
import type { TestCaseResult } from "@/interface/compiler/compiler.interface";
import { useAuthStore } from "@/store/auth.store";
import { saveExamScore, type ExamScore } from "@/utils/exam-score.utils";
import { useExamScore } from "@/hooks/use-exam-scores";

interface TestCase {
  examId: string;
  testCaseId: string;
  index: number;
  inputPath: string;
  outputPath: string;
  isHidden: boolean;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  totalMarks: number;
  passingMarks: number;
}

interface JudgeTestCaseResult {
  testCase: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string | null;
  executionTime: number | null;
  error: string | null;
  errorCode: string | null;
}

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const editorRef = useRef<unknown>(null);

  const roomId = params.id as string;
  const examId = params.examId as string;

  // Fetch exam data from API
  const {
    data: examData,
    isLoading: isLoadingExam,
    error: examError,
  } = useGetExamById(examId);

  // Compiler mutation
  const { mutate: judgeCodeFromFile, isPending: isJudging } =
    useJudgeCodeFromFile();
  const { mutate: compileCode, isPending: isCompiling } = useCompileCode();
  const { mutate: startExam } = useStartExam();

  const [exam, setExam] = useState<Exam | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [participationId, setParticipationId] = useState<string | null>(null);
  const [startExamError, setStartExamError] = useState<string | null>(null);
  const [code, setCode] = useState(`#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your code here
    
    return 0;
}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<JudgeTestCaseResult[]>([]);
  const [activeTab, setActiveTab] = useState("question");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [currentScore, setCurrentScore] =
    useState<ReturnType<typeof useExamScore>>(null);

  // Get exam score if already submitted
  const savedScore = useExamScore(roomId, examId);

  // Use currentScore if available, otherwise use savedScore
  const examScore = currentScore || savedScore;

  // Update currentScore when savedScore changes
  useEffect(() => {
    if (savedScore) {
      setCurrentScore(savedScore);
    }
  }, [savedScore]);

  // Load saved code from localStorage and call start exam API on mount
  useEffect(() => {
    // Set exam data from API response
    if (examData) {
      setExam(examData);
    }

    // Load saved code from localStorage
    const savedCode = localStorage.getItem(`exam_code_${roomId}_${examId}`);
    if (savedCode) {
      setCode(savedCode);
    }

    // Get room data (saved by exam room detail page before navigation)
    const roomDataStr = localStorage.getItem(`roomData_${roomId}`);
    let roomCode: string | null = null;
    if (roomDataStr) {
      try {
        const roomData = JSON.parse(roomDataStr);
        const endTime = new Date(roomData.endTime).getTime();
        const now = Date.now();
        const remainingSeconds = Math.max(
          0,
          Math.floor((endTime - now) / 1000),
        );
        setTimeRemaining(remainingSeconds);
        roomCode = roomData.roomCode ?? null;
      } catch (error) {
        console.error("Error parsing room data:", error);
        setTimeRemaining(60 * 60);
      }
    } else {
      setTimeRemaining(60 * 60);
    }

    // Call POST /api/participations/start to create/resume exam participation
    if (roomCode) {
      startExam(
        { roomCode, examId },
        {
          onSuccess: (participation) => {
            setParticipationId(participation.id);
          },
          onError: (error: Error) => {
            setStartExamError(error.message);
          },
        },
      );
    } else {
      setStartExamError("Room code not found. Please go back and try again.");
    }

    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examData, examId, roomId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSaveDraft = useCallback(() => {
    if (!code.trim()) {
      toast({
        title: "No code to save",
        description: "Please write some code before saving",
        variant: "destructive",
      });
      return;
    }

    // Save code to localStorage
    localStorage.setItem(`exam_code_${roomId}_${examId}`, code);

    toast({
      title: "Draft saved",
      description: "Your code has been saved locally",
    });
  }, [code, roomId, examId, toast]);

  const handleSubmit = useCallback(async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write code before submitting",
        variant: "destructive",
      });
      return;
    }

    if (code.trim().length < 10) {
      toast({
        title: COMPILER_MESSAGES.ERROR.CODE_TOO_SHORT,
        description: COMPILER_MESSAGES.VALIDATION.CODE_MIN_LENGTH,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    toast({
      title: "Submitting...",
      description: COMPILER_MESSAGES.INFO.JUDGING,
    });

    if (!participationId) {
      toast({
        title: "Error",
        description: "Exam session not started. Please go back and try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Use judge-from-file API to submit exam
    judgeCodeFromFile(
      {
        code: code,
        examId: examId,
        participationId: participationId,
        timeLimit: 2000,
        memoryLimit: 128,
        optimizationLevel: 2,
      },
      {
        onSuccess: (response) => {
          // Always display response if we have data (status 200)
          if (response.data) {
            const passedCount = response.data.passed;
            const totalCount = response.data.total;
            const allTestsPassed = passedCount === totalCount && totalCount > 0;

            // Clear saved draft after successful submission
            localStorage.removeItem(`exam_code_${roomId}_${examId}`);

            // Always save score (0 if failed, full marks if passed)
            if (exam) {
              const user = useAuthStore.getState().user;
              if (user) {
                const score = allTestsPassed ? exam.totalMarks : 0;

                const newScore = {
                  studentId: user.uuid,
                  examRoomId: roomId,
                  examId: examId,
                  score: score,
                  totalMarks: exam.totalMarks,
                  passedTestCases: passedCount,
                  totalTestCases: totalCount,
                  submittedAt: new Date().toISOString(),
                };

                // Save score to localStorage (will update if exists)
                saveExamScore(newScore);

                // Update current score state to trigger re-render
                setCurrentScore(newScore);

                if (allTestsPassed) {
                  toast({
                    title: "Submitted successfully!",
                    description: `Perfect! You scored ${score}/${exam.totalMarks} points (${passedCount}/${totalCount} test cases passed)`,
                  });
                } else {
                  toast({
                    title: "Submitted",
                    description: `Score: ${score}/${exam.totalMarks} (${passedCount}/${totalCount} test cases passed). Keep practicing!`,
                  });
                }
              }
            }

            // Navigate back to exam room after submission
            setTimeout(() => {
              router.push(`/exam-rooms/${roomId}`);
            }, 2000);
          } else {
            // No data but status 200 (compilation error before judging)
            toast({
              title: "Submission completed with errors",
              description: response.message || "Check your code for errors",
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
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  }, [code, toast, router, roomId, examId, exam, judgeCodeFromFile, participationId]);

  const handleAutoSubmit = useCallback(async () => {
    toast({
      title: "Time is up",
      description: "Your exam has been automatically submitted",
    });

    await handleSubmit();
  }, [toast, handleSubmit]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, handleAutoSubmit]);

  const handleEditorDidMount = (editor: unknown) => {
    editorRef.current = editor;
  };

  const handleTestCode = async () => {
    if (!code.trim()) {
      toast({
        title: COMPILER_MESSAGES.ERROR.NO_CODE,
        description: COMPILER_MESSAGES.VALIDATION.CODE_REQUIRED,
        variant: "destructive",
      });
      return;
    }

    if (code.trim().length < 10) {
      toast({
        title: COMPILER_MESSAGES.ERROR.CODE_TOO_SHORT,
        description: COMPILER_MESSAGES.VALIDATION.CODE_MIN_LENGTH,
        variant: "destructive",
      });
      return;
    }

    setActiveTab("results");
    setTestResults([]); // Clear previous results

    toast({
      title: COMPILER_MESSAGES.INFO.COMPILING,
      description: COMPILER_MESSAGES.INFO.EXECUTING,
    });

    // Use compile API to just compile and run the code
    compileCode(
      {
        code: code,
        input: "", // Empty input for simple test
        timeLimit: 2000, // 2 seconds
        memoryLimit: 128, // 128 MB
        optimizationLevel: 2, // Use number instead of string
      },
      {
        onSuccess: (response) => {
          // Always display response if we have data (status 200)
          // Backend returns status 200 even for compilation/runtime errors
          if (response.data) {
            if (response.data.success) {
              // Compilation and execution successful
              toast({
                title: COMPILER_MESSAGES.SUCCESS.EXECUTED,
                description: `Compilation: ${response.data.compilationTime}ms, Execution: ${response.data.executionTime}ms`,
              });

              // Create a mock test result to display the output
              const mockResult: JudgeTestCaseResult = {
                testCase: 1,
                passed: true,
                input: "",
                expectedOutput: "Code compiled and ran successfully",
                actualOutput: response.data.output || "No output",
                executionTime: response.data.executionTime,
                error: null,
                errorCode: null,
              };

              setTestResults([mockResult]);
            } else {
              // Compilation or runtime error (still status 200)
              // Display error in UI, not as toast error
              toast({
                title: "Compilation/Runtime Error",
                description:
                  response.message || "Check the error details below",
              });

              // Create error result to display in UI
              const errorResult: JudgeTestCaseResult = {
                testCase: 1,
                passed: false,
                input: "",
                expectedOutput: "",
                actualOutput: null,
                executionTime: response.data.executionTime,
                error:
                  response.data.error || response.message || "Unknown error",
                errorCode: response.data.errorCode || null,
              };

              setTestResults([errorResult]);
            }
          } else {
            // No data in response (shouldn't happen with status 200)
            toast({
              title: COMPILER_MESSAGES.ERROR.EXECUTION_FAILED,
              description: response.message || "No response data",
              variant: "destructive",
            });
            setTestResults([]);
          }
        },
        onError: (error: Error) => {
          // Only for network errors or non-200 status codes
          toast({
            title: "Network Error",
            description: error.message || "Could not connect to server",
            variant: "destructive",
          });
          setTestResults([]);
        },
      },
    );
  };

  if (isLoading || isLoadingExam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (startExamError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-destructive font-semibold">Cannot start exam</p>
          <p className="text-muted-foreground">{startExamError}</p>
          <Button onClick={() => router.push(`/exam-rooms/${roomId}`)}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (examError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Exam not found</p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/exam-rooms/${roomId}`)}
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Exam not found</p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/exam-rooms/${roomId}`)}
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">{exam.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {exam.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                <span
                  className={
                    timeRemaining < 300 ? "text-red-600 font-bold" : ""
                  }
                >
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isCompiling || isSubmitting}
              >
                Save Draft
              </Button>
              <Button
                variant="outline"
                onClick={handleTestCode}
                disabled={isCompiling || isSubmitting}
              >
                {isCompiling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Test Code
                  </>
                )}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCompiling || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4 h-[calc(100vh-140px)]">
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border"
        >
          {/* Left Panel - Exam Info */}
          <ResizablePanel defaultSize={40} minSize={25} maxSize={60}>
            <Card className="h-full overflow-hidden flex flex-col border-0 rounded-none">
              <CardHeader className="border-b shrink-0">
                <CardTitle>{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
                <div className="flex gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Total Score:</span>
                    <Badge variant="outline">{exam.totalMarks}</Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Passing Score:</span>
                    <Badge variant="outline">{exam.passingMarks}</Badge>
                  </div>
                  {examScore && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">Your Score:</span>
                      <Badge
                        variant={
                          examScore.score >= exam.passingMarks
                            ? "default"
                            : "destructive"
                        }
                        className={
                          examScore.score >= exam.passingMarks
                            ? "bg-green-600"
                            : ""
                        }
                      >
                        {examScore.score}/{examScore.totalMarks}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                {examScore && (
                  <div className="bg-muted p-4 rounded-lg border">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      Submission Status
                      <Badge
                        variant={
                          examScore.score >= exam.passingMarks
                            ? "default"
                            : "destructive"
                        }
                        className={
                          examScore.score >= exam.passingMarks
                            ? "bg-green-600"
                            : ""
                        }
                      >
                        {examScore.score >= exam.passingMarks
                          ? "Passed"
                          : "Failed"}
                      </Badge>
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="font-medium">Score:</span>{" "}
                        <span
                          className={
                            examScore.score >= exam.passingMarks
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {examScore.score}/{examScore.totalMarks}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Test Cases:</span>{" "}
                        {examScore.passedTestCases}/{examScore.totalTestCases}{" "}
                        passed
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submitted:{" "}
                        {new Date(examScore.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Description:</h3>
                  <p className="text-sm text-muted-foreground">
                    {exam.description}
                  </p>
                </div>

                {testCases.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">
                      Sample test cases ({testCases.length}):
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      You can view sample test cases to better understand the
                      expected input and output.
                    </p>
                    <div className="space-y-2">
                      {testCases.slice(0, 2).map((tc, index) => (
                        <div key={tc.testCaseId} className="text-sm">
                          <Badge variant="outline">Test case {index + 1}</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            Input: {tc.inputPath}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Output: {tc.outputPath}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Instructions:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Write your C code in the editor on the right</li>
                    <li>
                      Click &quot;Test Code&quot; to check with sample test
                      cases
                    </li>
                    <li>
                      Click &quot;Save Draft&quot; to save code (can continue
                      later)
                    </li>
                    <li>
                      Click &quot;Submit&quot; to submit your final answer
                    </li>
                    <li>Note: After submitting, you cannot edit your code</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Code Editor & Results */}
          <ResizablePanel defaultSize={60} minSize={40}>
            <Card className="h-full overflow-hidden flex flex-col border-0 rounded-none">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="flex-1 flex flex-col h-full"
              >
                <TabsList className="w-full justify-start rounded-none border-b shrink-0">
                  <TabsTrigger value="question">Code Editor</TabsTrigger>
                  <TabsTrigger value="results">
                    Test Results
                    {testResults.length > 0 && (
                      <Badge className="ml-2" variant="secondary">
                        {testResults.filter((r) => r.passed).length}/
                        {testResults.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="question"
                  className="flex-1 m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col overflow-hidden"
                >
                  <div className="flex-1 w-full h-full min-h-[600px]">
                    <Editor
                      height="100%"
                      width="100%"
                      defaultLanguage="c"
                      value={code}
                      onChange={(value) => setCode(value || "")}
                      onMount={handleEditorDidMount}
                      theme="vs-dark"
                      loading={
                        <div className="flex items-center justify-center h-full bg-[#1e1e1e]">
                          <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
                            <p className="text-gray-300 text-sm">
                              Loading &lt;Stdlib&gt;
                            </p>
                          </div>
                        </div>
                      }
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 4,
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent
                  value="results"
                  className="flex-1 m-0 overflow-y-auto p-4"
                >
                  {isCompiling ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Running test cases...
                        </p>
                      </div>
                    </div>
                  ) : testResults.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Click &quot;Test Code&quot; to run test cases
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">Test Results</h3>
                        <Badge
                          variant={
                            testResults.every((r) => r.passed)
                              ? "default"
                              : "destructive"
                          }
                        >
                          {testResults.filter((r) => r.passed).length}/
                          {testResults.length} Passed
                        </Badge>
                      </div>

                      {testResults.map((result, index) => (
                        <Card
                          key={index}
                          className={
                            result.passed
                              ? "border-green-500"
                              : "border-red-500"
                          }
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">
                                Test Case {result.testCase}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {result.executionTime && (
                                  <Badge variant="outline">
                                    {result.executionTime}ms
                                  </Badge>
                                )}
                                <Badge
                                  variant={
                                    result.passed ? "default" : "destructive"
                                  }
                                  className={
                                    result.passed
                                      ? "bg-green-600"
                                      : "bg-red-600"
                                  }
                                >
                                  {result.passed ? "Passed" : "Failed"}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {result.error && (
                              <div>
                                <p className="text-sm font-medium text-red-600">
                                  Error:
                                </p>
                                <pre className="bg-red-50 text-red-900 p-2 rounded text-sm mt-1 whitespace-pre-wrap">
                                  {result.error}
                                </pre>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium">Input:</p>
                              <pre className="bg-muted p-2 rounded text-sm mt-1">
                                {result.input}
                              </pre>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                Expected Output:
                              </p>
                              <pre className="bg-muted p-2 rounded text-sm mt-1">
                                {result.expectedOutput}
                              </pre>
                            </div>
                            {result.actualOutput && (
                              <div>
                                <p className="text-sm font-medium">
                                  Your Output:
                                </p>
                                <pre
                                  className={`p-2 rounded text-sm mt-1 ${result.passed
                                    ? "bg-green-50 text-green-900"
                                    : "bg-red-50 text-red-900"
                                    }`}
                                >
                                  {result.actualOutput}
                                </pre>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
