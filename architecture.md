# Backend Architecture Documentation

## Overview

Pied LMS Backend follows **Clean Architecture** principles with **CQRS (Command Query Responsibility Segregation)** pattern using MediatR. The API uses **Minimal APIs** instead of traditional Controllers.

## Project Structure

```
backend/
├── Src/
│   ├── PIED_LMS.API/                 # API Host & DI Configuration
│   ├── PIED_LMS.Presentation/        # Minimal API Endpoints (User-facing layer)
│   ├── PIED_LMS.Application/         # Use Cases - Commands & Queries
│   ├── PIED_LMS.Contract/            # DTOs & Response Models
│   ├── PIED_LMS.Domain/              # Domain Entities & Business Logic
│   ├── PIED_LMS.Infrastructure/      # External Services (Email, etc.)
│   └── PIED_LMS.Persistence/         # Database Context & Repositories
└── monitoring/                        # Prometheus & Grafana configs
```

## Layer Breakdown

### 1. PIED_LMS.API
**Purpose:** Application startup & dependency injection configuration

**Key Files:**
- `Program.cs` - Bootstraps the application, configures services, runs migrations
- `DependencyInjection.cs` - Registers API-specific services
- `Filters/` - Swagger/OpenAPI filters for documentation
- `Middlewares/GlobalExceptionHandler.cs` - Global exception handling

**Responsibilities:**
- Application startup
- Service registration
- Configuration setup
- Middleware pipeline

### 2. PIED_LMS.Presentation
**Purpose:** API endpoints definition using Minimal APIs pattern

**Structure:**
```
Presentation/
├── APIs/
│   ├── AdminEndpoints.cs
│   ├── AuthenticationEndpoints.cs
│   ├── CourseEndpoints.cs
│   ├── EnrollmentEndpoints.cs
│   ├── ExamEndpoints.cs
│   ├── QuestionEndpoints.cs
│   ├── StudentSubmissionEndpoints.cs
│   └── [FeatureEndpoints.cs]
├── Abstractions/
│   └── ApiEndpoint.cs              # Base class for endpoints
├── Extensions/
│   ├── EndpointExtensions.cs       # Extension methods for routing
│   └── OpenApiConventionExtensions.cs
└── GlobalUsings.cs
```

**Pattern:**
- Each feature has a corresponding `[Feature]Endpoints.cs` class
- Endpoints inherit from `ApiEndpoint` base class
- No traditional Controllers - routes are minimal

**Example Structure:**
```csharp
public class CourseEndpoints : ApiEndpoint
{
    public void MapEndpoints(WebApplication app)
    {
        var group = app.MapGroup("/api/courses")
            .WithTags("Courses")
            .WithOpenApi();
        
        group.MapGet("/", GetCourses);
        group.MapPost("/", CreateCourse);
    }
}
```

### 3. PIED_LMS.Application
**Purpose:** Business logic & use case handlers using CQRS pattern

**Structure:**
```
Application/
├── UserCases/
│   ├── Commands/
│   │   ├── Auth/
│   │   ├── Course/
│   │   ├── Enrollment/
│   │   ├── Exam/
│   │   ├── Question/
│   │   └── [Feature]/
│   ├── Queries/
│   │   ├── Course/
│   │   ├── Enrollment/
│   │   ├── Exam/
│   │   ├── Question/
│   │   └── [Feature]/
├── Abstractions/        # Base interfaces
├── Behaviors/           # Pipeline behaviors (validation, logging)
├── Exceptions/          # Application exceptions
├── Options/             # Configuration options
├── Utilities/           # Helper functions
├── DependencyInjection.cs
└── GlobalUsings.cs
```

**Patterns:**

**Commands (Write Operations):**
- Modify state in the database
- Located in `UserCases/Commands/[Feature]/`
- Example: `CreateCourseCommand.cs`
- Handler: `CreateCourseCommandHandler.cs`
- Response: `CreateCourseCommandResponse.cs`

**Queries (Read Operations):**
- Retrieve data without side effects
- Located in `UserCases/Queries/[Feature]/`
- Example: `GetCourseByIdQuery.cs`
- Handler: `GetCourseByIdQueryHandler.cs`
- Response: Direct entity or DTO

**Behaviors:**
- Cross-cutting concerns like validation
- Located in `Behaviors/`
- Example: `ValidationBehavior.cs` validates commands/queries

