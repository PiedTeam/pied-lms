# Interface Directory

This directory contains all TypeScript interfaces and types for the application.

## Structure

```
interface/
├── admin/                   # Admin-related interfaces
├── auth/                    # Authentication interfaces
│   ├── auth.interface.ts   # Main auth interfaces + JwtPayload
│   ├── login.interface.ts
│   ├── register.interface.ts
│   └── logout.interface.ts
├── exam/                    # Exam interfaces
├── exam-room/               # Exam room interfaces
├── exam-participation/      # Exam participation interfaces
├── quizlet/                 # Quizlet interfaces
├── user/                    # User interfaces
├── api.interface.ts         # Generic API response interface
├── axios.interface.ts       # Axios error types
└── index.ts                 # Main export file
```

## Usage

Import interfaces from the main index file:

```typescript
import type { ApiResponse, AxiosError, JwtPayload } from '@/interface';
```

Or import from specific modules:

```typescript
import type { LoginRequest, LoginResponse } from '@/interface/auth/auth.interface';
import type { ExamResponse } from '@/interface/exam/exam.interface';
```

## Key Interfaces

### API Response (`api.interface.ts`)

Generic API response wrapper:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  isNotFound?: boolean;
  errorCode?: string;
  code?: number;
}
```

### Axios Error (`axios.interface.ts`)

Type-safe axios error handling:

```typescript
interface AxiosError {
  response?: {
    status: number;
    data?: AxiosErrorResponse;
  };
  message: string;
  config?: unknown;
}
```

### JWT Payload (`auth/auth.interface.ts`)

JWT token structure from backend:

```typescript
interface JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;
  "FirstName": string;
  "LastName": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  "exp": number;
  "iss": string;
  "aud": string;
}
```

## Conventions

1. **File naming**: Use kebab-case with `.interface.ts` suffix
2. **Interface naming**: Use PascalCase with descriptive names
3. **Request/Response**: Suffix with `Request` or `Response`
4. **No `any` type**: Always use proper TypeScript types
5. **Export**: Export all interfaces from module's index file

## Adding New Interfaces

When adding new interfaces:

1. Create a new folder for the feature domain (if needed)
2. Create interface file: `feature-name.interface.ts`
3. Define interfaces with proper types
4. Export from main `index.ts`
5. Document complex interfaces in this README

## Related

- **Services**: `frontend/services/` - API service hooks using these interfaces
- **Utils**: `frontend/utils/` - Utility functions (JWT utils use JwtPayload)
