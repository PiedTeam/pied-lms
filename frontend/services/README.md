# Services Directory

This directory contains all API service modules organized by feature domain.

## Structure

```
services/
├── auth/                    # Authentication services
│   ├── auth.service.ts     # Login, register, logout, refresh token
│   └── index.ts
├── user/                    # User management services
│   ├── user.service.ts     # Get user, change password, list users
│   └── index.ts
├── admin/                   # Admin-specific services
│   ├── admin.service.ts    # Import students, approve mentors
│   └── index.ts
├── exam/                    # Exam CRUD services
│   ├── exam.service.ts     # Create, read, update, delete exams
│   └── index.ts
├── exam-room/               # Exam room services
│   ├── exam-room.service.ts # Exam room management
│   └── index.ts
├── exam-participation/      # Student exam participation
│   ├── exam-participation.service.ts
│   └── index.ts
├── quizlet/                 # Quizlet services
│   ├── quizlet.service.ts  # Quizlet CRUD operations
│   └── index.ts
└── index.ts                 # Main export file
```

## Usage

Import services from the main index file:

```typescript
import { useLogin, useRegister } from '@/service';
import { useGetExamById, useUpdateExam } from '@/service';
```

Or import from specific modules:

```typescript
import { useLogin } from '@/services/auth';
import { useGetExamById } from '@/services/exam';
```

## Conventions

1. **File naming**: Use kebab-case for file names (e.g., `exam-room.service.ts`)
2. **Hook naming**: All service functions are React Query hooks prefixed with `use`
3. **Error handling**: All mutations should handle errors with try-catch and use `AxiosError` type
4. **Type safety**: Never use `any` type - use proper TypeScript types from `@/interface` and `@/types`

## Error Handling

All services use the `AxiosError` type from `@/interface/axios.interface`:

```typescript
import type { AxiosError } from '@/interface';

try {
  // API call
} catch (err) {
  const error = err as AxiosError;
  const errorMessage = error.response?.data?.message;
  throw new Error(errorMessage || 'Default error message');
}
```

## Related

- **Interfaces**: `frontend/interface/` - All TypeScript interfaces and types
- **Utils**: `frontend/utils/` - Utility functions (JWT, etc.)
- **Axios**: `frontend/common/axios.ts` - Axios instance configuration
