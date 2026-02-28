"use client";

<<<<<<< HEAD
import { useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Archive, Calendar, Clock } from "lucide-react";
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
import { DateTimePicker } from "@/components/ui/datetime-picker";
import {
  useGetExamRoomsByMentor,
  useCreateExamRoom,
  useDeleteExamRoom,
} from "@/service";
<<<<<<< HEAD
import { EXAM_ROOM_MESSAGES } from "@/constants/messages.constants";
=======
import { EXAM_ROOM_MESSAGES } from "@/constants/messages";
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
import type { CreateExamRoomRequest } from "@/interface/exam-room/exam-room.interface";

interface ExamRoomsListProps {
  basePath: string; // "/admin", "/teacher", or "/mentor"
}

export function ExamRoomsList({ basePath }: ExamRoomsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const pageSize = 6; // Fixed page size
  const [formData, setFormData] = useState<CreateExamRoomRequest>({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    durationInMinutes: 60,
  });

  // Determine query parameters based on active tab
  const getQueryParams = () => {
    switch (activeTab) {
      case "upcoming":
        return { status: "Upcoming", includeDeleted: false };
      case "ongoing":
        return { status: "Ongoing", includeDeleted: false };
      case "completed":
        return { status: "Completed", includeDeleted: false };
      case "archived":
        return { includeDeleted: true };
      case "all":
      default:
        return { includeDeleted: false };
    }
  };

  const queryParams = getQueryParams();

  const { data: roomsData, isLoading } = useGetExamRoomsByMentor({
    pageNumber,
    pageSize,
    ...queryParams,
  });
  const { mutate: createRoom, isPending: isCreating } = useCreateExamRoom();
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteExamRoom();

<<<<<<< HEAD
=======
  // Auto-calculate duration when start or end time changes
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const diffInMinutes = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60),
      );

      if (diffInMinutes > 0) {
        setFormData((prev) => ({
          ...prev,
          durationInMinutes: diffInMinutes,
        }));
      }
    }
  }, [formData.startTime, formData.endTime]);

