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
import { EXAM_ROOM_MESSAGES } from "@/constants/messages.constants";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateRoom(
      { roomId, payload: formData },
      {
        onSuccess: () => {
          toast({
            title: "Thành công",
            description: EXAM_ROOM_MESSAGES.SUCCESS.UPDATED,
          });
          router.push(`/admin/exam-rooms`);
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
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
        <div className="text-center py-8">Đang tải...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Không tìm thấy phòng thi</div>
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
          <h1 className="text-3xl font-bold tracking-tight">
            Chỉnh sửa phòng thi
          </h1>
          <p className="text-muted-foreground">Cập nhật thông tin phòng thi</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin phòng thi</CardTitle>
          <CardDescription>
            Nhập thông tin chi tiết về phòng thi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên phòng thi <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Ví dụ: Phòng thi giữa kỳ"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả về phòng thi"
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
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </Label>
                <DateTimePicker
                  value={formData.startTime}
                  onChange={(value) =>
                    setFormData({ ...formData, startTime: value })
                  }
                  placeholder="Chọn thời gian bắt đầu"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </Label>
                <DateTimePicker
                  value={formData.endTime}
                  onChange={(value) =>
                    setFormData({ ...formData, endTime: value })
                  }
                  placeholder="Chọn thời gian kết thúc"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">
                Thời lượng (phút) <span className="text-red-500">*</span>
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

            <div className="flex items-center gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/exam-rooms`)}
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isUpdating}>
                <Save className="mr-2 h-4 w-4" />
                {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
