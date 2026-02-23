"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useGetAvailableExamRooms } from "@/service";
import { Skeleton } from "@/components/ui/skeleton";

export default function StudentExamRoomsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: roomsData, isLoading } = useGetAvailableExamRooms({
    pageNumber: 1,
    pageSize: 50,
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            Đang diễn ra
          </Badge>
        );
      case "upcoming":
        return <Badge variant="secondary">Sắp diễn ra</Badge>;
      case "closed":
        return <Badge variant="outline">Đã kết thúc</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredRooms = roomsData?.items.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Phòng thi</h1>
        <p className="text-muted-foreground">
          Danh sách các phòng thi khả dụng
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm phòng thi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !filteredRooms?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">Không có phòng thi nào</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Không tìm thấy phòng thi phù hợp"
                : "Chưa có phòng thi khả dụng"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <Card
              key={room.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/exam-rooms/${room.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  {getStatusBadge(room.status || "")}
                </div>
                <CardDescription className="line-clamp-2">
                  {room.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Bắt đầu</p>
                    <p className="text-muted-foreground">
                      {formatDateTime(room.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="font-medium">Kết thúc</p>
                    <p className="text-muted-foreground">
                      {formatDateTime(room.endTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Thời lượng: {room.durationInMinutes} phút
                  </span>
                </div>
                <Button className="w-full mt-4" size="sm">
                  Vào phòng thi
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
