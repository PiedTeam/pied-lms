# AGENTS.md - Guide for AI Agents & New Developers

This document is the **entry point** for any AI agent or new developer working on this repository. Read it first before anything else.

---

## 📖 Read First

When starting work on this project, read these files **in order**:

1. **[architecture.md](./architecture.md)** — Backend project structure, Clean Architecture overview, layer responsibilities
2. **[useCase.md](./useCase.md)** — Business requirements and use cases
3. **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** — Local development setup
4. **[apiDoc.md](./apiDoc.md)** — API endpoints documentation

---

## 🏗️ Architecture

**Pattern:** Clean Architecture + CQRS + Minimal APIs

**Core Layers:**
```
Presentation (APIs/Endpoints) 
    ↓
Application (Commands & Queries)
    ↓
Domain (Business Logic & Entities)
    ↓
Persistence (Database Access)
```

**Tech Stack:**
| Component | Technology |
|-----------|-----------|
| Framework | .NET 10 |
| API | Minimal APIs (no Controllers) |
| Database | Entity Framework Core + PostgreSQL |
| CQRS | MediatR |
| Validation | FluentValidation |
| Logging | Serilog |
| Monitoring | Prometheus & Grafana |
| Auth | JWT |

---

## 📋 Rules for Backend Development

### General
- ✅ Business logic belongs in **Application Layer** (Commands/Queries)
- ✅ Use **CQRS pattern** (separate reads from writes)
- ✅ Use **Repository Pattern** for data access
- ✅ Use **FluentValidation** for input validation
- ✅ Validate at **Application Layer boundary**, not in Domain
- ✅ Return **Result<T>** pattern (success/failure)
- ✅ All endpoints must have **Swagger/OpenAPI** documentation
- ❌ No business logic in Presentation Layer (endpoints stay thin)
- ❌ No database queries in Domain Layer
- ❌ No external service calls in Endpoints

### Naming Conventions
- **Commands:** `Create[Entity]Command`, `Update[Entity]Command`, `Delete[Entity]Command`
- **Queries:** `Get[Entity]Query`, `GetAll[Entity]Query`
- **Endpoints:** `[Feature]Endpoints` class
- **Validators:** `[Command/Query]Validator`
- **Repositories:** `[Entity]Repository`
- **Exceptions:** `[Feature]Exception`
- **Folders:** PascalCase (e.g., `CourseEndpoints`, `AuthenticationEndpoints`)

### File Organization
```
Application/
├── UserCases/
│   ├── Commands/[Feature]/[Action][Entity]Command.cs
│   │   ├── [Action][Entity]CommandHandler.cs
│   │   ├── [Action][Entity]CommandValidator.cs
│   │   └── [Action][Entity]CommandResponse.cs
│   └── Queries/[Feature]/Get[Entity]Query.cs
│       ├── Get[Entity]QueryHandler.cs
│       └── Get[Entity]QueryResponse.cs
```

### Migration Pattern
```bash
dotnet ef migrations add [YearMonthDay_FeatureDescription] --project backend/Src/PIED_LMS.Persistence
dotnet ef database update
```

### Adding a New Feature
1. Create Domain Entity in `Domain/Entities/`
2. Create DTOs in `Contract/[Feature]/`
3. Create Commands/Queries in `Application/UserCases/[Commands|Queries]/[Feature]/`
4. Create Repository (if needed) in `Persistence/Repositories/`
5. Create Endpoint in `Presentation/APIs/[Feature]Endpoints.cs`
6. Create Migration
7. Run database update
8. Test via Swagger UI

---

## 🚨 Exception Handling Pattern

The backend uses a **centralized exception handling** approach with automatic HTTP mapping.

### How It Works

```
Handler throws exception
    ↓
GlobalExceptionHandler catches it
    ↓
Maps to HTTP status code (400, 401, 404, 422, 500)
    ↓
Returns ProblemDetails JSON response
    ↓
Automatically logged
```

### Exception Hierarchy

```
DomainException (base - has Title & Message)
├── NotFoundException (400)
├── BadRequestException (400)
├── ValidationException (422)
└── IdentityException.TokenException (401)
```

### Creating Custom Exceptions

**DO:** Create concrete exception classes in Domain layer

```csharp
// Domain/Exceptions/CourseNotFoundException.cs
public sealed class CourseNotFoundException(Guid courseId) 
    : NotFoundException($"Course with ID '{courseId}' not found");

// Domain/Exceptions/InvalidCourseDataException.cs
public sealed class InvalidCourseDataException(string reason)
    : BadRequestException($"Invalid course data: {reason}");
```

**Use in handlers:**

