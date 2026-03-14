import { useState, useCallback } from "react";

interface UseExamCodeProps {
  roomId: string;
  examId: string;
}

const DEFAULT_CODE = `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Write your code here
    
    return 0;
}`;

export function useExamCode({ roomId, examId }: UseExamCodeProps) {
  const [code, setCode] = useState(() => {
    // Initialize with saved code from localStorage if available
    const savedCode = localStorage.getItem(`exam_code_${roomId}_${examId}`);
    return savedCode || DEFAULT_CODE;
  });

  const saveDraft = useCallback(() => {
    localStorage.setItem(`exam_code_${roomId}_${examId}`, code);
  }, [code, roomId, examId]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(`exam_code_${roomId}_${examId}`);
  }, [roomId, examId]);

  return { code, setCode, saveDraft, clearDraft };
}
