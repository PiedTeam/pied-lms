"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  TriangleAlert,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useImportExamFromExcel } from "@/service";
import type { ExamsListProps } from "@/interface/components/shared.types";
import type { ExamImportValidationResult } from "@/interface/exam/exam.interface";
import {
  createExamImportError,
  downloadExamImportTemplate,
  ExamImportError,
  formatImportFileSize,
  isValidExamImportFile,
  parseExamImportFile,
} from "@/utils/exam-import.utils";

interface ExamImportDialogProps {
  basePath: ExamsListProps["basePath"];
}

export function ExamImportDialog({ basePath }: ExamImportDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [validationResult, setValidationResult] =
    useState<ExamImportValidationResult | null>(null);
  const [errorState, setErrorState] = useState<ExamImportError | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const { mutateAsync: importExam, isPending: isImporting } =
    useImportExamFromExcel();

  const isBusy = isPreparing || isImporting;

  const resetState = () => {
    setFile(null);
    setProgress(0);
    setStatusMessage("");
    setValidationResult(null);
    setErrorState(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetState();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setValidationResult(null);
    setErrorState(null);
    setProgress(0);
    setStatusMessage("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!isValidExamImportFile(selectedFile)) {
      const error = new ExamImportError(
        "Only Excel files (.xlsx, .xls) are accepted.",
      );

      setFile(null);
      setErrorState(error);
      event.target.value = "";

      toast({
        title: "Invalid file",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
  };

  const handleDownloadTemplate = () => {
    downloadExamImportTemplate();
    toast({
      title: "Template downloaded",
      description: "The exam import template is ready to use.",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      const error = new ExamImportError("Please select an Excel file.");
      setErrorState(error);
      toast({
        title: "Missing file",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setIsPreparing(true);
    setErrorState(null);
    setValidationResult(null);
    setProgress(5);
    setStatusMessage("Reading file...");

    try {
      const parsedResult = await parseExamImportFile(file, setProgress);
      setValidationResult(parsedResult);

      if (parsedResult.issues.length > 0) {
        throw new ExamImportError(
          "The file contains validation issues.",
          parsedResult.issues,
        );
      }

      if (parsedResult.testCases.length === 0) {
        throw new ExamImportError(
          "The file does not contain any valid test cases to import.",
        );
      }

      setStatusMessage("Importing exam and test cases...");

      const result = await importExam({
        title: parsedResult.title,
        description: parsedResult.description,
        totalMarks: parsedResult.totalMarks,
        passingMarks: parsedResult.passingMarks,
        testCases: parsedResult.testCases,
        onProgress: ({ percentage, message }) => {
          setProgress(percentage);
          setStatusMessage(message);
        },
      });

      toast({
        title: "Import Successful",
        description: `${result.createdTestCases} test case(s) were imported successfully.`,
      });

      handleOpenChange(false);
      router.push(`${basePath}/exams/${result.exam.id}`);
    } catch (error) {
      const normalizedError = createExamImportError(error);
      setErrorState(normalizedError);
      setProgress(0);
      setStatusMessage("");

      toast({
        title: "Import failed",
        description: normalizedError.message,
        variant: "destructive",
      });
    } finally {
      setIsPreparing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import from Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Import Exam from Excel</DialogTitle>
          <DialogDescription>
            Upload a template-based Excel file to create an exam and its test
            cases in one flow.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="exam-import-file">
                Excel file <span className="text-red-500">*</span>
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                disabled={isBusy}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
            <Input
              ref={fileInputRef}
              id="exam-import-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              required
              disabled={isBusy}
            />
            <p className="text-xs text-muted-foreground">
              Required columns: Exam Title, Points, Test Case Input, Expected
              Output. Maximum file size: 5 MB. Maximum rows: 200.
            </p>
          </div>

          {file && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="mt-0.5 h-5 w-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatImportFileSize(file.size)}
                  </p>
                  {validationResult && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Ready to create exam &quot;{validationResult.title}&quot; with{" "}
                      {validationResult.validRows} valid test case
                      {validationResult.validRows === 1 ? "" : "s"}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {(isBusy || statusMessage) && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-sm">
                <span>{statusMessage || "Preparing import..."}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2.5" />
            </div>
          )}

          {errorState && (
            <Alert variant="destructive">
              <TriangleAlert className="h-4 w-4" />
              <AlertTitle>{errorState.message}</AlertTitle>
              <AlertDescription>
                {errorState.details.length > 0 ? (
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {errorState.details.slice(0, 10).map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1">
                    Review the file structure and try importing again.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {!errorState && validationResult && validationResult.validRows > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>File is ready to import</AlertTitle>
              <AlertDescription>
                {validationResult.title} will be created with{" "}
                {validationResult.totalMarks} points, {validationResult.passingMarks}{" "}
                passing marks, and {validationResult.validRows} test case
                {validationResult.validRows === 1 ? "" : "s"}.
              </AlertDescription>
            </Alert>
          )}

          <div className="rounded-lg border bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-medium">Template notes</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Repeat exam-level data only on the first row if you want.</li>
              <li>
                Later rows can leave Exam Title, Description, and Points blank.
              </li>
              <li>
                Use line breaks in Test Case Input and Expected Output if needed.
              </li>
              <li>Hidden accepts TRUE/FALSE, YES/NO, or 1/0.</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isBusy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy || !file}>
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Exam
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
