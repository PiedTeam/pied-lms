import { Play, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { JudgeTestCaseResult } from "@/interface/exam/exam.types";

interface TestResultsPanelProps {
  isCompiling: boolean;
  testResults: JudgeTestCaseResult[];
}

export function TestResultsPanel({
  isCompiling,
  testResults,
}: TestResultsPanelProps) {
  if (isCompiling) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Running test cases...</p>
        </div>
      </div>
    );
  }

  if (testResults.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">
            Click &quot;Run Code&quot; to run test cases
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Test Results</h3>
        <Badge
          variant={
            testResults.every((r) => r.passed) ? "default" : "destructive"
          }
        >
          {testResults.filter((r) => r.passed).length}/{testResults.length}{" "}
          Passed
        </Badge>
      </div>

      {testResults.map((result, index) => (
        <Card
          key={index}
          className={result.passed ? "border-green-500" : "border-red-500"}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Test Case {result.testCase}
              </CardTitle>
              <div className="flex items-center gap-2">
                {result.executionTime && (
                  <Badge variant="outline">{result.executionTime}ms</Badge>
                )}
                <Badge
                  variant={result.passed ? "default" : "destructive"}
                  className={result.passed ? "bg-green-600" : "bg-red-600"}
                >
                  {result.passed ? "Passed" : "Failed"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {result.error && (
              <div>
                <p className="text-sm font-medium text-red-600">Error:</p>
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
              <p className="text-sm font-medium">Expected Output:</p>
              <pre className="bg-muted p-2 rounded text-sm mt-1">
                {result.expectedOutput}
              </pre>
            </div>
            {result.actualOutput && (
              <div>
                <p className="text-sm font-medium">Your Output:</p>
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
  );
}