>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
  // Filter rooms by tab (client-side filtering for archived tab)
  const allRooms = roomsData?.items || [];

  // Apply search filter
  const filteredRooms = searchQuery
    ? allRooms.filter(
        (room) =>
          room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          room.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allRooms;

  const currentRooms =
    activeTab === "archived"
      ? filteredRooms.filter((room) => room.isDeleted)
      : filteredRooms;

  // Calculate counts for tabs (from pagination data)
  const totalCount = roomsData?.totalCount || 0;
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

<<<<<<< HEAD
    createRoom(formData, {
      onSuccess: () => {
        toast({
          title: "Thành công",
=======
    // Validate start time is not in the past
    const now = new Date();
    const startTime = new Date(formData.startTime);

    if (startTime < now) {
      toast({
        title: "Error",
        description: "Start time cannot be in the past",
        variant: "destructive",
      });
      return;
    }

    // Validate end time is after start time
    const endTime = new Date(formData.endTime);
    if (endTime <= startTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive",
      });
      return;
    }

    createRoom(formData, {
      onSuccess: () => {
        toast({
          title: "Success",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          description: EXAM_ROOM_MESSAGES.SUCCESS.CREATED,
        });
        setIsCreateDialogOpen(false);
        setFormData({
          name: "",
          description: "",
          startTime: "",
          endTime: "",
          durationInMinutes: 60,
        });
      },
      onError: (error: Error) => {
        toast({
<<<<<<< HEAD
          title: "Lỗi",
=======
          title: "Error",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          description: error.message || EXAM_ROOM_MESSAGES.ERROR.CREATE_FAILED,
          variant: "destructive",
        });
      },
    });
  };

  const handleDelete = () => {
    if (!deleteRoomId) return;

    deleteRoom(deleteRoomId, {
      onSuccess: () => {
        toast({
<<<<<<< HEAD
          title: "Thành công",
          description: "Phòng thi đã được ẩn thành công",
=======
          title: "Success",
          description: "Exam room hidden successfully",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        });
        setDeleteRoomId(null);
      },
      onError: (error: Error) => {
        toast({
<<<<<<< HEAD
          title: "Lỗi",
          description: error.message || "Không thể ẩn phòng thi",
=======
          title: "Error",
          description: error.message || "Failed to hide exam room",
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          variant: "destructive",
        });
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
        return (
<<<<<<< HEAD
          <Badge className="bg-green-600 hover:bg-green-700">
            Đang diễn ra
          </Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">Sắp diễn ra</Badge>
=======
          <Badge className="bg-green-600 hover:bg-green-700">Ongoing</Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">Upcoming</Badge>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-gray-600">
<<<<<<< HEAD
            Đã kết thúc
=======
            Completed
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Check if room can be edited (Upcoming and Completed rooms can be edited)
  const canEdit = (status: string) => {
    const statusLower = status?.toLowerCase();
    return statusLower === "upcoming" || statusLower === "completed";
  };

  // Check if room can be archived (not Ongoing)
  const canArchive = (status: string) => {
    return status?.toLowerCase() !== "ongoing";
  };

  const formatDateTime = (dateString: string) => {
<<<<<<< HEAD
    return new Date(dateString).toLocaleString("vi-VN", {
=======
    return new Date(dateString).toLocaleString("en-US", {
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
<<<<<<< HEAD
          <h1 className="text-3xl font-bold tracking-tight">Phòng Thi</h1>
          <p className="text-muted-foreground">Quản lý phòng thi</p>
=======
          <h1 className="text-3xl font-bold tracking-tight">Exam Rooms</h1>
          <p className="text-muted-foreground">Manage exam rooms</p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
<<<<<<< HEAD
              Tạo Phòng Thi
=======
              Create Exam Room
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
<<<<<<< HEAD
                <DialogTitle>Tạo Phòng Thi Mới</DialogTitle>
                <DialogDescription>Nhập thông tin phòng thi</DialogDescription>
=======
                <DialogTitle>Create New Exam Room</DialogTitle>
                <DialogDescription>
                  Enter exam room information
                </DialogDescription>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
<<<<<<< HEAD
                    Tên Phòng Thi <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="VD: Phòng thi giữa kỳ"
=======
                    Exam Room Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Midterm Exam Room"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
<<<<<<< HEAD
                  <Label htmlFor="description">Mô Tả</Label>
                  <Textarea
                    id="description"
                    placeholder="Mô tả về phòng thi"
=======
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description of the exam room"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startTime">
<<<<<<< HEAD
                      Thời Gian Bắt Đầu <span className="text-red-500">*</span>
=======
                      Start Time <span className="text-red-500">*</span>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    </Label>
                    <DateTimePicker
                      value={formData.startTime}
                      onChange={(value) =>
                        setFormData({ ...formData, startTime: value })
                      }
<<<<<<< HEAD
                      placeholder="Chọn thời gian bắt đầu"
=======
                      placeholder="Select start time"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">
<<<<<<< HEAD
                      Thời Gian Kết Thúc <span className="text-red-500">*</span>
=======
                      End Time <span className="text-red-500">*</span>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    </Label>
                    <DateTimePicker
                      value={formData.endTime}
                      onChange={(value) =>
                        setFormData({ ...formData, endTime: value })
                      }
<<<<<<< HEAD
                      placeholder="Chọn thời gian kết thúc"
=======
                      placeholder="Select end time"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">
<<<<<<< HEAD
                    Thời Lượng (phút) <span className="text-red-500">*</span>
=======
                    Duration (minutes) <span className="text-red-500">*</span>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="60"
                    value={formData.durationInMinutes}
<<<<<<< HEAD
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationInMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
=======
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Automatically calculated from start and end time
                  </p>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
<<<<<<< HEAD
                  Hủy
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Đang tạo..." : "Tạo Phòng Thi"}
=======
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Exam Room"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
        <TabsList className="grid w-full grid-cols-5">
<<<<<<< HEAD
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="upcoming">Sắp diễn ra</TabsTrigger>
          <TabsTrigger value="ongoing">Đang diễn ra</TabsTrigger>
          <TabsTrigger value="completed">Đã kết thúc</TabsTrigger>
          <TabsTrigger value="archived">Đã ẩn</TabsTrigger>
=======
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived">Hidden</TabsTrigger>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
<<<<<<< HEAD
                  <CardTitle>Danh Sách Phòng Thi</CardTitle>
                  <CardDescription>
                    Trang {pageNumber} / {totalPages} - Tổng: {totalCount}
=======
                  <CardTitle>Exam Room List</CardTitle>
                  <CardDescription>
                    Page {pageNumber} / {totalPages} - Total: {totalCount}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                  </CardDescription>
                </div>
                <div className="w-72">
                  <Input
<<<<<<< HEAD
                    placeholder="Tìm kiếm phòng thi..."
=======
                    placeholder="Search exam rooms..."
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
                  {!currentRooms.length ? (
                    <div className="text-center py-8 text-muted-foreground">
<<<<<<< HEAD
                      Không có phòng thi nào trong danh mục này.
=======
                      No exam rooms in this category.
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
<<<<<<< HEAD
                          <TableHead>Tên Phòng Thi</TableHead>
                          <TableHead>Thời Gian</TableHead>
                          <TableHead>Thời Lượng</TableHead>
                          <TableHead>Trạng Thái</TableHead>
                          <TableHead className="text-right">Thao Tác</TableHead>
=======
                          <TableHead>Exam Room Name</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentRooms.map((room) => {
                          const canEditRoom = canEdit(room.status || "");
                          const canBeArchived = canArchive(room.status || "");
                          const isArchived = room.isDeleted;

                          return (
                            <TableRow
                              key={room.id}
                              className={isArchived ? "opacity-60" : ""}
                            >
                              <TableCell className="font-medium">
                                {room.name}
                                {isArchived && (
                                  <span className="ml-2 text-xs text-muted-foreground">
<<<<<<< HEAD
                                    (Đã ẩn)
=======
                                    (Hidden)
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDateTime(room.startTime)}
                                  </div>
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    {formatDateTime(room.endTime)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
<<<<<<< HEAD
                                  {room.durationInMinutes} phút
=======
                                  {room.durationInMinutes} min
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(room.status || "")}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      router.push(
                                        `${basePath}/exam-rooms/${room.id}`,
                                      )
                                    }
<<<<<<< HEAD
                                    title="Xem chi tiết"
=======
                                    title="View details"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  {!isArchived && canEditRoom && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        router.push(
                                          `${basePath}/exam-rooms/${room.id}/edit`,
                                        )
                                      }
<<<<<<< HEAD
                                      title="Chỉnh sửa"
=======
                                      title="Edit"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {!isArchived && canBeArchived && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeleteRoomId(room.id)}
<<<<<<< HEAD
                                      title="Ẩn phòng thi (không thể ẩn phòng đang diễn ra)"
=======
                                      title="Hide exam room (cannot hide ongoing rooms)"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                                    >
                                      <Archive className="h-4 w-4" />
                                    </Button>
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
<<<<<<< HEAD
                        title="Trang trước"
=======
                        title="Previous page"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
                      >
                        &lt;
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNextPage}
                        disabled={pageNumber >= totalPages || isLoading}
<<<<<<< HEAD
                        title="Trang sau"
=======
                        title="Next page"
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
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
        open={!!deleteRoomId}
        onOpenChange={() => setDeleteRoomId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
<<<<<<< HEAD
            <AlertDialogTitle>Xác nhận ẩn phòng thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn ẩn phòng thi này? Phòng thi sẽ không hiển
              thị trong danh sách nhưng dữ liệu vẫn được lưu trữ. Admin có thể
              khôi phục lại sau này nếu cần.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
=======
            <AlertDialogTitle>Confirm Hide Exam Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to hide this exam room? It will not appear
              in the list but data will still be stored. Admin can restore it
              later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-orange-600 text-white hover:bg-orange-700"
            >
<<<<<<< HEAD
              {isDeleting ? "Đang ẩn..." : "Ẩn phòng thi"}
=======
              {isDeleting ? "Hiding..." : "Hide Exam Room"}
>>>>>>> f6c1b06589309671c5671f5e82489d8f3e81a0bd
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
