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
        title: "Error",
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
              title: "Enrollment complete",
              description: `Success: ${result.successfulEnrollments}/${result.totalStudents}. Failed: ${result.failedEnrollments}`,
              variant: "default",
            });
          } else {
            // Show full success
            toast({
              title: "Success",
              description: EXAM_ROOM_MESSAGES.SUCCESS.STUDENTS_ENROLLED,
            });
          }

          setIsOpen(false);
          setSelectedStudentIds([]);
          setSearchQuery("");
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
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
          Add students
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add students to exam room</DialogTitle>
          <DialogDescription>
            Select students to add to this exam room
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Search Input */}
          <div className="grid gap-2">
            <Label htmlFor="search-students">Search students</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-students"
                placeholder="Enter student name or email..."
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
                Selected: {selectedStudentIds.length}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStudentIds([])}
              >
                Deselect all
              </Button>
            </div>
          )}

          {/* Students List */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label>Student List</Label>
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
                      ? "Deselect all"
                      : "Select all"}
                  </Button>
                )}
            </div>

            <div className="border rounded-lg max-h-[400px] overflow-y-auto">
              {isLoadingStudents ? (
                <div className="text-center py-8 text-muted-foreground">
                  Loading student list...
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No students found in the system
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No matching students found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student: UserResponse) => {
                    const isEnrolled = enrolledStudentIds.has(student.id);
                    const isSelected = selectedStudentIds.includes(student.id);

                    return (
                      <div
                        key={student.id}
                        className={`p-4 transition-colors ${isEnrolled
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
                                {student.roles[0] || "N/A"}
                              </Badge>
                              {isEnrolled && (
                                <Badge variant="secondary" className="text-xs">
                                  Added
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
            Cancel
          </Button>
          <Button
            onClick={handleEnrollStudents}
            disabled={isEnrolling || selectedStudentIds.length === 0}
          >
            {isEnrolling
              ? "Adding..."
              : `Add ${selectedStudentIds.length > 0 ? `(${selectedStudentIds.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
