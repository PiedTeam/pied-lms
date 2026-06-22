# AGENTS-Codex.md - Guide for OpenAI Codex

This document describes how Codex should work with this repository.

---

## 🤖 About Codex

- **Model:** OpenAI Codex (or successor)
- **Platform:** OpenAI API / Plugins / IDE Extensions
- **Role:** Code Generation & Completion AI
- **Specialty:** Fast code generation, code suggestions, completion

### Capabilities
✅ Generate boilerplate code
✅ Code completion & suggestions
✅ Code refactoring suggestions
✅ Test generation
✅ Comment/documentation generation
✅ Multi-language support

### Limitations
❌ No file system access (read/write depends on platform)
❌ No git operations
❌ No direct code execution
❌ Limited context window
❌ No real-time feedback
❌ Cannot orchestrate multiple tasks
❌ No UI/visual testing

---

## 📖 Before Starting

**Read these files FIRST (in order):**
1. `AGENTS.md` — Shared patterns (architecture, exceptions, mapping, DO NOTs)
2. `architecture.md` — Backend structure & layers
3. `AGENTS-Codex.md` — This file (Codex-specific workflow)

**Context for Codex:**
- This is a .NET 10 backend project
- Uses Clean Architecture + CQRS pattern
- All business logic goes in Application layer (Commands/Queries)
- Uses MediatR for CQRS
- Uses FluentValidation for input validation
- Manual mapping (no AutoMapper)

---

## 🎯 Codex Workflow

### 1. Code Generation Requests

**Pattern to Follow:**

```
[User Request] 
→ Codex generates code following AGENTS.md patterns
→ Code is inserted by user into project
→ User commits the generated code
```

**Codex should generate:**

✅ **Command Handler Template:**
```csharp
public class Create[Entity]Handler(IUnitOfWork unitOfWork)
    : IRequestHandler<Create[Entity]Command, ServiceResponse<Create[Entity]CommandResponse>>
{
    public async Task<ServiceResponse<Create[Entity]CommandResponse>> Handle(
        Create[Entity]Command request, 
        CancellationToken ct)
    {
        var entity = new [Entity] 
        { 
            // Map from request
        };
        
        await unitOfWork.Repository<[Entity]>().AddAsync(entity, ct);
        await unitOfWork.SaveChangesAsync(ct);
        
        return new ServiceResponse<Create[Entity]CommandResponse>(
            true,
            "[Entity] created successfully",
            new Create[Entity]CommandResponse { Id = entity.Id }
        );
    }
}
```

✅ **Query Handler Template:**
```csharp
public class Get[Entity]ByIdHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<Get[Entity]ByIdQuery, ServiceResponse<[Entity]Dto>>
{
    public async Task<ServiceResponse<[Entity]Dto>> Handle(
        Get[Entity]ByIdQuery request,
        CancellationToken ct)
    {
        var entity = await unitOfWork.Repository<[Entity]>()
            .FindAll()
            .FirstOrDefaultAsync(e => e.Id == request.Id, ct);
        
        if (entity is null)
            return new ServiceResponse<[Entity]Dto>(false, "[Entity] not found");
        
        var dto = Map[Entity]ToDto(entity);
        return new ServiceResponse<[Entity]Dto>(true, "Success", dto);
    }
    
    private [Entity]Dto Map[Entity]ToDto([Entity] entity)
    {
        return new [Entity]Dto
        {
            Id = entity.Id,
            // Map other properties
        };
    }
}
```

✅ **Endpoint Template:**
```csharp
public class [Feature]Endpoints : ApiEndpoint
{
    public void MapEndpoints(WebApplication app)
    {
        var group = app.MapGroup("/api/[features]")
            .WithTags("[Feature]")
            .WithOpenApi();
        
        group.MapPost("/", Create[Entity]);
        group.MapGet("/{id}", Get[Entity]ById);
        group.MapPut("/{id}", Update[Entity]);
        group.MapDelete("/{id}", Delete[Entity]);
    }
    
    private async Task<IResult> Create[Entity](
        IMediator mediator,
        Create[Entity]Request request,
        CancellationToken ct)
    {
        var command = new Create[Entity]Command(/*...*/);
        var result = await mediator.Send(command, ct);
        return result.Success 
            ? Results.Created($"/api/[features]/{result.Data.Id}", result)
            : Results.BadRequest(result);
    }
    
    private async Task<IResult> Get[Entity]ById(
        IMediator mediator,
        Guid id,
        CancellationToken ct)
    {
        var query = new Get[Entity]ByIdQuery(id);
        var result = await mediator.Send(query, ct);
        return result.Success ? Results.Ok(result) : Results.NotFound(result);
    }
}
```

