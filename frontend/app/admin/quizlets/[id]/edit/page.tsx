"use client";

import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGetQuizletById } from "@/service";
import { QuizletEditPageContent } from "@/components/shared/QuizletEditPageContent";

export default function EditQuizletPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  const { data: quizlet, isLoading } = useGetQuizletById(id);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">Loading...</div>
      </div>
    );
  }

  if (!quizlet) {
    return (
      <div className="container mx-auto p-6">
        <div className="py-12 text-center">
          <p className="text-destructive">Quizlet not found</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <QuizletEditPageContent
      quizlet={quizlet}
      quizletId={id}
      returnPath="/admin/quizlets"
    />
  );
}
