# Test Case Auto-Index Feature

## Overview
Test case index now automatically increments when creating new test cases, eliminating the need for manual index entry.

## How It Works

### Auto-Increment Logic
When creating a new test case:
1. If no test cases exist → Index starts at `1`
2. If test cases exist → Index = `max(existing indexes) + 1`

### Example
```
Existing test cases: [index: 1, index: 2, index: 5]
New test case → Auto-assigned index: 6
```

## Implementation

### TestCaseForm Component
**File**: `components/shared/TestCaseForm.tsx`

```typescript
const form = useForm<TestCaseFormData>({
  defaultValues: {
    index: testCase?.index || (() => {
      // Auto-calculate next index when creating new test case
      if (existingTestCases.length === 0) return 1;
      const maxIndex = Math.max(...existingTestCases.map(tc => tc.index));
      return maxIndex + 1;
    })(),
  },
});
```

### TestCasesList Component
**File**: `components/shared/TestCasesList.tsx`

Passes existing test cases to the form:
```tsx
<TestCaseForm
  examId={examId}
  existingTestCases={testCases || []}
  onSuccess={handleSuccess}
  onCancel={handleCancel}
/>
```

## Features

### ✅ Auto-Increment
- Automatically calculates the next available index
- No manual input required for new test cases

### ✅ Read-Only Index Field
- Index field is **read-only** and **disabled** to prevent accidental changes
- Visual styling (muted background) indicates it's not editable
- Prevents user errors from manual index entry

### ✅ Duplicate Prevention
- Validates that index doesn't already exist
- Shows error message if duplicate index is entered manually

### ✅ Edit Mode
- When editing existing test case, keeps original index
- Index field remains **read-only** even in edit mode
- Ensures consistency and prevents accidental index changes

### ✅ Manual Override
- Index is auto-generated and cannot be manually changed
- This prevents duplicate index errors and maintains data integrity

## User Experience

### Creating New Test Case
1. Click "Create Test Case" button
2. Index field is **pre-filled** with next available number
3. User can focus on input/output paths
4. Submit to create

### Editing Existing Test Case
1. Click "Edit" on existing test case
2. Index field shows current index
3. Can change index if needed (with validation)
4. Submit to update

## Validation Rules

1. **Index must be > 0**
2. **Index must be unique** (no duplicates)
3. **Index is required**

## Error Messages

- **Duplicate Index**: "Test case với index {number} đã tồn tại. Vui lòng chọn index khác."
- **Invalid Index**: "Index must be greater than 0"

## Benefits

1. **Faster workflow** - No need to check existing indexes
2. **Fewer errors** - Automatic calculation prevents mistakes
3. **Better UX** - One less field to worry about
4. **Consistent ordering** - Test cases are naturally ordered

## Applies To

This feature is available in all three roles:
- ✅ Admin
- ✅ Teacher  
- ✅ Mentor

All use the same `TestCaseForm` component, so the feature works consistently across all roles.
