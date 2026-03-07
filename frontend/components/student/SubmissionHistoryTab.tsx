"use client";

import { useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { AlertCircle, Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useGetSubmissionDetail,
  useGetStudentSubmissions,
} from "@/services/submission/submission.service";
import type { StudentSubmissionDetail } from "@/interface/student/code-submission.interface";
import type { SubmissionHistoryTabProps } from "@/interface/components/student.types";
import {
  getMockSubmissionDetail,
  getMockSubmissions,
} from "@/utils/submission-history.utils";

function getStatusVariant(
  status: string,
): "default" | "success" | "destructive" | "warning" {
  const normalized = status.toLowerCase();
  if (normalized.includes("accepted")) return "success";
  if (normalized.includes("wrong") || normalized.includes("fail"))
    return "destructive";
  if (normalized.includes("error")) return "warning";
  return "default";
}

function formatMetric(value: number | null, suffix: string): string {
  if (value === null || Number.isNaN(value)) return "N/A";
  return `${value}${suffix}`;
}

function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleString();
}

export function SubmissionHistoryTab({
  examId,
  refreshSignal = 0,
  pageSize = 10,
}: SubmissionHistoryTabProps) {
  const [pageNumber, setPageNumber] = useState(1);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, isFetching, error, refetch } =
    useGetStudentSubmissions(
      {
        examId,
        pageNumber,
        pageSize,
      },
      !!examId,
    );

  const useMockData = !!error;
  const mockSubmissions = useMemo(() => {
    void refreshSignal;
    return getMockSubmissions(examId);
  }, [examId, refreshSignal]);

  const paginatedMockData = useMemo(() => {
    const start = Math.max(0, (pageNumber - 1) * pageSize);
    return {
      items: mockSubmissions.slice(start, start + pageSize),
      totalCount: mockSubmissions.length,
    };
  }, [mockSubmissions, pageNumber, pageSize]);

  const rows = useMockData ? paginatedMockData.items : (data?.items ?? []);
  const totalCount = useMockData
    ? paginatedMockData.totalCount
    : (data?.totalCount ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(pageNumber, totalPages);

  const shouldQueryDetail =
    isViewerOpen &&
    !!selectedSubmissionId &&
    !selectedSubmissionId.startsWith("mock-");

  const {
    data: apiDetail,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useGetSubmissionDetail(selectedSubmissionId, shouldQueryDetail);

  const fallbackDetail: StudentSubmissionDetail | null = useMemo(() => {
    void refreshSignal;
    if (!isViewerOpen || !selectedSubmissionId) return null;
    return getMockSubmissionDetail(examId, selectedSubmissionId);
  }, [examId, isViewerOpen, selectedSubmissionId, refreshSignal]);

  const detailData = apiDetail ?? fallbackDetail;
  const isUsingMockDetail = !apiDetail && !!fallbackDetail;

  const openCodeViewer = (submissionId: string) => {
    setSelectedSubmissionId(submissionId);
    setIsViewerOpen(true);
  };

  const closeCodeViewer = () => {
    setIsViewerOpen(false);
    setSelectedSubmissionId("");
    setIsCopied(false);
  };

  const handleCopyCode = async () => {
    if (detailData?.code) {
      try {
        await navigator.clipboard.writeText(detailData.code);
        setIsCopied(true);
        toast({
          title: "Copied!",
          description: "Code copied to clipboard",
        });
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        toast({
          title: "Failed to copy",
          description: "Could not copy code to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      <Card className="border-0 rounded-none h-full flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Submission History</CardTitle>
              <CardDescription>
                Review previous submissions and view submitted code.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span className="ml-2">Refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4 flex-1 overflow-y-auto">
          {useMockData && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                API submissions is unavailable, showing local mock history.
                {error instanceof Error ? ` (${error.message})` : ""}
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading submission history...
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
              No submissions yet.
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Submission ID</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Language</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Runtime</TableHead>
                    <TableHead>Memory</TableHead>
                    <TableHead>Pass</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-mono text-xs">
                        {submission.id}
                      </TableCell>
                      <TableCell>
                        {formatDateTime(submission.createdAt)}
                      </TableCell>
                      <TableCell className="uppercase">
                        {submission.language}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(submission.status)}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatMetric(submission.runtime, " ms")}
                      </TableCell>
                      <TableCell>
                        {formatMetric(submission.memory, " MB")}
                      </TableCell>
                      <TableCell>
                        {submission.passedTestCases}/{submission.totalTestCases}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCodeViewer(submission.id)}
                        >
                          View Code
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageNumber(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPageNumber(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={isViewerOpen}
        onOpenChange={(open) =>
          !open ? closeCodeViewer() : setIsViewerOpen(true)
        }
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <div>
                <DialogTitle>Submitted Code</DialogTitle>
                <DialogDescription>
                  Submission ID: {selectedSubmissionId}
                  {isUsingMockDetail ? " (mock data)" : ""}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                disabled={!detailData?.code}
                className="gap-2"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Code
                  </>
                )}
              </Button>
            </div>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading code...
            </div>
          ) : detailData ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <Badge variant={getStatusVariant(detailData.status)}>
                  {detailData.status}
                </Badge>
                <Badge variant="outline">
                  {detailData.language.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {detailData.passedTestCases}/{detailData.totalTestCases}{" "}
                  passed
                </Badge>
              </div>
              <div className="h-[500px] overflow-hidden rounded-md border">
                <Editor
                  height="100%"
                  defaultLanguage={detailData.language || "c"}
                  value={detailData.code}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    lineNumbers: "on",
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              Failed to load submission detail.
              {detailError instanceof Error ? ` ${detailError.message}` : ""}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
