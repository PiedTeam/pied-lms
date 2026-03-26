"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useGetQuizletById } from "@/service";
import { QuizletEditPageContent } from "@/components/shared/QuizletEditPageContent";

export default function EditQuizletPage() {
  const params = useParams();
  const router = useRouter();
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
          <Button className="mt-4" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Quizlet</h1>
          <p className="text-muted-foreground">Update quizlet information</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">
                Difficulty <span className="text-red-500">*</span>
              </Label>
              <Select
                value={level.toString()}
                onValueChange={(value) => {
                  console.log("🔍 Select onValueChange:", value);
                  const parsedLevel = parseInt(value, 10) as QuizletLevel;
                  if (Object.values(QuizletLevel).includes(parsedLevel)) {
                    setLevel(parsedLevel);
                  }
                }}
              >
                <SelectTrigger id="level" className="w-full">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Easy</SelectItem>
                  <SelectItem value="2">Medium</SelectItem>
                  <SelectItem value="3">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPublished"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="isPublished" className="cursor-pointer">
                Published
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isHidden"
                checked={isHidden}
                onCheckedChange={setIsHidden}
              />
              <Label htmlFor="isHidden" className="cursor-pointer">
                Hide difficulty level
              </Label>
            </div>
          </CardContent>
        </Card>

        <QuizletEditForm
          questions={questions}
          onQuestionsChange={setQuestions}
        />

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
