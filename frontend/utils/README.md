# Utils Directory

This directory contains utility functions used across the application.

## Available Utilities

### JWT Utils (`jwt.utils.ts`)

Utilities for working with JWT tokens.

#### Functions

**`decodeJwtToken(token: string): JwtPayload | null`**
- Decodes a JWT token without verification
- Returns the decoded payload or null if invalid

```typescript
import { decodeJwtToken } from '@/utils';

const payload = decodeJwtToken(accessToken);
if (payload) {
  console.log('User ID:', payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']);
}
```

**`isTokenExpired(token: string): boolean`**
- Checks if a JWT token is expired
- Returns true if expired, false otherwise

```typescript
import { isTokenExpired } from '@/utils';

if (isTokenExpired(accessToken)) {
  // Refresh token or redirect to login
}
```

**`getRoleFromToken(token: string): string | null`**
- Extracts user role from JWT token
- Returns role string or null

```typescript
import { getRoleFromToken } from '@/utils';

const role = getRoleFromToken(accessToken);
// Returns: "Admin", "Teacher", "Student", or "Mentor"
```

**`getUserIdFromToken(token: string): string | null`**
- Extracts user ID from JWT token
- Returns user ID or null

```typescript
import { getUserIdFromToken } from '@/utils';

const userId = getUserIdFromToken(accessToken);
```

**`getEmailFromToken(token: string): string | null`**
- Extracts email from JWT token
- Returns email or null

```typescript
import { getEmailFromToken } from '@/utils';

const email = getEmailFromToken(accessToken);
```

## JWT Token Structure

The JWT payload follows this structure:

```typescript
interface JwtPayload {
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string; // User ID
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": string;   // Email
  "FirstName": string;
  "LastName": string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;         // Role
  "exp": number;  // Expiration timestamp
  "iss": string;  // Issuer
  "aud": string;  // Audience
}
```

## Adding New Utilities

When adding new utility functions:

1. Create a new file with descriptive name (e.g., `date.utils.ts`)
2. Export functions from the file
3. Add exports to `index.ts`
4. Document usage in this README
5. Use proper TypeScript types - avoid `any`

## Related

- **Interfaces**: `frontend/interface/` - All TypeScript interfaces including `JwtPayload`