**Registration (DependencyInjection.cs):**
```csharp
public static IServiceCollection AddApplicationServices(this IServiceCollection services)
{
    services.AddValidatorsFromAssembly(typeof(Contract.AssemblyReference).Assembly);
    
    services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssembly(typeof(ApplicationExtensions).Assembly);
        cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
    });
    
    return services;
}
```

### 4. PIED_LMS.Contract
**Purpose:** Shared DTOs and response models

**Structure:**
```
Contract/
├── [Feature]/
│   ├── [Feature]Response.cs         # DTO for responses
│   ├── Create[Feature]Request.cs    # DTO for create requests
│   ├── Update[Feature]Request.cs    # DTO for update requests
│   └── [Feature]Detail.cs
├── Common/
│   └── PaginationResult.cs          # Pagination wrapper
├── AssemblyReference.cs
└── GlobalUsings.cs
```

### 5. PIED_LMS.Domain
**Purpose:** Core domain entities and business logic

**Structure:**
```
Domain/
├── Entities/
│   ├── Course.cs
│   ├── User.cs
│   ├── Exam.cs
│   ├── Question.cs
│   └── [Feature].cs
├── Enums/
│   └── [DomainEnum].cs
├── ValueObjects/
│   └── [ValueObject].cs
├── Aggregates/
│   └── [AggregateRoot].cs
├── Exceptions/
│   └── [DomainException].cs
├── AssemblyReference.cs
└── GlobalUsings.cs
```

**Rules:**
- Contains pure domain logic
- No database dependencies
- Entity validation & invariants
- No external service calls

### 6. PIED_LMS.Persistence
**Purpose:** Database access & repository pattern

**Structure:**
```
Persistence/
├── PiedLmsDbContext.cs              # Entity Framework DbContext
├── Migrations/
│   ├── [YearMonthDay_Migration].cs
│   └── PiedLmsDbContextModelSnapshot.cs
├── Repositories/
│   ├── BaseRepository.cs            # Generic repository
│   ├── UnitOfWork.cs                # Unit of Work pattern
│   └── [Feature]Repository.cs
├── Seeders/
│   └── DbInitializer.cs             # Database seeding
├── DependencyInjection.cs
├── GlobalUsings.cs
└── appsettings.json                 # Database connection
```

**Database Setup (Program.cs):**
```csharp
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var dbContext = services.GetRequiredService<PiedLmsDbContext>();
    await dbContext.Database.MigrateAsync();    // Run migrations
    await DbInitializer.SeedAsync(services);    // Seed data
}
```

### 7. PIED_LMS.Infrastructure
**Purpose:** External services & cross-cutting concerns

**Structure:**
```
Infrastructure/
├── Services/
│   ├── [ExternalService].cs
│   ├── Email/
│   ├── JWT/
│   └── [Feature]Service.cs
├── DependencyInjection.cs
├── GlobalUsings.cs
└── appsettings.json
```

## Data Flow

### Write Flow (Command)
```
1. Client → Presentation Layer (Endpoint)
2. Endpoint → Application Layer (Command Handler via MediatR)
3. Command Handler → Domain Layer (Validate business rules)
4. Domain → Persistence Layer (Save to database)
5. Response → Client
```

### Read Flow (Query)
```
1. Client → Presentation Layer (Endpoint)
2. Endpoint → Application Layer (Query Handler via MediatR)
3. Query Handler → Persistence Layer (Fetch from database)
4. Format & Return → Client
```

## Naming Conventions

### Files & Folders
- **Folders:** PascalCase (e.g., `CourseEndpoints`, `CreateCourseCommand`)
- **Files:** PascalCase for entities, PascalCase for commands/queries
- **Namespaces:** Follow folder structure (e.g., `PIED_LMS.Application.UserCases.Commands.Course`)

### Classes
- **Commands:** `[Action][Entity]Command` (e.g., `CreateCourseCommand`)
- **Command Handlers:** `[Action][Entity]CommandHandler` (e.g., `CreateCourseCommandHandler`)
- **Queries:** `Get[Entity]Query` (e.g., `GetCourseByIdQuery`)
- **Query Handlers:** `Get[Entity]QueryHandler`
- **Endpoints:** `[Feature]Endpoints` (e.g., `CourseEndpoints`)
- **Repositories:** `[Entity]Repository` or `[Feature]Repository`
- **Services:** `[Feature]Service` (e.g., `EmailService`)
- **Exceptions:** `[Feature]Exception` (e.g., `CourseNotFoundException`)

