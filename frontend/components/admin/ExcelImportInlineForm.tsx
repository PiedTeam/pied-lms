"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useImportStudents } from "@/service";
import { ADMIN_MESSAGES } from "@/constants/messages";
import type { StudentImportValidationResult } from "@/interface/admin/admin.interface";
import {
  StudentImportError,
  createStudentImportError,
  downloadStudentImportTemplate,
  formatFileSize,
  isValidStudentImportFile,
  parseStudentImportFile,
} from "@/utils/student-import.utils";

interface ExcelImportInlineFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ExcelImportInlineForm({
  onClose,
  onSuccess,
}: ExcelImportInlineFormProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [validationResult, setValidationResult] =
    useState<StudentImportValidationResult | null>(null);
  const [errorState, setErrorState] = useState<StudentImportError | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: importStudents, isPending: isImporting } =
    useImportStudents();

  const isBusy = isPreparing || isImporting;

  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.focus();
    }
  }, []);

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

    if (!isValidStudentImportFile(selectedFile)) {
      const error = new StudentImportError(
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
    downloadStudentImportTemplate();

    toast({
      title: "Template downloaded",
      description: "The sample Excel template is ready to use.",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!file) {
      const error = new StudentImportError("Please select an Excel file.");
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
      const parsedResult = await parseStudentImportFile(file, setProgress);
      setValidationResult(parsedResult);

      if (parsedResult.issues.length > 0) {
        throw new StudentImportError(
          "The file contains validation issues.",
          parsedResult.issues,
        );
      }

      if (parsedResult.students.length === 0) {
        throw new StudentImportError(
          "The file does not contain any valid students to import.",
        );
      }

      setStatusMessage("Uploading validated students...");
      setProgress(90);

      const response = await importStudents({
        students: parsedResult.students,
      });

      setProgress(100);
      setStatusMessage("Import completed.");

      toast({
        title: "Import completed",
        description:
          response.message || ADMIN_MESSAGES.SUCCESS.STUDENTS_IMPORTED,
      });
      toast({
        title: "Password setup emails sent",
        description:
          "Each imported student will receive an email to set their password.",
      });

      resetState();
      onSuccess();
    } catch (error) {
      const normalizedError = createStudentImportError(error);
      setErrorState(normalizedError);
      setProgress(0);
      setStatusMessage("");

      toast({
        title: "Import failed",
        description:
          normalizedError.message || ADMIN_MESSAGES.ERROR.IMPORT_STUDENTS_FAILED,
        variant: "destructive",
      });
    } finally {
      setIsPreparing(false);
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>Import from Excel</CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload an Excel file, validate it in the browser, then import the
            student list.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="Close form"
          disabled={isBusy}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="student-import-file">
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
              id="student-import-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              required
              disabled={isBusy}
            />
            <p className="text-xs text-muted-foreground">
              Required headers: <span className="font-medium">Email</span>,{" "}
              <span className="font-medium">FirstName</span>, and{" "}
              <span className="font-medium">LastName</span>.
            </p>
          </div>

          {file && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="mt-0.5 h-5 w-5 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)}
                  </p>
                  {validationResult && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Detected {validationResult.validRows} valid student
                      {validationResult.validRows === 1 ? "" : "s"} from{" "}
                      {validationResult.totalRows} data row
                      {validationResult.totalRows === 1 ? "" : "s"}.
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
                    {errorState.details.slice(0, 8).map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1">
                    Review the file and try importing again.
                  </p>
                )}
                {errorState.details.length > 8 && (
                  <p className="mt-2 text-xs">
                    Showing the first 8 issues. Please fix the file and retry.
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
                {validationResult.validRows} student
                {validationResult.validRows === 1 ? "" : "s"} passed validation
                and will be sent to the backend.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isBusy || !file} className="w-full">
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing Students...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Students
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
