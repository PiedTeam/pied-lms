"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useGetExamsByMentor, useCreateExam, useDeleteExam } from "@/service";
import type { CreateExamRequest } from "@/interface/exam/exam.interface";

interface ExamsListProps {
  basePath: string; // "/admin", "/teacher", or "/mentor"
}

export function ExamsList({ basePath }: ExamsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6; // Fixed page size
  const [formData, setFormData] = useState<CreateExamRequest>({
    title: "",
    description: "",
    totalMarks: 100,
    passingMarks: 50,
  });

  // Determine query parameters based on active tab
  const includeDeleted = activeTab === "archived";

  const { data: examsData, isLoading } = useGetExamsByMentor({
    pageNumber,
    pageSize,
    includeDeleted,
  });
  const { mutate: createExam, isPending: isCreating } = useCreateExam();
  const { mutate: deleteExam, isPending: isDeleting } = useDeleteExam();

  // Filter exams by tab (client-side filtering for archived tab)
  const allExams = examsData?.items || [];

  // Apply search filter
  const filteredExams = searchQuery
    ? allExams.filter(
      (exam) =>
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : allExams;

  const currentExams =
    activeTab === "archived"
      ? filteredExams.filter((exam) => exam.isDeleted)
      : filteredExams.filter((exam) => !exam.isDeleted);

  // Calculate counts for tabs (from pagination data)
  const totalCount = examsData?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Reset page number when changing tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPageNumber(1);
  };

  // Handle next page
  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      setPageNumber((prev) => prev + 1);
    }
  };

  // Handle previous page
  const handlePrevPage = () => {
    if (pageNumber > 1) {
      setPageNumber((prev) => prev - 1);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createExam(formData, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Exam created successfully",
        });
        setIsCreateDialogOpen(false);
        setFormData({
          title: "",
          description: "",
          totalMarks: 100,
          passingMarks: 50,
        });
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to create exam",
          variant: "destructive",
        });
      },
    });
  };

  const handleDelete = () => {
    if (!deleteExamId) return;

    deleteExam(deleteExamId, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Exam hidden successfully",
        });
        setDeleteExamId(null);
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to hide exam",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Manage exams</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>Enter exam information</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">
                    Exam Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Midterm Exam"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Exam description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="totalMarks">
                      Total Score <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      min="1"
                      placeholder="100"
                      value={formData.totalMarks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          totalMarks: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="passingMarks">
                      Passing Score <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="passingMarks"
                      type="number"
                      min="1"
                      placeholder="50"
                      value={formData.passingMarks}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          passingMarks: parseInt(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Exam"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="archived">Hidden</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exam List</CardTitle>
                  <CardDescription>
                    Page {pageNumber} / {totalPages} - Total: {totalCount}
                  </CardDescription>
                </div>
                <div className="w-72">
                  <Input
                    placeholder="Search exams..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {/* Loading skeleton */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 animate-pulse"
                    >
                      <div className="h-12 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {!currentExams.length ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {activeTab === "active"
                        ? "No exams yet. Create your first exam!"
                        : "No hidden exams."}
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exam Title</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentExams.map((exam) => {
                          const isArchived = exam.isDeleted;

                          return (
                            <TableRow
                              key={exam.id}
                              className={isArchived ? "opacity-60" : ""}
                            >
                              <TableCell className="font-medium">
                                {exam.title}
                                {isArchived && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (Hidden)
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="max-w-md truncate">
                                {exam.description || "—"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    Total: {exam.totalMarks}
                                  </Badge>
                                  <Badge variant="secondary">
                                    Pass: {exam.passingMarks}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      router.push(
                                        `${basePath}/exams/${exam.id}`,
                                      )
                                    }
                                    title="View details"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {!isArchived && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          router.push(
                                            `${basePath}/exams/${exam.id}/edit`,
                                          )
                                        }
                                        title="Edit"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setDeleteExamId(exam.id)}
                                        title="Hide exam"
                                      >
                                        <Archive className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}

                  {/* Pagination Controls - Always show if totalPages > 1 */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrevPage}
                        disabled={pageNumber === 1 || isLoading}
                        title="Previous page"
                      >
                        &lt;
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={pageNumber >= totalPages || isLoading}
                        title="Next page"
                      >
                        &gt;
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!deleteExamId}
        onOpenChange={() => setDeleteExamId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Hide Exam</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to hide this exam? The exam will not appear
              in the list but data will still be stored. Admin can restore it
              later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
              {isDeleting ? "Hiding..." : "Hide Exam"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
