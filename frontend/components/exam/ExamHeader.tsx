import { ArrowLeft, Play, Send, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Exam } from "@/interface/exam/exam.types";

interface ExamHeaderProps {
  exam: Exam;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
  isCompiling: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onTestCode: () => void;
  onSubmit: () => void;
}

export function ExamHeader({
  exam,
  timeRemaining,
  formatTime,
  isCompiling,
  isSubmitting,
  onBack,
  onSaveDraft,
  onTestCode,
  onSubmit,
}: ExamHeaderProps) {
  return (
    <div className="border-b">
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
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
                className={timeRemaining < 300 ? "text-red-600 font-bold" : ""}
              >
                {formatTime(timeRemaining)}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={onSaveDraft}
              disabled={isCompiling || isSubmitting}
            >
              Save Draft
            </Button>
            <Button
              variant="outline"
              onClick={onTestCode}
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
            <Button onClick={onSubmit} disabled={isCompiling || isSubmitting}>
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
  );
}
