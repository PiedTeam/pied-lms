# Migration: types/ → interface/

## Overview
Consolidated all TypeScript type definitions into the `interface/` folder for better organization and consistency.

## Changes Made

### Before
```
frontend/
├── types/
│   └── exam.types.ts
└── interface/
    ├── exam/
    ├── user/
    └── ...
```

### After
```
frontend/
└── interface/
    ├── exam/
    │   ├── exam.interface.ts
    │   └── exam.types.ts      ← Moved here
    ├── user/
    └── ...
```

## Migration Details

### Files Moved
- `types/exam.types.ts` → `interface/exam/exam.types.ts`

### Auto-Updated Imports
The following files had their imports automatically updated:
- `app/(student)/exam-rooms/[id]/exams/[examId]/take/page.tsx`
- `components/exam/ExamInfoPanel.tsx`
- `components/exam/ExamHeader.tsx`
- `components/exam/TestResultsPanel.tsx`

### Export Updates
Updated `interface/index.ts` to include:
```typescript
export * from "./exam/exam.types";
```

## Benefits

### ✅ Single Source of Truth
- All type definitions in one place
- No confusion about where to put new types

### ✅ Better Organization
- Types grouped by domain (exam, user, testcase, etc.)
- Easier to find and maintain

### ✅ Consistent Naming
- All type files follow same pattern
- Clear structure for new developers

### ✅ Simplified Imports
- Can import from `@/interface` for all types
- No need to remember if it's in `types/` or `interface/`

## Guidelines for Future Development

### Where to Put New Types

**✅ DO**: Put all new type definitions in `interface/`
```typescript
// interface/exam/exam.types.ts
export interface NewExamType {
  // ...
}
```

**❌ DON'T**: Create new files in a separate `types/` folder
```typescript
// types/new-feature.types.ts  ← Don't do this
```

### Naming Conventions

1. **Interface files**: `*.interface.ts`
   - For API response/request interfaces
   - Example: `exam.interface.ts`

2. **Type files**: `*.types.ts`
   - For component props, utility types
   - Example: `exam.types.ts`

3. **Folder structure**: Group by domain
   ```
   interface/
   ├── exam/
   │   ├── exam.interface.ts    (API types)
   │   └── exam.types.ts        (Component types)
   ├── user/
   │   └── user.interface.ts
   └── ...
   ```

### Import Examples

```typescript
// Import from interface folder
import type { Exam, ExamScore } from "@/interface/exam/exam.types";
import type { UserResponse } from "@/interface/user/user.interface";

// Or use barrel export
import type { Exam, ExamScore, UserResponse } from "@/interface";
```

## Migration Checklist

- [x] Move `types/exam.types.ts` to `interface/exam/`
- [x] Update all imports automatically via `smartRelocate`
- [x] Add export to `interface/index.ts`
- [x] Delete empty `types/` folder
- [x] Verify no TypeScript errors
- [x] Document migration process

## Notes

- All imports were automatically updated by the IDE
- No manual import changes needed
- Zero breaking changes
- All tests should pass without modification