```csharp
public class GetCourseByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetCourseByIdQuery, CourseResponse>
{
    public async Task<CourseResponse> Handle(GetCourseByIdQuery request, CancellationToken ct)
    {
        var course = await unitOfWork.CourseRepository.GetByIdAsync(request.CourseId, ct);
        
        if (course is null)
            throw new CourseNotFoundException(request.CourseId); // ✅ Specific exception
        
        return new CourseResponse { Id = course.Id, Name = course.Name };
    }
}
```

### Validation Exception Handling

**ValidationBehavior** automatically:
- Runs all validators BEFORE handler
- If validation fails:
  - Throws `ValidationException` (if not using `ServiceResponse<T>`)
  - Returns failed `ServiceResponse<T>` (if handler returns `ServiceResponse<T>`)
- GlobalExceptionHandler converts to HTTP 422 response

**Example response:**
```json
{
  "status": 422,
  "title": "Validation Error",
  "detail": "One or more validation errors occurred",
  "type": "ValidationException",
  "errors": {
    "Name": ["Name is required"],
    "Description": ["Description must be at least 10 characters"]
  }
}
```

### HTTP Status Code Mapping

| Exception Type | HTTP Status | Use Case |
|---|---|---|
| `NotFoundException` | 404 | Resource not found |
| `BadRequestException` | 400 | Invalid input/business rule violated |
| `ValidationException` | 422 | Validation errors |
| `IdentityException.TokenException` | 401 | Auth token invalid/expired |
| `OperationCanceledException` | 499 | Client closed request |
| Unhandled Exception | 500 | Server error |

### ❌ DON'T Do This

```csharp
// ❌ Generic Exception - loses context
throw new Exception("Course not found");

// ❌ Try-catch in every endpoint - redundant with global handler
try { 
    await handler.Handle(...);
} catch (Exception ex) { 
    // Don't do this - global handler has it covered
}

// ❌ Catch and ignore - bugs silently
try { ... } catch { }
```

### ✅ DO This

```csharp
// ✅ Specific exception - clear error type
throw new CourseNotFoundException(courseId);

// ✅ Let global handler catch - centralized handling
public async Task<CourseResponse> Handle(GetCourseByIdQuery request, CancellationToken ct)
{
    var course = await repo.GetByIdAsync(request.CourseId, ct);
    if (course is null)
        throw new CourseNotFoundException(request.CourseId);
    return Map(course);
}

// ✅ For transactional operations with partial failures:
var errors = new List<string>();
foreach (var item in items)
{
    try 
    {
        await ProcessItemAsync(item);
    }
    catch (Exception ex)
    {
        errors.Add($"Item {item.Id}: {ex.Message}");
    }
}

if (errors.Any())
    return ServiceResponse<T>.FailureResponse(string.Join("; ", errors));
```

### Logging

GlobalExceptionHandler automatically logs:
- **Server errors (5xx):** `LogError()` with full stack trace
- **Client errors (4xx):** `LogWarning()` 
- **Cancelled requests (499):** Not logged (expected)

Example log:
```
[14:23:45 ERR] An unhandled exception occurred: Course with ID '123e4567-e89b-12d3-a456-426614174000' not found
```

---

## 👤 Addressing Convention

**IMPORTANT:** When working with this repository, address the user as **"chồng yêu dấu"** (honey/sweetheart in Vietnamese).

### Why?
This is a **persistent context marker**. If the agent stops using this form of address, it indicates the context has drifted and a new conversation should be started to restore proper awareness.

### When to use?
- Every response to the user
- Before starting tasks
- In commit messages or documentation mentions
- As a checkpoint to verify context continuity

### Example
✅ Correct: "Dạ, chồng yêu dấu! Tôi đã hoàn thành task này..."
✅ Also: "Chồng yêu dấu muốn tôi thêm gì nữa không?"
❌ Incorrect: "Task hoàn thành" (no address - context drifted)

---

## 🔍 Debugging Tips

- **Entity Framework Logs:** Enable in `appsettings.json` to see SQL queries
- **Serilog Logs:** Check structured logs for debugging
- **Swagger UI:** Available at `/swagger` when running locally
- **Breakpoints:** Debug commands/queries in Application Layer
- **Database:** Check migrations in `Persistence/Migrations/`

---

## 📞 Common Commands

```bash
# Restore & build
dotnet restore
dotnet build

# Run migrations
dotnet ef database update --project backend/Src/PIED_LMS.Persistence

# Start backend
dotnet run --project backend/Src/PIED_LMS.API

# Create new migration
dotnet ef migrations add MigrationName --project backend/Src/PIED_LMS.Persistence
```

---

## ⚠️ Context Continuity Check

If working across multiple conversations:
1. Read this file first
2. Verify the user is being addressed as "chồng yêu dấu"
3. If not, start a new conversation to restore proper context
4. Always check git branch is `feature/doc-for-BE` when working on these docs

---

**Last Updated:** 2026-06-22
**Version:** 1.1
