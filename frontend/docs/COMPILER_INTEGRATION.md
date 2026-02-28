# Compiler API Integration

## Tổng quan

Frontend đã được tích hợp với Compiler API để biên dịch và chạy code C. Tích hợp này được sử dụng ở 2 nơi chính:

1. **Student Exam Taking Page** - Nút "Test Code" và "Submit"
2. **Test Case Runner** - Nút "Run Test Case" cho Admin/Mentor/Teacher

## Cấu trúc Files

### Interfaces
- `pied-lms/frontend/interface/compiler/compiler.interface.ts`
  - Định nghĩa các interface cho request/response của Compiler API
  - Bao gồm: CompileCodeRequest, JudgeCodeRequest, JudgeCodeFromFileRequest
  - Response types: CompileCodeResponse, JudgeCodeResponse, TestCaseResult
  - Error codes: CompilerErrorCode

### Messages
- `pied-lms/frontend/constants/messages/compiler.messages.ts`
  - Chứa tất cả messages liên quan đến compiler
  - SUCCESS: Thông báo thành công
  - ERROR: Thông báo lỗi
  - INFO: Thông báo trạng thái
  - VALIDATION: Thông báo validation

### Services
- `pied-lms/frontend/services/compiler/compiler.service.ts`
  - API client functions: compileCode, judgeCode, judgeCodeFromFile
- `pied-lms/frontend/services/compiler/compiler.mutation.ts`
  - React Query hooks: useCompileCode, useJudgeCode, useJudgeCodeFromFile

## Sử dụng

### 1. Student Exam Taking Page

**File**: `pied-lms/frontend/app/(student)/exam-rooms/[id]/exams/[examId]/take/page.tsx`

**Chức năng**:
- Nút "Test Code": Chạy code với test cases từ file system (judge-from-file API)
- Nút "Submit": Submit code cuối cùng

**Code example**:
```typescript
const { mutate: judgeCodeFromFile, isPending: isJudging } = useJudgeCodeFromFile();

const handleTestCode = () => {
  judgeCodeFromFile(
    {
      code: code,
      examId: examId,
      timeLimit: 2000,
      memoryLimit: 128,
      optimizationLevel: "2",
    },
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          setTestResults(response.data.results);
          toast({
            title: COMPILER_MESSAGES.SUCCESS.JUDGED,
            description: `${response.data.passed}/${response.data.total} test cases passed`,
          });
        }
      },
    }
  );
};
```

### 2. Test Case Runner Component

**File**: `pied-lms/frontend/components/shared/TestCaseRunner.tsx`

**Chức năng**:
- Cho phép Admin/Mentor/Teacher test code với một test case cụ thể
- Sử dụng compile API để biên dịch và chạy code

**Code example**:
```typescript
const { mutate: compileCode, isPending: isRunning } = useCompileCode();

const onSubmit = (data: RunTestCaseFormData) => {
  compileCode(
    {
      code: data.code,
      input: input,
      timeLimit: 2000,
      memoryLimit: 128,
      optimizationLevel: "2",
    },
    {
      onSuccess: (response) => {
        if (response.success && response.data) {
          setResult(response.data);
        }
      },
    }
  );
};
```

## API Endpoints

### 1. Compile Code
- **Endpoint**: `POST /compiler/compile`
- **Mục đích**: Biên dịch và chạy code với input tùy chọn
- **Request**:
  ```typescript
  {
    code: string;
    input?: string;
    timeLimit?: number;      // Default: 2000ms
    memoryLimit?: number;    // Default: 128MB
    optimizationLevel?: "0" | "1" | "2" | "3" | "s";
  }
  ```
- **Response**:
  ```typescript
  {
    success: boolean;
    output: string | null;
    compilationTime: number;
    executionTime: number | null;
    error: string | null;
    errorCode: CompilerErrorCode | null;
    errorDetails: string | null;
  }
  ```

### 2. Judge Code
- **Endpoint**: `POST /compiler/judge`
- **Mục đích**: Chạy code với nhiều test cases
- **Request**:
  ```typescript
  {
    code: string;
    testCases: Array<{
      input: string;
      expectedOutput: string;
    }>;
    timeLimit?: number;
    memoryLimit?: number;
    optimizationLevel?: "0" | "1" | "2" | "3" | "s";
  }
  ```
- **Response**:
  ```typescript
  {
    passed: number;
    failed: number;
    total: number;
    results: TestCaseResult[];
  }
  ```

### 3. Judge Code From File
- **Endpoint**: `POST /compiler/judge-from-file`
- **Mục đích**: Chạy code với test cases từ file system (dựa trên examId)
- **Request**:
  ```typescript
  {
    code: string;
    examId: string;
    timeLimit?: number;
    memoryLimit?: number;
    optimizationLevel?: "0" | "1" | "2" | "3" | "s";
  }
  ```