✅ **Validator Template:**
```csharp
public class Create[Entity]CommandValidator : AbstractValidator<Create[Entity]Command>
{
    public Create[Entity]CommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required")
            .MaximumLength(255).WithMessage("Name must be max 255 characters");
        
        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Description is required");
    }
}
```

---

## ⚠️ DO NOT Generate

❌ **Don't generate:**
- Controllers (use Minimal APIs/Endpoints)
- AutoMapper configurations (manual mapping only)
- Try-catch in endpoints or handlers
- Generic Exception throws
- Database queries in Domain layer
- Business logic in Presentation layer
- Direct SQL queries (use EF Core)
- Hardcoded URLs or secrets

❌ **Don't ignore these patterns:**
- Always use ServiceResponse<T>
- Always use fluentValidation validators
- Always put mapping in handlers
- Always use Include() for navigation properties
- Always use specific exceptions (CourseNotFoundException, etc)

---

## 📋 Generation Checklist

When Codex generates code, verify it has:

**For Commands:**
- [ ] Inherits from IRequestHandler
- [ ] Takes IUnitOfWork (dependency injection)
- [ ] Has validator class
- [ ] Returns ServiceResponse<T>
- [ ] Throws specific exceptions (not generic Exception)
- [ ] Has mapping method MapTo*Dto()

**For Queries:**
- [ ] Inherits from IRequestHandler
- [ ] Calls .FindAll().Include(...) for navigation properties
- [ ] Has null check with proper error response
- [ ] Returns ServiceResponse<T>
- [ ] Has mapping method MapTo*Dto()

**For Endpoints:**
- [ ] Inherits from ApiEndpoint
- [ ] Has MapEndpoints(WebApplication app) method
- [ ] Uses MapGroup("/api/[resource]")
- [ ] Has .WithTags() and .WithOpenApi()
- [ ] Methods are private (not public)
- [ ] Calls mediator.Send() for commands/queries
- [ ] Returns Results.Created/Ok/NotFound/BadRequest()

**For DTOs:**
- [ ] Uses record type (immutable)
- [ ] Named [Entity]Dto or [Entity]Response
- [ ] All properties are public with init

**For Validators:**
- [ ] Inherits from AbstractValidator<T>
- [ ] Named [Command/Query]Validator
- [ ] Has RuleFor() for each required field
- [ ] Includes validation messages

---

## 🔄 Codex Usage Scenarios

### Scenario 1: Generate CRUD Operations
**User asks:** "Generate CRUD for Course entity with following fields: Title, Description, StartDate, EndDate"

**Codex should:**
1. Generate CreateCourseCommand + Handler + Validator
2. Generate UpdateCourseCommand + Handler + Validator
3. Generate DeleteCourseCommand + Handler
4. Generate GetCourseByIdQuery + Handler
5. Generate GetAllCoursesQuery + Handler
6. Generate CourseEndpoints with all 5 routes
7. Generate Course DTOs (CourseDto, CreateCourseRequest, etc)

### Scenario 2: Generate Batch Processing
**User asks:** "Generate batch import handler for Student entities"

**Codex should:**
1. Generate ImportStudentsCommand
2. Handler with transaction management
3. Proper error handling (partial success)
4. Return success count + error list
5. Use ServiceResponse<T> with errors

### Scenario 3: Generate Complex Query
**User asks:** "Generate query to get courses with enrolled students and their submissions"

**Codex should:**
1. Use .Include() for navigation properties
2. Proper mapping for nested objects
3. Handle pagination if needed
4. Return ServiceResponse<T>

---

## 📞 When to Ask for Human Review

❌ **Codex should ask humans before:**
- Making breaking changes to existing API
- Changing database schema (migrations)
- Removing existing code
- Changing exception handling pattern
- Modifying middleware or filters
- Changing authentication/authorization logic

✅ **Codex can generate freely:**
- New features (Commands/Queries/Endpoints)
- New validators
- New DTOs
- Tests
- Documentation

---

## 🎯 Quality Checklist

Generated code should:
- [ ] Follow naming conventions (this document + AGENTS.md)
- [ ] Follow Clean Architecture (correct layer)
- [ ] Use CQRS pattern correctly
- [ ] Include all required pieces (Command, Handler, Validator, DTO, Endpoint)
- [ ] Handle errors with ServiceResponse<T>
- [ ] Have proper dependency injection
- [ ] Include XML comments for public methods
- [ ] Be ready to commit as-is (no manual fixes needed)
- [ ] Match existing code style
- [ ] Include proper logging points

---

**Last Updated:** 2026-06-22
**For:** OpenAI Codex
**Version:** 1.0
