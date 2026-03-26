"use client";

import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  TriangleAlert,
  UserPlus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useImportStudents } from "@/service";
import { ADMIN_MESSAGES } from "@/constants/messages";
import type {
  StudentImportDto,
  StudentImportValidationResult,
} from "@/interface/admin/admin.interface";
import {
  StudentImportError,
  createStudentImportError,
  validateManualStudents,
} from "@/utils/student-import.utils";

interface ManualImportInlineFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function ManualImportInlineForm({
  onClose,
  onSuccess,
}: ManualImportInlineFormProps) {
  const { toast } = useToast();
  const [manualStudents, setManualStudents] = useState<StudentImportDto[]>([
    { email: "", firstName: "", lastName: "" },
  ]);
  const [validationResult, setValidationResult] =
    useState<StudentImportValidationResult | null>(null);
  const [errorState, setErrorState] = useState<StudentImportError | null>(null);
  const firstEmailInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: importStudents, isPending: isImporting } =
    useImportStudents();

  useEffect(() => {
    if (firstEmailInputRef.current) {
      firstEmailInputRef.current.focus();
    }
  }, []);

  const resetState = () => {
    setManualStudents([{ email: "", firstName: "", lastName: "" }]);
    setValidationResult(null);
    setErrorState(null);
  };

  const addStudent = () => {
    setManualStudents((current) => [
      ...current,
      { email: "", firstName: "", lastName: "" },
    ]);
  };

  const removeStudent = (index: number) => {
    if (manualStudents.length > 1) {
      setManualStudents((current) => current.filter((_, i) => i !== index));
    }
  };

  const updateStudent = (
    index: number,
    field: keyof StudentImportDto,
    value: string,
  ) => {
    setManualStudents((current) => {
      const updated = [...current];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };
      return updated;
    });

    setValidationResult(null);
    setErrorState(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const result = validateManualStudents(manualStudents);
    setValidationResult(result);

    if (result.issues.length > 0) {
      const error = new StudentImportError(
        "Please fix the validation issues before importing.",
        result.issues,
      );

      setErrorState(error);
      toast({
        title: "Validation failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setErrorState(null);

    try {
      const response = await importStudents({
        students: result.students,
      });

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

      toast({
        title: "Import failed",
        description:
          normalizedError.message || ADMIN_MESSAGES.ERROR.IMPORT_STUDENTS_FAILED,
        variant: "destructive",
      });
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
          <CardTitle>Manual Import</CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter one or more students manually and import them in a single
            request.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          aria-label="Close form"
          disabled={isImporting}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3 text-sm">
            <span>Entries in form</span>
            <span className="font-medium">{manualStudents.length}</span>
          </div>

          <div className="space-y-3">
            {manualStudents.map((student, index) => (
              <div
                key={index}
                className="relative grid gap-3 rounded-lg border p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Student #{index + 1}</p>
                  {manualStudents.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeStudent(index)}
                      aria-label={`Remove student ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`email-${index}`}>
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    ref={index === 0 ? firstEmailInputRef : undefined}
                    id={`email-${index}`}
                    type="email"
                    placeholder="student@example.com"
                    value={student.email}
                    onChange={(event) =>
                      updateStudent(index, "email", event.target.value)
                    }
                    required
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor={`firstName-${index}`}>
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`firstName-${index}`}
                      placeholder="Alex"
                      value={student.firstName}
                      onChange={(event) =>
                        updateStudent(index, "firstName", event.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor={`lastName-${index}`}>
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`lastName-${index}`}
                      placeholder="Johnson"
                      value={student.lastName}
                      onChange={(event) =>
                        updateStudent(index, "lastName", event.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

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
                    Review the entries and try importing again.
                  </p>
                )}
                {errorState.details.length > 8 && (
                  <p className="mt-2 text-xs">
                    Showing the first 8 issues. Fix the entries and retry.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {!errorState && validationResult && validationResult.validRows > 0 && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Entries look valid</AlertTitle>
              <AlertDescription>
                {validationResult.validRows} student
                {validationResult.validRows === 1 ? "" : "s"} are ready to be
                imported.
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={addStudent}
            className="w-full"
            disabled={isImporting}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Student
          </Button>

          <Button type="submit" disabled={isImporting} className="w-full">
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing Students...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Import Students
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
