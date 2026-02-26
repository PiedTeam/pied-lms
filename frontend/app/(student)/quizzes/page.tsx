"use client";

import { useRouter } from "next/navigation";
import { FileSpreadsheet, Clock, User, Calendar, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useGetStudentQuizlets } from "@/service";
import { QuizletLevel } from "@/interface/quizlet/quizlet.interface";

export default function StudentQuizzesPage() {
  const router = useRouter();
  const { data: quizlets, isLoading } = useGetStudentQuizlets();

  const getLevelBadge = (level: QuizletLevel, isHidden: boolean) => {
    if (isHidden) return null;

    switch (level) {
      case QuizletLevel.Easy:
        return (
          <Badge className="bg-green-600 hover:bg-green-700">
            <Award className="h-3 w-3 mr-1" />
            Dễ
          </Badge>
        );
      case QuizletLevel.Medium:
        return (
          <Badge className="bg-yellow-600 hover:bg-yellow-700">
            <Award className="h-3 w-3 mr-1" />
            Trung bình
          </Badge>
        );
      case QuizletLevel.Hard:
        return (
          <Badge className="bg-red-600 hover:bg-red-700">
            <Award className="h-3 w-3 mr-1" />
            Khó
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bộ câu hỏi</h1>
        <p className="text-muted-foreground">
          Kiểm tra kiến thức của bạn với các bộ câu hỏi
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : quizlets && quizlets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quizlets.map((quizlet) => (
            <Card
              key={quizlet.id}
              className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary"
              onClick={() => router.push(`/quizzes/${quizlet.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <FileSpreadsheet className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Badge variant="default" className="bg-blue-600">
                      Đã xuất bản
                    </Badge>
                    {getLevelBadge(quizlet.level, quizlet.isHidden)}
                  </div>
                </div>
                <CardTitle className="text-xl line-clamp-2">
                  {quizlet.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Người tạo:</span>
                    <span className="truncate">{quizlet.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="font-medium">Ngày tạo:</span>
                    <span>
                      {new Date(quizlet.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Số câu hỏi:</span>
                    <span className="font-semibold text-primary">
                      {quizlet.quantityQuestion}
                    </span>
                  </div>
                </div>
                <Button className="w-full mt-4 font-semibold" size="lg">
                  Bắt đầu làm bài
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2">
          <CardContent className="text-center py-16">
            <div className="p-4 bg-muted rounded-full w-fit mx-auto mb-4">
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Chưa có bộ câu hỏi nào</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Hiện tại chưa có bộ câu hỏi nào được xuất bản. Vui lòng quay lại
              sau!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
