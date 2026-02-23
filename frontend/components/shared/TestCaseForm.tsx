"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useCreateTestCase, useUpdateTestCase } from "@/service";
import { TESTCASE_MESSAGES } from "@/constants/messages.constants";
import type { TestCaseResponse } from "@/interface/testcase/testcase.interface";

interface TestCaseFormData {
  inputPath: string;
  outputPath: string;
  isHidden: boolean;
  index: number;
}

interface TestCaseFormProps {
  questionId: string;
  testCase?: TestCaseResponse;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TestCaseForm({
  questionId,
  testCase,
  onSuccess,
  onCancel,
}: TestCaseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: createTestCase } = useCreateTestCase();
  const { mutate: updateTestCase } = useUpdateTestCase();

  const form = useForm<TestCaseFormData>({
    defaultValues: {
      inputPath: testCase?.inputPath || "",
      outputPath: testCase?.outputPath || "",
      isHidden: testCase?.isHidden || false,
      index: testCase?.index || 1,
    },
  });

  const onSubmit = (data: TestCaseFormData) => {
    // Basic validation
    if (!data.inputPath.trim()) {
      toast({
        title: "Lỗi",
        description: "Input path is required",
        variant: "destructive",
      });
      return;
    }

    if (!data.outputPath.trim()) {
      toast({
        title: "Lỗi",
        description: "Output path is required",
        variant: "destructive",
      });
      return;
    }

    if (data.index < 1) {
      toast({
        title: "Lỗi",
        description: "Index must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      questionId: parseInt(questionId),
      index: data.index,
      inputPath: data.inputPath,
      outputPath: data.outputPath,
      isHidden: data.isHidden,
    };

    if (testCase) {
      // Update existing test case
      updateTestCase(
        {
          id: testCase.id,
          payload: {
            questionId: parseInt(questionId),
            index: data.index,
            inputPath: data.inputPath,
            outputPath: data.outputPath,
            isHidden: data.isHidden,
          },
        },
        {
          onSuccess: (message) => {
            toast({
              title: "Thành công",
              description: message,
            });
            onSuccess();
          },
          onError: (error: Error) => {
            toast({
              title: "Lỗi",
              description: error.message,
              variant: "destructive",
            });
          },
          onSettled: () => {
            setIsSubmitting(false);
          },
        },
      );
    } else {
      // Create new test case
      createTestCase(payload, {
        onSuccess: (message) => {
          toast({
            title: "Thành công",
            description: message,
          });
          onSuccess();
        },
        onError: (error: Error) => {
          toast({
            title: "Lỗi",
            description: error.message,
            variant: "destructive",
          });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <FormField
            control={form.control}
            name="index"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Test Case Index</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Order/index of this test case</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inputPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input Path</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter input file path or content..."
                    className="min-h-[100px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Path to input file or input content for the test case
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outputPath"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Output Path</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter output file path or expected output..."
                    className="min-h-[100px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Path to output file or expected output content
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isHidden"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Hidden Test Case</FormLabel>
                  <FormDescription>
                    Hidden test cases are not visible to students during
                    submission
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? testCase
                ? "Updating..."
                : "Creating..."
              : testCase
                ? "Update Test Case"
                : "Create Test Case"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
