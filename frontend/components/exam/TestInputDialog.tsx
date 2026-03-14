import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface TestInputDialogProps {
  open: boolean;
  testInput: string;
  onOpenChange: (open: boolean) => void;
  onTestInputChange: (value: string) => void;
  onRunTest: () => void;
}

export function TestInputDialog({
  open,
  testInput,
  onOpenChange,
  onTestInputChange,
  onRunTest,
}: TestInputDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter Test Input</DialogTitle>
          <DialogDescription>
            Enter the input data for testing your code. Use newlines to separate
            multiple inputs.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Enter test input here..."
          value={testInput}
          onChange={(e) => onTestInputChange(e.target.value)}
          rows={8}
          className="font-mono"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onRunTest}>Run Test</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
