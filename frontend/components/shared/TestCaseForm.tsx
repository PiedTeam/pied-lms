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
import { TESTCASE_MESSAGES } from "@/constants/messages";
import type { TestCaseResponse } from "@/interface/testcase/testcase.interface";
import type {
  TestCaseFormData,
  TestCaseFormProps,
} from "@/interface/components/shared.types";

export function TestCaseForm({
  examId, // Changed from questionId
  testCase,
  existingTestCases = [], // Add default empty array
  onSuccess,
  onCancel,
}: TestCaseFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutate: createTestCase } = useCreateTestCase();
  const { mutate: updateTestCase } = useUpdateTestCase();

  const form = useForm<TestCaseFormData>({
    defaultValues: {
      input: testCase?.inputPath ?? "",
      output: testCase?.outputPath ?? "",
      isHidden: testCase?.isHidden ?? false,
      index:
        testCase?.index ??
        (() => {
          // Auto-calculate next index when creating new test case
          if (existingTestCases.length === 0) return 1;
          const maxIndex = Math.max(
            ...existingTestCases.map((tc: TestCaseResponse) => tc.index),
          );
          return maxIndex + 1;
        })(),
    },
  });

  const onSubmit = (data: TestCaseFormData) => {
    // Basic validation
    if (!data.input.trim()) {
      toast({
        title: "Lỗi",
        description: "Input là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    if (!data.output.trim()) {
      toast({
        title: "Lỗi",
        description: "Output là bắt buộc",
        variant: "destructive",
      });
      return;
    }

    if (!data.index || data.index < 1) {
      toast({
        title: "Lỗi",
        description: "Index must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    // Check if index already exists (only when creating or changing index)
    const indexExists = existingTestCases.some(
      (tc) =>
        tc.index === data.index &&
        (!testCase || tc.testCaseId !== testCase.testCaseId),
    );

    if (indexExists) {
      toast({
        title: "Lỗi",
        description: `Test case với index ${data.index} đã tồn tại. Vui lòng chọn index khác.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      examId: examId,
      index: data.index ?? 1,
      input: data.input,
      output: data.output,
      isHidden: data.isHidden ?? false,
    };

    if (testCase) {
      // Update existing test case
      updateTestCase(
        {
          id: testCase.testCaseId,
          payload: {
            examId: examId,
            index: data.index ?? 1,
            input: data.input,
            output: data.output,
            isHidden: data.isHidden ?? false,
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
                    readOnly
                    disabled
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    className="bg-muted cursor-not-allowed"
                  />
                </FormControl>
                <FormDescription>
                  Auto-generated index (read-only)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="input"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Input</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập dữ liệu đầu vào cho test case..."
                    className="min-h-[100px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Dữ liệu stdin sẽ được truyền vào chương trình
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="output"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Output</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Nhập kết quả đầu ra mong đợi..."
                    className="min-h-[100px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Kết quả stdout mong đợi từ chương trình
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
