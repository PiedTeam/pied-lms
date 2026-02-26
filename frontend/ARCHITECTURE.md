# Frontend Architecture

This document describes the architecture and organization of the frontend codebase.

## Directory Structure

```
frontend/
├── app/                     # Next.js App Router pages
│   ├── admin/              # Admin role pages
│   ├── teacher/            # Teacher role pages
│   ├── mentor/             # Mentor role pages
│   ├── student/            # Student role pages (dashboard)
│   └── login/              # Public pages
├── components/             # React components
│   ├── admin/             # Admin-specific components
│   ├── teacher/           # Teacher-specific components
│   ├── mentor/            # Mentor-specific components
│   ├── student/           # Student-specific components
│   ├── shared/            # Shared components across roles
│   ├── auth/              # Authentication components
│   ├── common/            # Common UI components
│   └── ui/                # shadcn/ui components
├── services/              # API service layer (React Query hooks)
│   ├── auth/             # Authentication services
│   ├── user/             # User management
│   ├── exam/             # Exam CRUD
│   ├── exam-room/        # Exam room management
│   ├── quizlet/          # Quizlet operations
│   └── ...
├── interface/             # TypeScript interfaces & types
│   ├── auth/             # Auth-related interfaces
│   ├── exam/             # Exam interfaces
│   ├── api.interface.ts  # Generic API response
│   ├── axios.interface.ts # Axios error types
│   └── ...
├── store/                 # Zustand state management
│   └── auth.store.ts     # Authentication state
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts        # Auth hook
│   └── use-toast.ts      # Toast notifications
├── utils/                 # Utility functions
│   ├── jwt.utils.ts      # JWT token utilities
│   └── ...
├── common/                # Common configurations
│   └── axios.ts          # Axios instance with interceptors
├── constants/             # Application constants
│   └── messages.constants.ts # UI messages
└── lib/                   # Third-party library configs
    └── utils.ts          # Tailwind utilities
```

## Key Architectural Decisions

### 1. Service Layer Pattern

All API calls are abstracted into service functions using React Query hooks:

```typescript
// services/exam/exam.service.ts
export function useGetExamById(examId: string) {
  return useQuery({
    queryKey: ['exam', examId],
    queryFn: async () => {
      const { data } = await axios.get(`/exams/${examId}`);
      return data.data;
    },
  });
}
```

**Benefits:**
- Centralized API logic
- Automatic caching and refetching
- Type-safe API calls
- Easy to test and mock

### 2. Type Safety

**No `any` types allowed** - all code uses proper TypeScript types:

```typescript
// ❌ Bad
catch (error: any) {
  console.log(error.message);
}

// ✅ Good
catch (err) {
  const error = err as AxiosError;
  console.log(error.response?.data?.message);
}
```

### 3. State Management

- **Zustand** for global state (auth)
- **React Query** for server state (API data)
- **React useState** for local component state

### 4. Authentication Flow

1. User logs in → receives JWT access token
2. Token stored in Zustand with persistence (localStorage)
3. Refresh token stored in HTTP-only cookie (backend)
4. Axios interceptor adds token to all requests
5. On 401 error → auto-refresh token
6. On refresh failure → logout and redirect

### 5. Role-Based Access Control

- Routes protected by `ProtectedRoute` component
- Role checked from JWT token
- Each role has separate page directory
- Shared components used across roles

### 6. Error Handling

All API errors follow consistent pattern:

```typescript
try {
  const { data } = await axios.post('/endpoint', payload);
  if (!data.success) {
    throw new Error(data.message);
  }
  return data.data;
} catch (err) {
  const error = err as AxiosError;
  const errorMessage = error.response?.data?.message;
  throw new Error(errorMessage || 'Default error message');
}
```

### 7. Code Organization

- **By feature domain**: Services, interfaces organized by feature
- **By role**: Pages and role-specific components separated
- **Shared code**: Common components, utilities, hooks

## Data Flow

```
User Action
    ↓
Component
    ↓
Service Hook (React Query)
    ↓
Axios Instance (with interceptors)
    ↓
Backend API
    ↓
Response
    ↓
Service Hook (cache & return)
    ↓
Component (re-render)
```

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `ExamsList.tsx`)
- **Services**: kebab-case with `.service.ts` (e.g., `exam-room.service.ts`)
- **Interfaces**: kebab-case with `.interface.ts` (e.g., `exam.interface.ts`)
- **Utils**: kebab-case with `.utils.ts` (e.g., `jwt.utils.ts`)

### Code
- **Components**: PascalCase (e.g., `ExamsList`)
- **Hooks**: camelCase with `use` prefix (e.g., `useGetExamById`)
- **Interfaces**: PascalCase (e.g., `ExamResponse`)
- **Functions**: camelCase (e.g., `decodeJwtToken`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

## Best Practices

### 1. Component Structure

```typescript
// Imports
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useGetExamById } from '@/service';

// Types
interface ExamDetailProps {
  examId: string;
}

// Component
export function ExamDetail({ examId }: ExamDetailProps) {
  // Hooks
  const router = useRouter();
  const { data: exam, isLoading } = useGetExamById(examId);
  const [isEditing, setIsEditing] = useState(false);

  // Handlers
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Render
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### 2. Service Structure

```typescript
export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateExamRequest): Promise<ExamResponse> => {
      try {
        const { data } = await axios.post('/exams', payload);
        if (!data.success || !data.data) {
          throw new Error(data.message);
        }
        return data.data;
      } catch (err) {
        const error = err as AxiosError;
        throw new Error(error.response?.data?.message || 'Create failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}
```

### 3. Error Handling in Components

```typescript
const { mutate: createExam } = useCreateExam();

const handleSubmit = (data: CreateExamRequest) => {
  createExam(data, {
    onSuccess: () => {
      toast({ title: 'Success', description: 'Exam created' });
      router.push('/exams');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **Components**: Radix UI (via shadcn/ui)
- **State Management**: Zustand
- **Server State**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns
- **Excel**: xlsx

## Related Documentation

- [Services README](./services/README.md) - API service layer
- [Interface README](./interface/README.md) - TypeScript interfaces
- [Utils README](./utils/README.md) - Utility functions
