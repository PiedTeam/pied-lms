import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import type { Exam, ExamScore } from "@/interface/exam/exam.types";

interface TestCase {
  examId: string;
  testCaseId: string;
  index: number;
  inputPath: string;
  outputPath: string;
  isHidden: boolean;
}

interface ExamInfoPanelProps {
  exam: Exam;
  examScore: ExamScore | null;
  testCases?: TestCase[];
  isLoadingTestCases?: boolean;
}

export function ExamInfoPanel({
  exam,
  examScore,
  testCases = [],
  isLoadingTestCases = false,
}: ExamInfoPanelProps) {
  return (
    <Card className="h-full overflow-hidden flex flex-col border-0 rounded-none">
      <CardHeader className="border-b shrink-0">
        <CardTitle>{exam.title}</CardTitle>
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
                  examScore.score >= exam.passingMarks ? "bg-green-600" : ""
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
                  examScore.score >= exam.passingMarks ? "bg-green-600" : ""
                }
              >
                {examScore.score >= exam.passingMarks ? "Passed" : "Failed"}
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
                {examScore.passedTestCases}/{examScore.totalTestCases} passed
              </p>
              <p className="text-xs text-muted-foreground">
                Submitted: {new Date(examScore.submittedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-2">Description:</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {exam.description}
          </p>
        </div>

        {/* Sample Test Cases */}
        {isLoadingTestCases ? (
          <div className="text-sm text-muted-foreground">
            Loading test cases...
          </div>
        ) : testCases && testCases.length > 0 ? (
          <div>
            <h3 className="font-semibold mb-2">
              Sample Test Cases ({testCases.length}):
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              You can view sample test cases to understand the expected input
              and output format.
            </p>
            <div className="space-y-3">
              {testCases.map((tc, index) => (
                <div
                  key={tc.testCaseId}
                  className="border rounded-lg p-3 bg-muted/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">Test Case {index + 1}</Badge>
                    {tc.isHidden ? (
                      <Badge
                        variant="secondary"
                        className="text-xs flex items-center gap-1"
                      >
                        <EyeOff className="h-3 w-3" />
                        Hidden
                      </Badge>
                    ) : (
                      <Badge
                        variant="default"
                        className="text-xs flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        Visible
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Input:
                      </p>
                      <pre className="text-xs bg-background p-2 rounded border font-mono overflow-x-auto">
                        {tc.inputPath || "No input"}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Expected Output:
                      </p>
                      <pre className="text-xs bg-background p-2 rounded border font-mono overflow-x-auto">
                        {tc.outputPath || "No output"}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div>
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Write your C code in the editor on the right</li>
            <li>Click &quot;Run Code&quot; to check with sample test cases</li>
            <li>
              Click &quot;Save Draft&quot; to save code (can continue later)
            </li>
            <li>Click &quot;Submit&quot; to submit your final answer</li>
            <li>Note: After submitting, you cannot edit your code</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
