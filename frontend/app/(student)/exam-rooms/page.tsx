"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Key,
  FileText,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetAvailableExamRooms } from "@/service";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import type { ExamRoomResponse } from "@/interface/exam-room/exam-room.interface";

export default function StudentExamRoomsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<ExamRoomResponse | null>(
    null,
  );
  const [roomCode, setRoomCode] = useState("");
  const pageSize = 5; // 5 rooms per page

  const { data: roomsData, isLoading } = useGetAvailableExamRooms({
    pageNumber: 1,
    pageSize: 100, // Get all rooms, paginate on FE
  });

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;

    switch (status) {
      case "Ongoing":
        return <Badge className="bg-blue-600 hover:bg-blue-700">Ongoing</Badge>;
      case "Upcoming":
        return (
          <Badge className="bg-green-600 hover:bg-green-700">Upcoming</Badge>
        );
      case "Completed":
        return (
          <Badge variant="secondary" className="bg-gray-500 text-white">
            Finished
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter by search query
  const searchedRooms = useMemo(() => {
    if (!roomsData?.items) return [];
    return roomsData.items.filter(
      (room) =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [roomsData, searchQuery]);

  // Filter by tab
  const filteredRooms = useMemo(() => {
    // Student should not see deleted rooms
    const activeRooms = searchedRooms.filter((room) => !room.isDeleted);

    if (activeTab === "all") return activeRooms;
    if (activeTab === "upcoming")
      return activeRooms.filter(
        (room) => room.status?.toLowerCase() === "upcoming",
      );
    if (activeTab === "ongoing")
      return activeRooms.filter(
        (room) => room.status?.toLowerCase() === "ongoing",
      );
    if (activeTab === "completed")
      return activeRooms.filter(
        (room) => room.status?.toLowerCase() === "completed",
      );
    return activeRooms;
  }, [searchedRooms, activeTab]);

  // Paginate on frontend
  const totalPages = Math.ceil(filteredRooms.length / pageSize);
  const paginatedRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredRooms.slice(startIndex, startIndex + pageSize);
  }, [filteredRooms, currentPage, pageSize]);

  // Reset to page 1 when changing tabs or search
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleJoinRoom = (room: ExamRoomResponse) => {
    if (room.status?.toLowerCase() !== "ongoing") {
      toast({
        title: "Cannot enter room",
        description: "You can only join exam rooms that are ongoing",
        variant: "destructive",
      });
      return;
    }
    setSelectedRoom(room);
    setIsJoinDialogOpen(true);
  };

  const handleSubmitJoin = () => {
    if (!roomCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter the room code",
        variant: "destructive",
      });
      return;
    }

    if (roomCode.toUpperCase() !== selectedRoom?.roomCode) {
      toast({
        title: "Incorrect room code",
        description: "Please check the room code again",
        variant: "destructive",
      });
      return;
    }

    // Save room code to localStorage for later use when starting exam
    localStorage.setItem(`roomCode_${selectedRoom.id}`, roomCode.toUpperCase());

    toast({
      title: "Success",
      description: "Successfully joined the exam room",
    });

    // Navigate to exam room
    router.push(`/exam-rooms/${selectedRoom.id}`);
    setIsJoinDialogOpen(false);
    setRoomCode("");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exam Rooms</h1>
        <p className="text-muted-foreground">List of available exam rooms</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search exam rooms..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Finished</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
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
          ) : !paginatedRooms.length ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No exam rooms found</p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "No matching exam rooms found"
                    : activeTab === "upcoming"
                      ? "No upcoming exam rooms"
                      : activeTab === "ongoing"
                        ? "No ongoing exam rooms"
                        : activeTab === "completed"
                          ? "No finished exam rooms"
                          : "No available exam rooms"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedRooms.map((room) => (
                  <Card
                    key={room.id}
                    className="hover:shadow-xl transition-all duration-300 border-2"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{room.name}</CardTitle>
                        {getStatusBadge(room.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {room.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">Started</p>
                          <p className="text-muted-foreground">
                            {formatDateTime(room.startTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium">Ended</p>
                          <p className="text-muted-foreground">
                            {formatDateTime(room.endTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Duration: {room.durationInMinutes} minutes
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {room.examCount || 0} exams
                        </span>
                      </div>
                      {room.status?.toLowerCase() === "ongoing" && (
                        <Button
                          className="w-full mt-4"
                          size="sm"
                          onClick={() => handleJoinRoom(room)}
                        >
                          <Key className="mr-2 h-4 w-4" />
                          Join Exam Room
                        </Button>
                      )}
                      {room.status?.toLowerCase() === "upcoming" && (
                        <Button
                          className="w-full mt-4"
                          size="sm"
                          variant="secondary"
                          disabled
                        >
                          Not started yet
                        </Button>
                      )}
                      {room.status?.toLowerCase() === "completed" && (
                        <Button
                          className="w-full mt-4"
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/exam-rooms/${room.id}`)}
                        >
                          View Results
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Join Room Dialog */}
      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Room Code</DialogTitle>
            <DialogDescription>
              Please enter the room code to join the exam room:{" "}
              {selectedRoom?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="roomCode">Room Code</Label>
              <Input
                id="roomCode"
                placeholder="Enter room code (e.g., STBUP96G)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="uppercase"
                maxLength={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsJoinDialogOpen(false);
                setRoomCode("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmitJoin}>Join Room</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
