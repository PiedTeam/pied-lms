"use client";

import { useState, useEffect } from "react";
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
import { EXAM_ROOM_MESSAGES } from "@/constants/messages";
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
          title: "Error",
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
          title: "Success",
          description: "Exam room hidden successfully",
        });
        setDeleteRoomId(null);
      },
      onError: (error: Error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to hide exam room",
          variant: "destructive",
        });
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "ongoing":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">Ongoing</Badge>
        );
      case "upcoming":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">Upcoming</Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="text-gray-600">
            Completed
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
    return new Date(dateString).toLocaleString("en-US", {
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
          <h1 className="text-3xl font-bold tracking-tight">Exam Rooms</h1>
          <p className="text-muted-foreground">Manage exam rooms</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Exam Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <form onSubmit={handleCreateSubmit}>
              <DialogHeader>
                <DialogTitle>Create New Exam Room</DialogTitle>
                <DialogDescription>
                  Enter exam room information
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Exam Room Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Midterm Exam Room"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Description of the exam room"
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
                      Start Time <span className="text-red-500">*</span>
                    </Label>
                    <DateTimePicker
                      value={formData.startTime}
                      onChange={(value) =>
                        setFormData({ ...formData, startTime: value })
                      }
                      placeholder="Select start time"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endTime">
                      End Time <span className="text-red-500">*</span>
                    </Label>
                    <DateTimePicker
                      value={formData.endTime}
                      onChange={(value) =>
                        setFormData({ ...formData, endTime: value })
                      }
                      placeholder="Select end time"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">
                    Duration (minutes) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="60"
                    value={formData.durationInMinutes}
                    readOnly
                    disabled
                    className="bg-muted cursor-not-allowed"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Automatically calculated from start and end time
                  </p>
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
                  {isCreating ? "Creating..." : "Create Exam Room"}
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
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="archived">Hidden</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exam Room List</CardTitle>
                  <CardDescription>
                    Page {pageNumber} / {totalPages} - Total: {totalCount}
                  </CardDescription>
                </div>
                <div className="w-72">
                  <Input
                    placeholder="Search exam rooms..."
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
                      No exam rooms in this category.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exam Room Name</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
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
                                    (Hidden)
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
                                  {room.durationInMinutes} min
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
                                    title="View details"
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
                                      title="Edit"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {!isArchived && canBeArchived && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => setDeleteRoomId(room.id)}
                                      title="Hide exam room (cannot hide ongoing rooms)"
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
        open={!!deleteRoomId}
        onOpenChange={() => setDeleteRoomId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Hide Exam Room</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to hide this exam room? It will not appear
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
              {isDeleting ? "Hiding..." : "Hide Exam Room"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
