"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useGetExamsByMentor, useCreateExam, useDeleteExam } from "@/service";
import { EXAM_MESSAGES } from "@/constants/messages.constants";
import { useForm } from "react-hook-form";
import type { CreateExamRequest } from "@/interface/exam/exam.interface";

interface ExamsListProps {
  basePath: string; // "/admin", "/teacher", or "/mentor"
}

export function ExamsList({ basePath }: ExamsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);

  const { data: examsData, isLoading } = useGetExamsByMentor({
    pageNumber: 1,
    pageSize: 100,
  });
  const { mutate: createExam, isPending: isCreating } = useCreateExam();
  const { mutate: deleteExam, isPending: isDeleting } = useDeleteExam();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateExamRequest>();

  const onSubmit = (data: CreateExamRequest) => {
    createExam(data, {
      onSuccess: () => {
        toast({
          title: "Thành công",
          description: EXAM_MESSAGES.SUCCESS.CREATED,
        });
        setIsCreateDialogOpen(false);
        reset();
      },
      onError: (error: Error) => {
        toast({
          title: "Lỗi",
          description: error.message || EXAM_MESSAGES.ERROR.CREATE_FAILED,
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
          title: "Thành công",
          description: EXAM_MESSAGES.SUCCESS.DELETED,
        });
        setDeleteExamId(null);
      },
      onError: (error: Error) => {
        toast({
          title: "Lỗi",
          description: error.message || EXAM_MESSAGES.ERROR.DELETE_FAILED,
          variant: "destructive",
        });
        setDeleteExamId(null);
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
          <p className="text-muted-foreground">Manage your exams</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
              <DialogDescription>
                Enter information to create a new exam
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="title">
                  Exam Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  {...register("title", {
                    required: "Exam title is required",
                  })}
                  placeholder="Enter exam title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Enter exam description"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="totalMarks">
                    Total Marks <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="totalMarks"
                    type="number"
                    {...register("totalMarks", {
                      required: "Total marks is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Total marks must be greater than 0",
                      },
                    })}
                    placeholder="100"
                  />
                  {errors.totalMarks && (
                    <p className="text-sm text-destructive">
                      {errors.totalMarks.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="passingMarks">
                    Passing Marks <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="passingMarks"
                    type="number"
                    {...register("passingMarks", {
                      required: "Passing marks is required",
                      valueAsNumber: true,
                      min: {
                        value: 1,
                        message: "Passing marks must be greater than 0",
                      },
                    })}
                    placeholder="60"
                  />
                  {errors.passingMarks && (
                    <p className="text-sm text-destructive">
                      {errors.passingMarks.message}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    reset();
                  }}
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

      <Card>
        <CardHeader>
          <CardTitle>Exam List</CardTitle>
          <CardDescription>{examsData?.totalCount || 0} exams</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !examsData?.items.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No exams yet. Create your first exam!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Passing Marks</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examsData.items.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">{exam.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {exam.description}
                    </TableCell>
                    <TableCell>{exam.totalMarks}</TableCell>
                    <TableCell>{exam.passingMarks}</TableCell>
                    <TableCell>{formatDate(exam.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`${basePath}/exams/${exam.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`${basePath}/exams/${exam.id}/edit`)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteExamId(exam.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteExamId}
        onOpenChange={(open) => !open && setDeleteExamId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this exam? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
