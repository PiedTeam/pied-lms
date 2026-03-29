"use client";

import { useState } from "react";
import {
  useImportExam,
  downloadExamTemplate,
} from "@/services/exam/exam-import.service";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { AlertCircle, CheckCircle2, Download, Upload } from "lucide-react";

interface ExamImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ExamImportDialog({
  open,
  onOpenChange,
  onSuccess,
}: ExamImportDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  const { mutate: importExam, isPending, isSuccess, error } = useImportExam();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      toast({
        title: "Invalid file type",
        description: "Please select an Excel file (.xlsx or .xls)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleImport = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to import",
        variant: "destructive",
      });
      return;
    }

    importExam(selectedFile, {
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: `Exam "${data.title}" imported successfully with ${data.totalMarks} marks`,
        });
        setSelectedFile(null);
        onOpenChange(false);
        onSuccess?.();
      },
      onError: (err) => {
        toast({
          title: "Import failed",
          description:
            err instanceof Error ? err.message : "Failed to import exam",
          variant: "destructive",
        });
      },
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloadingTemplate(true);
      await downloadExamTemplate();
      toast({
        title: "Success",
        description: "Template downloaded successfully",
      });
    } catch (err) {
      toast({
        title: "Download failed",
        description:
          err instanceof Error ? err.message : "Failed to download template",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleClose = () => {
    if (!isPending) {
      setSelectedFile(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Exam</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import exam and test cases
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTemplate}
              disabled={isDownloadingTemplate || isPending}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloadingTemplate ? "Downloading..." : "Download Template"}
            </Button>
          </div>

          {/* File Upload Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400"
            } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileInputChange}
              disabled={isPending}
              className="absolute inset-0 cursor-pointer opacity-0"
            />

            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {selectedFile
                    ? selectedFile.name
                    : "Drag and drop your file here"}
                </p>
                <p className="text-sm text-gray-500">
                  or click to select a file
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Supported formats: .xlsx, .xls (Max 5MB)
              </p>
            </div>
          </div>

          {/* File Info */}
          {selectedFile && (
            <div className="rounded-lg bg-blue-50 p-3 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-blue-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-blue-700">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Import failed</p>
                <p className="text-sm text-red-700">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {isSuccess && (
            <div className="rounded-lg bg-green-50 p-3 flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-green-900">Import successful</p>
                <p className="text-sm text-green-700">
                  Exam has been imported successfully
                </p>
              </div>
            </div>
          )}

          {/* Template Info */}
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            <p className="font-medium text-gray-900 mb-2">
              Excel Template Format (2 Sheets):
            </p>

            <div className="mb-3">
              <p className="font-medium text-gray-800 text-xs mb-1">
                Sheet 1: ExamInfo
              </p>
              <ul className="space-y-1 text-xs ml-2">
                <li>• Column A: Title (exam name)</li>
                <li>• Column B: Description (exam description)</li>
                <li>• Column C: TotalMarks (total marks)</li>
                <li>• Column D: PassingMarks (passing marks)</li>
              </ul>
            </div>

            <div>
              <p className="font-medium text-gray-800 text-xs mb-1">
                Sheet 2: TestCases
              </p>
              <ul className="space-y-1 text-xs ml-2">
                <li>• Column A: Input (test input data)</li>
                <li>• Column B: ExpectedOutput (expected output)</li>
                <li>• Column C: IsHidden (TRUE/FALSE - hide from students)</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
