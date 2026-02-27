"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileJson,
  Plus,
  Eye,
  Pencil,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import {
  useGetAllQuizlets,
  useCreateQuizlet,
  useTogglePublishQuizlet,
} from "@/service";
import { QuizletLevel } from "@/interface/quizlet/quizlet.interface";

interface QuizletsListProps {
  role: "admin" | "teacher" | "mentor";
}

export function QuizletsList({ role }: QuizletsListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [level, setLevel] = useState<QuizletLevel>(QuizletLevel.Easy);
  const [file, setFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");

  const { data: quizlets, isLoading } = useGetAllQuizlets();
  const { mutate: createQuizlet, isPending: isCreating } = useCreateQuizlet();
  const { mutate: togglePublish, isPending: isToggling } =
    useTogglePublishQuizlet();

  // Filter quizlets based on active tab, search query, and level filter
  const filteredQuizlets = quizlets?.filter((quizlet) => {
    // Filter by tab
    if (activeTab === "published" && !quizlet.isPublished) return false;
    if (activeTab === "unpublished" && quizlet.isPublished) return false;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = quizlet.title.toLowerCase().includes(query);
      const matchesUserName = quizlet.userName?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesUserName) return false;
    }

    // Filter by level
    if (levelFilter !== "all") {
      if (quizlet.level.toString() !== levelFilter) return false;
    }

    return true;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validExtensions = [".xlsx", ".xls"];
      const isValid = validExtensions.some((ext) =>
        selectedFile.name.toLowerCase().endsWith(ext),
      );
      if (!isValid) {
        toast({
          title: "Error",
          description: "Only Excel files (.xlsx, .xls) are accepted",
          variant: "destructive",
        });
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDownloadTemplate = () => {
    // Download the template file from public folder
    const link = document.createElement("a");
    link.href = "/templates/quiz_data_with_fields.xlsx";
    link.download = "quiz_template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title",
        variant: "destructive",
      });
      return;
    }

    if (!file) {
      toast({
        title: "Error",
        description: "Please select an Excel file",
        variant: "destructive",
      });
      return;
    }

    createQuizlet(
      {
        title,
        description,
        isPublished,
        isHidden,
        level,
        listQuestion: file,
      },
      {
        onSuccess: (message) => {
          toast({
            title: "Success",
            description: message,
          });
          setIsCreateDialogOpen(false);
          setTitle("");
          setDescription("");
          setIsPublished(false);
          setIsHidden(false);
          setLevel(QuizletLevel.Easy);
          setFile(null);
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const handleTogglePublish = (id: number, currentStatus: boolean) => {
    togglePublish(
      { id, isPublished: !currentStatus },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: !currentStatus
              ? "Quizlet published"
              : "Quizlet unpublished",
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      },
    );
  };

  const getLevelBadge = (level: QuizletLevel) => {
    // For Admin/Teacher/Mentor: ALWAYS show level badge regardless of isHidden
    // isHidden only affects Student UI
    switch (level) {
      case QuizletLevel.Easy:
        return <Badge className="bg-green-600">Easy</Badge>;
      case QuizletLevel.Medium:
        return <Badge className="bg-yellow-600">Medium</Badge>;
      case QuizletLevel.Hard:
        return <Badge className="bg-red-600">Hard</Badge>;
      default:
        return <Badge variant="outline">Level {level}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quizlet Management</h1>
          <p className="text-muted-foreground">
            Create and manage question sets from Excel files
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" />
            Download Template
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Quizlet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Create New Quizlet</DialogTitle>
                  <DialogDescription>
                    Upload an Excel file containing questions. File must be .xlsx
                    or .xls format
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter quizlet title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">
                      Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Enter description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="level">
                      Difficulty <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={level.toString()}
                      onValueChange={(value) =>
                        setLevel(parseInt(value) as QuizletLevel)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Easy</SelectItem>
                        <SelectItem value="2">Medium</SelectItem>
                        <SelectItem value="3">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="file">
                      File Excel <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="file"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        required
                      />
                      <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The Excel file must follow the template structure. Download
                      the template to see the structure.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublished"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                    <Label htmlFor="isPublished" className="cursor-pointer">
                      Publish immediately
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isHidden"
                      checked={isHidden}
                      onCheckedChange={setIsHidden}
                    />
                    <Label htmlFor="isHidden" className="cursor-pointer">
                      Hide quizlet difficulty level
                    </Label>
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
                    {isCreating ? (
                      <>
                        <Upload className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Create Quizlet
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quizlet List</CardTitle>
          <CardDescription>
            {filteredQuizlets?.length || 0} / {quizlets?.length || 0} quizlet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="unpublished">Unpublished</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4 mt-6 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title or creator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="1">Easy</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 animate-pulse"
                    >
                      <div className="h-12 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : filteredQuizlets && filteredQuizlets.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Questions</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuizlets.map((quizlet) => (
                      <TableRow
                        key={quizlet.id}
                        className={quizlet.isHidden ? "opacity-60" : ""}
                      >
                        <TableCell className="font-medium">
                          {quizlet.title}
                          {quizlet.isHidden && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Hidden)
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{quizlet.userName || "—"}</TableCell>
                        <TableCell>{getLevelBadge(quizlet.level)}</TableCell>
                        <TableCell>{quizlet.quantityQuestion}</TableCell>
                        <TableCell>
                          {quizlet.isPublished ? (
                            <Badge variant="default">Published</Badge>
                          ) : (
                            <Badge variant="secondary">Draft</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(quizlet.createdAt).toLocaleDateString(
                            "en-US",
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(`/${role}/quizlets/${quizlet.id}`)
                              }
                              title="View details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                router.push(
                                  `/${role}/quizlets/${quizlet.id}/edit`,
                                )
                              }
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant={
                                quizlet.isPublished ? "secondary" : "default"
                              }
                              size="sm"
                              onClick={() =>
                                handleTogglePublish(
                                  quizlet.id,
                                  quizlet.isPublished,
                                )
                              }
                              disabled={isToggling}
                            >
                              {quizlet.isPublished
                                ? "Unpublish"
                                : "Publish"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <FileJson className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">
                    No quizlets yet
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {activeTab === "published"
                      ? "No published quizlets yet"
                      : activeTab === "unpublished"
                        ? "No unpublished quizlets"
                        : "Create your first quizlet by uploading an Excel file"}
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Quizlet
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Excel File Creation Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Excel File Structure:</h4>
            <p className="text-sm text-muted-foreground mb-3">
              The Excel file must have the following columns (in order):
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm">
              <ul className="space-y-2">
                <li>
                  <span className="font-medium">Content:</span> Question content
                </li>
                <li>
                  <span className="font-medium">
                    Option1, Option2, Option3, Option4:
                  </span>{" "}
                  Answer choices (minimum 2 answers)
                </li>
                <li>
                  <span className="font-medium">CorrectAnswer:</span> Correct
                  answer (e.g. "Ha Noi" or "2" for multiple answers)
                </li>
                <li>
                  <span className="font-medium">IsHidden:</span> TRUE/FALSE -
                  hide/show the difficulty level of the question
                </li>
                <li>
                  <span className="font-medium">Level:</span> 1 = Easy, 2 = Medium,
                  3 = Hard
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Notes:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>File must be .xlsx or .xls format</li>
              <li>First row must be column headers</li>
              <li>
                Correct answer must exactly match one of the Options (case
                sensitive)
              </li>
              <li>
                For multiple correct answers, separate with commas (e.g. "2,3")
              </li>
              <li>
                IsHidden: TRUE to hide difficulty level of question, FALSE to
                show level
              </li>
              <li>Download the template to see detailed structure and examples</li>
            </ul>
          </div>

          <Button
            variant="outline"
            onClick={handleDownloadTemplate}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Sample Excel File
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
