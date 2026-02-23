"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { EXAM_ROOM_MESSAGES } from "@/constants/messages.constants";
import type { CreateExamRoomRequest } from "@/interface/exam-room/exam-room.interface";

interface ExamRoomsListProps {
  basePath: string; // "/admin", "/teacher", or "/mentor"
}

export function ExamRoomsList({ basePath }: ExamRoomsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateExamRoomRequest>({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    durationInMinutes: 60,
  });

  const { data: roomsData, isLoading } = useGetExamRoomsByMentor({
    pageNumber: 1,
    pageSize: 50,
  });
  const { mutate: createRoom, isPending: isCreating } = useCreateExamRoom();
  const { mutate: deleteRoom, isPending: isDeleting } = useDeleteExamRoom();

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createRoom(formData, {
      onSuccess: () => {
        toast({
          title: "Thành công",
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
          title: "Lỗi",
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
          title: "Thành công",
          description: EXAM_ROOM_MESSAGES.SUCCESS.DELETED,
        });
        setDeleteRoomId(null);
      },
      onError: (error: Error) => {
        toast({
          title: "Lỗi",
          description: error.message || EXAM_ROOM_MESSAGES.ERROR.DELETE_FAILED,
          variant: "destructive",
        });
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
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
          <p className="text-muted-foreground">Manage your exam rooms</p>
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
                    placeholder="e.g., Midterm Exam Room"
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationInMinutes: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
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

      <Card>
        <CardHeader>
          <CardTitle>Exam Room List</CardTitle>
          <CardDescription>
            {roomsData?.items.length || 0} exam rooms
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !roomsData?.items.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No exam rooms yet. Create your first exam room!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Name</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomsData.items.map((room) => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.name}</TableCell>
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
                        {room.durationInMinutes} minutes
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(room.status || "")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`${basePath}/exam-rooms/${room.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(
                              `${basePath}/exam-rooms/${room.id}/edit`,
                            )
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteRoomId(room.id)}
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
        open={!!deleteRoomId}
        onOpenChange={() => setDeleteRoomId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this exam room? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
