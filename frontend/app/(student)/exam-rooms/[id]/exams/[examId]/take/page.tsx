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
import { useToast } from "@/hooks/use-toast";
import Editor from "@monaco-editor/react";

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

  const [exam, setExam] = useState<Exam | null>(null);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState(`#include <stdio.h>

int main() {
    // Viết code của bạn ở đây
    
    return 0;
}`);
  const [isTestingCode, setIsTestingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<JudgeTestCaseResult[]>([]);
  const [activeTab, setActiveTab] = useState("question");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Just show the UI, no API calls
  useEffect(() => {
    // Set mock exam data
    setExam({
      id: examId,
      title: "Bài thi lập trình C",
      description: "Viết chương trình C để giải quyết bài toán",
      totalMarks: 100,
      passingMarks: 50,
    });

    // Calculate time remaining from room's endTime (stored in localStorage when navigating from room detail)
    const roomDataStr = localStorage.getItem(`roomData_${roomId}`);
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
      } catch (error) {
        console.error("Error parsing room data:", error);
        // Fallback to 60 minutes if parsing fails
        setTimeRemaining(60 * 60);
      }
    } else {
      // Fallback to 60 minutes if no room data
      setTimeRemaining(60 * 60);
    }

    setIsLoading(false);
  }, [examId, roomId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = useCallback(
    async (isFinal: boolean = true) => {
      if (!code.trim()) {
        toast({
          title: "Lỗi",
          description: "Vui lòng viết code trước khi nộp bài",
          variant: "destructive",
        });
        return;
      }

      setIsSubmitting(true);

      try {
        const token = localStorage.getItem("token");
        const roomCode = localStorage.getItem(`roomCode_${roomId}`);

        if (!token || !roomCode) {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy thông tin xác thực",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        // First, start participation to get participationId
        const startResponse = await fetch("/api/participations/start", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            roomCode,
            examId,
          }),
        });

        if (!startResponse.ok) {
          const errorData = await startResponse.json();
          toast({
            title: "Lỗi",
            description: errorData.message || "Không thể bắt đầu bài thi",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        const startData = await startResponse.json();
        const participationId = startData.data.id;

        // Then submit the code
        const response = await fetch("/api/participations/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            participationId: participationId,
            sourceCode: code,
            isFinalSubmission: isFinal,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: isFinal ? "Nộp bài thành công" : "Lưu bài thành công",
            description: data.message,
          });

          if (isFinal) {
            // Navigate back to exam room
            router.push(`/exam-rooms/${roomId}`);
          }
        } else {
          toast({
            title: "Lỗi",
            description: data.message || "Không thể nộp bài",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error submitting exam:", error);
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra khi nộp bài",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [code, toast, router, roomId, examId],
  );

  const handleAutoSubmit = useCallback(async () => {
    toast({
      title: "Hết giờ",
      description: "Bài thi của bạn đã được tự động nộp",
    });

    await handleSubmit(true);
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
        title: "Lỗi",
        description: "Vui lòng viết code trước khi test",
        variant: "destructive",
      });
      return;
    }

    setIsTestingCode(true);
    setActiveTab("results");

    try {
      const token = localStorage.getItem("token");

      // Use judge-from-file API to test against visible test cases
      const response = await fetch("/compiler/judge-from-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code,
          roomId,
          questionId: examId,
          includePrivate: false, // Only test visible test cases
          timeLimit: null,
          memoryLimit: null,
          optimizationLevel: null,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const results: JudgeTestCaseResult[] = data.data.results.map(
          (r: JudgeTestCaseResult) => ({
            testCase: r.testCase,
            passed: r.passed,
            input: r.input,
            expectedOutput: r.expectedOutput,
            actualOutput: r.actualOutput,
            executionTime: r.executionTime,
            error: r.error,
            errorCode: r.errorCode,
          }),
        );

        setTestResults(results);

        toast({
          title: "Test hoàn tất",
          description: `${data.data.passed}/${data.data.total} test cases passed`,
        });
      } else {
        toast({
          title: "Lỗi",
          description: data.message || "Không thể test code",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error testing code:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi test code",
        variant: "destructive",
      });
    } finally {
      setIsTestingCode(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Không tìm thấy bài thi</p>
          <Button
            className="mt-4"
            onClick={() => router.push(`/exam-rooms/${roomId}`)}
          >
            Quay lại
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
                onClick={() => handleSubmit(false)}
                disabled={isTestingCode || isSubmitting}
              >
                Lưu tạm
              </Button>
              <Button
                variant="outline"
                onClick={handleTestCode}
                disabled={isTestingCode || isSubmitting}
              >
                {isTestingCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang test...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Test Code
                  </>
                )}
              </Button>
              <Button
                onClick={() => handleSubmit(true)}
                disabled={isTestingCode || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang nộp...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Nộp bài
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-140px)]">
          {/* Left Panel - Exam Info */}
          <Card className="overflow-hidden flex flex-col">
            <CardHeader className="border-b">
              <CardTitle>Thông tin bài thi</CardTitle>
              <CardDescription>
                Tổng điểm: {exam.totalMarks} | Điểm đạt: {exam.passingMarks}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Mô tả:</h3>
                <p className="text-sm text-muted-foreground">
                  {exam.description}
                </p>
              </div>

              {testCases.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Test cases mẫu ({testCases.length}):
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Bạn có thể xem các test case mẫu để hiểu rõ hơn về đầu vào
                    và đầu ra mong đợi.
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
                <h3 className="font-semibold mb-2">Hướng dẫn:</h3>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Viết code C của bạn trong editor bên phải</li>
                  <li>
                    Nhấn &quot;Test Code&quot; để kiểm tra với test cases mẫu
                  </li>
                  <li>
                    Nhấn &quot;Lưu tạm&quot; để lưu code (có thể tiếp tục sau)
                  </li>
                  <li>Nhấn &quot;Nộp bài&quot; để nộp bài cuối cùng</li>
                  <li>Lưu ý: Sau khi nộp bài, bạn không thể chỉnh sửa</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Code Editor & Results */}
          <Card className="overflow-hidden flex flex-col">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col"
            >
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="question">Code Editor</TabsTrigger>
                <TabsTrigger value="results">
                  Kết quả Test
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
                className="flex-1 m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <div className="flex-1 min-h-[600px]">
                  <Editor
                    height="100%"
                    defaultLanguage="c"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    onMount={handleEditorDidMount}
                    theme="vs-dark"
                    loading={
                      <div className="flex items-center justify-center h-full">
                        Đang tải editor...
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
                {isTestingCode ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Đang chạy test cases...
                      </p>
                    </div>
                  </div>
                ) : testResults.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Nhấn &quot;Test Code&quot; để chạy test cases
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Kết quả Test</h3>
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
                          result.passed ? "border-green-500" : "border-red-500"
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
                                  result.passed ? "bg-green-600" : "bg-red-600"
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
                                Lỗi:
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
                                className={`p-2 rounded text-sm mt-1 ${
                                  result.passed
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
        </div>
      </div>
    </div>
  );
}