### Methods
- **Command Handlers:** `Handle(TCommand command, CancellationToken ct)`
- **Query Handlers:** `Handle(TQuery query, CancellationToken ct)`
- **Endpoints:** `MapEndpoints(WebApplication app)` and individual route methods
- **Repository:** `Get[Entity](id)`, `Add[Entity]()`, `Update[Entity]()`, `Delete[Entity]()`

## Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | .NET 10 | Backend framework |
| API Pattern | Minimal APIs | Lightweight API routing |
| Database | Entity Framework Core | ORM & migrations |
| CQRS | MediatR | Command/Query pattern |
| Validation | FluentValidation | Input validation |
| Logging | Serilog | Structured logging |
| Monitoring | Prometheus & Grafana | Performance monitoring |
| API Documentation | Swagger/OpenAPI | Interactive API docs |
| Authentication | JWT | Token-based auth |

## Common Patterns

### 1. Creating a New Feature

**Step 1:** Create Domain Entity (Domain/Entities/[Feature].cs)
```csharp
public class MyFeature : BaseEntity
{
    public string Name { get; set; }
    public string Description { get; set; }
}
```

**Step 2:** Create DTOs (Contract/[Feature]/[Feature]Response.cs)
```csharp
public class MyFeatureResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; }
}
```

**Step 3:** Create Command/Query (Application/UserCases/Commands/[Feature]/Create[Feature]Command.cs)
```csharp
public record CreateMyFeatureCommand(string Name, string Description) : ICommand<CreateMyFeatureCommandResponse>;

public class CreateMyFeatureCommandHandler : ICommandHandler<CreateMyFeatureCommand, CreateMyFeatureCommandResponse>
{
    public async Task<CreateMyFeatureCommandResponse> Handle(CreateMyFeatureCommand request, CancellationToken cancellationToken)
    {
        // Business logic here
        return new CreateMyFeatureCommandResponse();
    }
}
```

**Step 4:** Create Endpoint (Presentation/APIs/[Feature]Endpoints.cs)
```csharp
public class MyFeatureEndpoints : ApiEndpoint
{
    public void MapEndpoints(WebApplication app)
    {
        var group = app.MapGroup("/api/my-features")
            .WithTags("MyFeature")
            .WithOpenApi();
        
        group.MapPost("/", CreateMyFeature);
    }
    
    private async Task<IResult> CreateMyFeature(IMediator mediator, CreateMyFeatureRequest request)
    {
        var command = new CreateMyFeatureCommand(request.Name, request.Description);
        var result = await mediator.Send(command);
        return Results.Created($"/api/my-features/{result.Id}", result);
    }
}
```

**Step 5:** Register Endpoint (in Program.cs or auto-discovery if implemented)

### 2. Exception Handling

**Domain Exception:**
```csharp
public class CourseNotFoundException : DomainException
{
    public CourseNotFoundException(Guid id) 
        : base($"Course with id {id} not found") { }
}
```

**Global Handler (Middlewares/GlobalExceptionHandler.cs):**
- Catches all exceptions
- Returns standardized error response
- Logs errors via Serilog

### 3. Validation

**FluentValidation Validator:**
```csharp
public class CreateCourseCommandValidator : AbstractValidator<CreateCourseCommand>
{
    public CreateCourseCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(255);
        RuleFor(x => x.Description).NotEmpty();
    }
}
```

**Automatic Pipeline Behavior:**
- MediatR `ValidationBehavior` runs before each handler
- Returns validation errors if any

## Configuration

### appsettings.json Structure
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=...;Database=pied_lms;..."
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  },
  "Serilog": {
    "MinimumLevel": "Information"
  },
  "JwtSettings": {
    "SecretKey": "...",
    "ExpirationMinutes": 60
  }
}
```

## Running the Backend

```bash
# Restore dependencies
dotnet restore

# Run migrations
dotnet ef database update

# Start the server
dotnet run --project backend/Src/PIED_LMS.API

# API available at: https://localhost:5001
# Swagger UI: https://localhost:5001/swagger
```

## Monitoring

- **Prometheus Metrics:** Exposed at `/metrics`
- **Grafana Dashboards:** Configured in `backend/monitoring/grafana/dashboards/`
- **Logging:** Centralized via Serilog

---

**Last Updated:** 2026-06-22
