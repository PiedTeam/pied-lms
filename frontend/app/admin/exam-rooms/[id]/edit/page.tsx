"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
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
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { useToast } from "@/hooks/use-toast";
import { useGetExamRoomById, useUpdateExamRoom } from "@/service";
import { EXAM_ROOM_MESSAGES } from "@/constants/messages";
import { useEffect, useState } from "react";
import type { UpdateExamRoomRequest } from "@/interface/exam-room/exam-room.interface";

export default function EditExamRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const roomId = params.id as string;

  const { data: room, isLoading } = useGetExamRoomById(roomId);
  const { mutate: updateRoom, isPending: isUpdating } = useUpdateExamRoom();

  const [formData, setFormData] = useState<UpdateExamRoomRequest>({
    name: "",
    description: "",
    startTime: "",
    endTime: "",
    durationInMinutes: 60,
  });

  useEffect(() => {
    if (room) {
      const startTime = room.startTime
        ? new Date(room.startTime).toISOString().slice(0, 16)
        : "";
      const endTime = room.endTime
        ? new Date(room.endTime).toISOString().slice(0, 16)
        : "";

      setFormData({
        name: room.name,
        description: room.description,
        startTime,
        endTime,
        durationInMinutes: room.durationInMinutes,
      });
    }
  }, [room]);

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

  const handleSubmit = (e: React.FormEvent) => {
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

    updateRoom(
      { roomId, payload: formData },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: EXAM_ROOM_MESSAGES.SUCCESS.UPDATED,
          });
          router.push(`/admin/exam-rooms`);
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description:
              error.message || EXAM_ROOM_MESSAGES.ERROR.UPDATE_FAILED,
            variant: "destructive",
          });
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Exam room not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/admin/exam-rooms`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Exam Room</h1>
          <p className="text-muted-foreground">Update exam room information</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Room Information</CardTitle>
          <CardDescription>
            Enter detailed information about the exam room
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="flex items-center gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/exam-rooms`)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
