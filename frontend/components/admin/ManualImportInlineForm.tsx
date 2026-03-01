"use client";

import { useState, useEffect, useRef } from "react";
import { X, Plus, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useImportStudents } from "@/service";
import { ADMIN_MESSAGES } from "@/constants/messages";
import type { StudentImportDto } from "@/interface/admin/admin.interface";

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
  const firstEmailInputRef = useRef<HTMLInputElement>(null);
  const { mutate: importStudents, isPending: isImporting } =
    useImportStudents();

  // Focus on first email input when component mounts
  useEffect(() => {
    if (firstEmailInputRef.current) {
      firstEmailInputRef.current.focus();
    }
  }, []);

  const addStudent = () => {
    setManualStudents([
      ...manualStudents,
      { email: "", firstName: "", lastName: "" },
    ]);
  };

  const removeStudent = (index: number) => {
    if (manualStudents.length > 1) {
      setManualStudents(manualStudents.filter((_, i) => i !== index));
    }
  };

  const updateStudent = (
    index: number,
    field: keyof StudentImportDto,
    value: string,
  ) => {
    const updated = [...manualStudents];
    updated[index][field] = value;
    setManualStudents(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validStudents = manualStudents.filter(
      (s) => s.email && s.firstName && s.lastName,
    );

    if (validStudents.length === 0) {
      toast({
        title: "Error",
        description: "Please enter at least one student",
        variant: "destructive",
      });
      return;
    }

    importStudents(
      { students: validStudents },
      {
        onSuccess: (response) => {
          toast({
            title: "Success",
            description:
              response.message || ADMIN_MESSAGES.SUCCESS.STUDENTS_IMPORTED,
          });
          toast({
            title: "Emails sent",
            description:
              "Each student will receive an email with a link to set their password.",
          });
          setManualStudents([{ email: "", firstName: "", lastName: "" }]);
          onSuccess();
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description:
              error.message || ADMIN_MESSAGES.ERROR.IMPORT_STUDENTS_FAILED,
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleClose = () => {
    setManualStudents([{ email: "", firstName: "", lastName: "" }]);
    onClose();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Manual Import</CardTitle>
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
          <div className="space-y-3">
            {manualStudents.map((student, index) => (
              <div
                key={index}
                className="grid gap-3 p-4 border rounded-lg relative"
              >
                {manualStudents.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => removeStudent(index)}
                    aria-label={`Remove student ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
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
                    onChange={(e) =>
                      updateStudent(index, "email", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor={`firstName-${index}`}>
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id={`firstName-${index}`}
                      placeholder="Nguyen Van"
                      value={student.firstName}
                      onChange={(e) =>
                        updateStudent(index, "firstName", e.target.value)
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
                      placeholder="A"
                      value={student.lastName}
                      onChange={(e) =>
                        updateStudent(index, "lastName", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={addStudent}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
          <Button type="submit" disabled={isImporting} className="w-full">
            {isImporting ? (
              <>
                <UserPlus className="mr-2 h-4 w-4 animate-spin" />
                Importing...
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
