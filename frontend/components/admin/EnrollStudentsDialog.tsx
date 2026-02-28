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
import {
  useGetAllStudents,
  useEnrollStudents,
  useGetExamRoomEnrollments,
} from "@/services";
<<<<<<< HEAD
import { EXAM_ROOM_MESSAGES } from "@/constants/messages.constants";
=======
import { EXAM_ROOM_MESSAGES } from "@/constants/messages";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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

  const { data: studentsData, isLoading: isLoadingStudents } =
    useGetAllStudents({
      pageNumber: 1,
      pageSize: 100,
    });

  const { data: enrollmentsData } = useGetExamRoomEnrollments({
    examRoomId: roomId,
    pageNumber: 1,
    pageSize: 100,
  });

  const { mutate: enrollStudents, isPending: isEnrolling } =
    useEnrollStudents();

  // All users from this endpoint are students
  const students = studentsData?.items || [];

  // Get list of already enrolled student IDs
  const enrolledStudentIds = new Set(
    enrollmentsData?.items.map((enrollment) => enrollment.studentId) || [],
  );

  // Filter students by search query
  const filteredStudents = students.filter(
    (student) =>
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleToggleStudent = (studentId: string, isEnrolled: boolean) => {
    if (isEnrolled) return; // Don't allow toggling enrolled students

    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleSelectAll = () => {
    // Only select students who are not already enrolled
    const selectableStudents = filteredStudents.filter(
      (s) => !enrolledStudentIds.has(s.id),
    );

    if (selectedStudentIds.length === selectableStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(selectableStudents.map((s) => s.id));
    }
  };

  const handleEnrollStudents = () => {
    if (selectedStudentIds.length === 0) {
      toast({
<<<<<<< HEAD
        title: "Lỗi",
=======
        title: "Error",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
              title: "Thêm học sinh hoàn tất",
              description: `Thành công: ${result.successfulEnrollments}/${result.totalStudents}. Thất bại: ${result.failedEnrollments}`,
=======
              title: "Enrollment complete",
              description: `Successful: ${result.successfulEnrollments}/${result.totalStudents}. Failed: ${result.failedEnrollments}`,
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              variant: "default",
            });
          } else {
            // Show full success
            toast({
<<<<<<< HEAD
              title: "Thành công",
=======
              title: "Success",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              description: EXAM_ROOM_MESSAGES.SUCCESS.STUDENTS_ENROLLED,
            });
          }

          setIsOpen(false);
          setSelectedStudentIds([]);
          setSearchQuery("");
        },
        onError: (error: Error) => {
          toast({
<<<<<<< HEAD
            title: "Lỗi",
=======
            title: "Error",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
<<<<<<< HEAD
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
=======
          Enroll Students
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Enroll Students into Exam Room</DialogTitle>
          <DialogDescription>
            Select students to add to this exam room
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4 overflow-y-auto flex-1">
          {/* Search Input */}
          <div className="grid gap-2">
            <Label htmlFor="search-students">Search Students</Label>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-students"
<<<<<<< HEAD
                placeholder="Nhập tên hoặc email học sinh..."
=======
                placeholder="Enter student name or email..."
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Selected Count */}
          {selectedStudentIds.length > 0 && (
<<<<<<< HEAD
            <div className="flex items-center justify-between px-1">
              <Badge variant="secondary">
                Đã chọn: {selectedStudentIds.length}
=======
            <div className="flex items-center justify-between px-1 flex-shrink-0">
              <Badge variant="secondary">
                Selected: {selectedStudentIds.length}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudentIds([])}
              >
<<<<<<< HEAD
                Bỏ chọn tất cả
=======
                Deselect All
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </Button>
            </div>
          )}

          {/* Students List */}
<<<<<<< HEAD
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Danh sách học sinh</Label>
=======
          <div className="grid gap-2 flex-1 min-h-0">
            <div className="flex items-center justify-between flex-shrink-0">
              <Label>Student List</Label>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              {filteredStudents.filter((s) => !enrolledStudentIds.has(s.id))
                .length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-8"
                >
                  {selectedStudentIds.length ===
                  filteredStudents.filter((s) => !enrolledStudentIds.has(s.id))
                    .length
<<<<<<< HEAD
                    ? "Bỏ chọn tất cả"
                    : "Chọn tất cả"}
=======
                    ? "Deselect All"
                    : "Select All"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </Button>
              )}
            </div>

<<<<<<< HEAD
            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              {isLoadingStudents ? (
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
=======
            <div
              className="border rounded-lg overflow-hidden flex flex-col"
              style={{ maxHeight: "300px" }}
            >
              {isLoadingStudents ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading student list...
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students in the system
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No matching students found
                </div>
              ) : (
                <div className="divide-y overflow-y-auto">
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  {filteredStudents.map((student: UserResponse) => {
                    const isEnrolled = enrolledStudentIds.has(student.id);
                    const isSelected = selectedStudentIds.includes(student.id);

                    return (
                      <div
                        key={student.id}
                        className={`p-4 transition-colors ${
                          isEnrolled
                            ? "opacity-50 cursor-not-allowed bg-muted"
                            : "hover:bg-accent cursor-pointer"
                        }`}
                        onClick={() =>
                          !isEnrolled &&
                          handleToggleStudent(student.id, isEnrolled)
                        }
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            disabled={isEnrolled}
                            onCheckedChange={() =>
                              handleToggleStudent(student.id, isEnrolled)
                            }
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">
                                {student.firstName} {student.lastName}
                              </h4>
                              <Badge variant="outline" className="text-xs">
<<<<<<< HEAD
                                {student.role}
                              </Badge>
                              {isEnrolled && (
                                <Badge variant="secondary" className="text-xs">
                                  Đã thêm
=======
                                {student.roles[0] || "N/A"}
                              </Badge>
                              {isEnrolled && (
                                <Badge variant="secondary" className="text-xs">
                                  Already Enrolled
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
<<<<<<< HEAD
            Hủy
=======
            Cancel
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </Button>
          <Button
            onClick={handleEnrollStudents}
            disabled={isEnrolling || selectedStudentIds.length === 0}
          >
            {isEnrolling
<<<<<<< HEAD
              ? "Đang thêm..."
              : `Thêm ${selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ""}`}
=======
              ? "Enrolling..."
              : `Enroll ${selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ""}`}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
