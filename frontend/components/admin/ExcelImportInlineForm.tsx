"use client";

import { useState, useEffect, useRef } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useImportStudents } from "@/service";
import { ADMIN_MESSAGES } from "@/constants/messages";
import * as XLSX from "xlsx";
import type { StudentImportDto } from "@/interface/admin/admin.interface";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: importStudents, isPending: isImporting } =
    useImportStudents();

  // Focus on file input when component mounts
  useEffect(() => {
    if (fileInputRef.current) {
      fileInputRef.current.focus();
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validExtensions = [".xlsx", ".xls"];
      const fileExtension = selectedFile.name
        .substring(selectedFile.name.lastIndexOf("."))
        .toLowerCase();

      if (!validExtensions.includes(fileExtension)) {
        toast({
          title: "Error",
          description: "Only Excel files (.xlsx, .xls) are accepted",
          variant: "destructive",
        });
        e.target.value = "";
        setFile(null);
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(fileBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<{
        Email: string;
        FirstName: string;
        LastName: string;
      }>(worksheet);

      if (jsonData.length === 0) {
        toast({
          title: "Error",
          description: "Excel file has no data",
          variant: "destructive",
        });
        return;
      }

      const students = jsonData.map((row) => ({
        email: row.Email,
        firstName: row.FirstName,
        lastName: row.LastName,
      }));

      const invalidRows = students.filter(
        (s) => !s.email || !s.firstName || !s.lastName,
      );
      if (invalidRows.length > 0) {
        toast({
          title: "Error",
          description:
            "Excel file has rows with missing information (Email, FirstName, LastName)",
          variant: "destructive",
        });
        return;
      }

      importStudents(
        { students },
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
            setFile(null);
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to read Excel file. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Import from Excel File</CardTitle>
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
          <div className="grid gap-2">
            <Label htmlFor="file">
              File <span className="text-red-500">*</span>
            </Label>
            <Input
              ref={fileInputRef}
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              required
            />
            <p className="text-xs text-muted-foreground">
              Accepts Excel files (.xlsx, .xls)
            </p>
          </div>
          <Button type="submit" disabled={isImporting} className="w-full">
            {isImporting ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Importing...
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