- **Response**: Giống như Judge Code

## Error Handling

### Error Codes
- `COMPILE_ERROR`: Lỗi biên dịch (syntax error)
- `RUNTIME_ERROR`: Lỗi runtime (crash)
- `SEGMENTATION_FAULT`: Lỗi truy cập bộ nhớ
- `TIME_LIMIT_EXCEEDED`: Vượt thời gian
- `MEMORY_LIMIT_EXCEEDED`: Vượt bộ nhớ
- `OUTPUT_LIMIT_EXCEEDED`: Output quá lớn
- `WRONG_ANSWER`: Kết quả không đúng
- `SERVER_BUSY`: Server quá tải
- `INVALID_REQUEST`: Request không hợp lệ

### Error Messages
Tất cả error messages được định nghĩa trong `COMPILER_MESSAGES`:
```typescript
COMPILER_MESSAGES.ERROR.COMPILE_FAILED
COMPILER_MESSAGES.ERROR.RUNTIME_ERROR
COMPILER_MESSAGES.ERROR.TIMEOUT
// ... etc
```

## Validation

### Code Validation
- Độ dài: 10-50,000 ký tự
- Phải có hàm `main()`
- Không chứa các headers/functions nguy hiểm

### Limits
- Time limit: 1-10,000ms (default: 2000ms)
- Memory limit: 1-512MB (default: 128MB)
- Input: Max 100,000 ký tự
- Test cases: Max 50 test cases

## Best Practices

1. **Luôn validate code trước khi gửi**:
   ```typescript
   if (!code.trim() || code.trim().length < 10) {
     toast({ title: COMPILER_MESSAGES.ERROR.CODE_TOO_SHORT });
     return;
   }
   ```

2. **Hiển thị loading state**:
   ```typescript
   const { mutate, isPending } = useCompileCode();
   
   <Button disabled={isPending}>
     {isPending ? "Compiling..." : "Test Code"}
   </Button>
   ```

3. **Handle tất cả error cases**:
   ```typescript
   onSuccess: (response) => {
     if (response.success && response.data) {
       // Handle success
     } else {
       // Handle compilation/runtime errors
       toast({
         title: COMPILER_MESSAGES.ERROR.COMPILE_FAILED,
         description: response.message,
         variant: "destructive",
       });
     }
   },
   onError: (error) => {
     // Handle network/server errors
     toast({
       title: COMPILER_MESSAGES.ERROR.EXECUTION_FAILED,
       description: error.message,
       variant: "destructive",
     });
   }
   ```

4. **Sử dụng appropriate limits**:
   - Simple programs: timeLimit: 1000ms, memoryLimit: 64MB
   - Complex programs: timeLimit: 5000ms, memoryLimit: 256MB
   - Default: timeLimit: 2000ms, memoryLimit: 128MB

## Testing

### Manual Testing
1. Test với code hợp lệ:
   ```c
   #include <stdio.h>
   int main() {
       printf("Hello, World!\n");
       return 0;
   }
   ```

2. Test với syntax error:
   ```c
   #include <stdio.h>
   int main() {
       printf("Hello")  // Missing semicolon
       return 0;
   }
   ```

3. Test với runtime error:
   ```c
   #include <stdio.h>
   int main() {
       int *p = NULL;
       *p = 10;  // Segmentation fault
       return 0;
   }
   ```

4. Test với timeout:
   ```c
   #include <stdio.h>
   int main() {
       while(1) {}  // Infinite loop
       return 0;
   }
   ```

## Troubleshooting

### Issue: "Server is busy"
- **Cause**: Tất cả containers đang được sử dụng
- **Solution**: Retry sau vài giây

### Issue: "Compilation failed" với code hợp lệ
- **Cause**: Thiếu headers hoặc syntax error
- **Solution**: Kiểm tra error details, thêm headers cần thiết

### Issue: "Time limit exceeded"
- **Cause**: Infinite loop hoặc time limit quá thấp
- **Solution**: Kiểm tra logic code, tăng time limit

### Issue: "Memory limit exceeded"
- **Cause**: Allocate quá nhiều memory
- **Solution**: Optimize memory usage, tăng memory limit

## Future Enhancements

1. **Support thêm ngôn ngữ**: Python, Java, C++, JavaScript
2. **Real-time code execution**: WebSocket để stream output
3. **Code analysis**: Static analysis, code quality metrics
4. **Debugging support**: Breakpoints, step-through execution
5. **Performance profiling**: CPU/Memory usage graphs

## References

- [Compiler API Documentation](../../.kiro/specs/COMPILER_API_DOCUMENTATION.md)
- [Backend Compiler Service](../../../backend/Src/PIED_LMS.Infrastructure/Compiler/)
