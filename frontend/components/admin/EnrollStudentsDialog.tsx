"use client";

import { useState } from "react";
import { UserPlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useGetAllUsers, useEnrollStudents } from "@/services";
import { EXAM_ROOM_MESSAGES } from "@/constants/messages.constants";
import type { UserResponse } from "@/interface/user/user.interface";
import type { EnrollmentResultResponse } from "@/interface/exam-room/exam-room.interface";

interface EnrollStudentsDialogProps {
  roomId: string;
}

export function EnrollStudentsDialog({ roomId }: EnrollStudentsDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const { data: usersData, isLoading: isLoadingUsers } = useGetAllUsers({
    pageNumber: 1,
    pageSize: 100,
  });

  const { mutate: enrollStudents, isPending: isEnrolling } =
    useEnrollStudents();

  // Filter only students
  const students =
    usersData?.items.filter((user) => user.role === "Student") || [];

  // Filter students by search query
  const filteredStudents = students.filter(
    (student) =>
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleEnrollStudents = () => {
    if (selectedStudentIds.length === 0) {
      toast({
        title: "Lỗi",
        description: EXAM_ROOM_MESSAGES.ERROR.NO_STUDENTS_SELECTED,
        variant: "destructive",
      });
      return;
    }

    enrollStudents(
      {
        roomId,
        payload: { studentIds: selectedStudentIds },
      },
      {
        onSuccess: (result: EnrollmentResultResponse) => {
          const hasErrors = result.failedEnrollments > 0;

          if (hasErrors) {
            // Show partial success with details
            toast({
              title: "Thêm học sinh hoàn tất",
              description: `Thành công: ${result.successfulEnrollments}/${result.totalStudents}. Thất bại: ${result.failedEnrollments}`,
              variant: "default",
            });
          } else {
            // Show full success
            toast({
              title: "Thành công",
              description: EXAM_ROOM_MESSAGES.SUCCESS.STUDENTS_ENROLLED,
            });
          }

          setIsOpen(false);
          setSelectedStudentIds([]);
          setSearchQuery("");
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
            description:
              error.message || EXAM_ROOM_MESSAGES.ERROR.ENROLL_STUDENTS_FAILED,
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedStudentIds([]);
    setSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm học sinh
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Thêm học sinh vào phòng thi</DialogTitle>
          <DialogDescription>
            Chọn học sinh để thêm vào phòng thi này
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Search Input */}
          <div className="grid gap-2">
            <Label htmlFor="search-students">Tìm kiếm học sinh</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-students"
                placeholder="Nhập tên hoặc email học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Selected Count */}
          {selectedStudentIds.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <Badge variant="secondary">
                Đã chọn: {selectedStudentIds.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudentIds([])}
              >
                Bỏ chọn tất cả
              </Button>
            </div>
          )}

          {/* Students List */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Danh sách học sinh</Label>
              {filteredStudents.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8"
                >
                  {selectedStudentIds.length === filteredStudents.length
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
                </Button>
              )}
            </div>

            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              {isLoadingUsers ? (
                <div className="text-center py-8 text-muted-foreground">
                  Đang tải danh sách học sinh...
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Không có học sinh nào trong hệ thống
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Không tìm thấy học sinh phù hợp
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student: UserResponse) => (
                    <div
                      key={student.id}
                      className="p-4 hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleToggleStudent(student.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedStudentIds.includes(student.id)}
                          onCheckedChange={() =>
                            handleToggleStudent(student.id)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">
                              {student.firstName} {student.lastName}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {student.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isEnrolling}
          >
            Hủy
          </Button>
          <Button
            onClick={handleEnrollStudents}
            disabled={isEnrolling || selectedStudentIds.length === 0}
          >
            {isEnrolling
              ? "Đang thêm..."
              : `Thêm ${selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
