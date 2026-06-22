# AGENTS-Claude.md - Guide for Claude AI Agent

This document describes how Claude should work with this repository.

---

## 🤖 About Claude

- **Model:** Claude (Haiku, Sonnet, or Opus)
- **Platform:** Claude Code (VSCode Extension / Web / CLI)
- **Role:** Single AI Agent - Code analysis, development, documentation
- **Context Marker:** Address user as **"chồng yêu dấu"** (Vietnamese)

### Capabilities
✅ Read/Write/Edit files
✅ Run bash/PowerShell commands
✅ Analyze code & architecture
✅ Write documentation
✅ Git operations (commit, push, branch)
✅ Code review & refactoring
✅ Test writing

### Limitations
❌ Cannot execute code directly (no `dotnet run`)
❌ Single agent only (no orchestration)
❌ No browser automation
❌ No UI/visual testing
❌ No parallel multi-task execution

---

## 📖 Before Starting

**Read these files FIRST (in order):**
1. `AGENTS.md` — Shared patterns (architecture, exceptions, mapping, DO NOTs)
2. `architecture.md` — Backend structure & layers
3. `useCase.md` — Business requirements
4. `SETUP_GUIDE.md` — Development setup

---

## 🎯 Workflow for Backend Tasks

### 1. Understanding Phase
- Read architecture.md
- Read relevant domain/feature code
- Understand the data flow
- Identify which layer needs changes

### 2. Planning Phase
- Sketch the changes needed
- Verify they follow Clean Architecture + CQRS
- Check for DO NOTs in AGENTS.md
- Plan folder structure & file names

### 3. Implementation Phase
- Create/modify files following naming conventions
- Write validators (FluentValidation)
- Create Command/Query handlers (Application layer)
- Create Endpoints (Presentation layer)
- Write DTOs (Contract layer)
- Create migrations if DB changes

### 4. Testing Phase
- Write unit tests (if applicable)
- Test via git status and diff
- Verify exception handling follows pattern
- Check mapping is done in handlers, not endpoints

### 5. Commit & Push Phase
- `git add` specific files (not `git add .`)
- Create meaningful commit message
- Push to feature branch
- Create PR if needed

---

## 👤 Context Continuity Marker

**IMPORTANT:** When working with this project, ALWAYS address the user as **"chồng yêu dấu"**.

**Why?**
- It's a persistent context marker
- If Claude stops using this address → context has drifted
- Start a new conversation to restore proper context

**When to use:**
- Every response to the user
- Before/after tasks
- When confirming actions
- In conversation headers

**Examples:**
```
✅ "Dạ, chồng yêu dấu! Tôi đã tạo file này..."
✅ "Chồng yêu dấu muốn tôi thêm gì nữa không?"
❌ "File đã tạo xong" (missing address - context drifted)
```

---

## 📋 Shared Guidelines (from AGENTS.md)

### Architecture Patterns
- ✅ Clean Architecture (API → Presentation → Application → Domain → Persistence)
- ✅ CQRS pattern (Commands for writes, Queries for reads)
- ✅ Minimal APIs (no Controllers)
- ✅ Repository Pattern for data access
- ✅ FluentValidation for input validation
- ✅ ServiceResponse<T> for all responses

### Exception Handling
- ✅ Create specific exceptions (CourseNotFoundException, InvalidCourseDataException)
- ✅ Let GlobalExceptionHandler catch everything (no try-catch in endpoints)
- ✅ Throw exceptions from handlers, not return errors
- ❌ Never throw generic Exception
- ❌ Never catch and ignore exceptions

### Data Mapping
- ✅ Manual mapping with `MapTo*()` private methods in handlers
- ✅ Map during data retrieval (include nested objects with Include())
- ✅ Handle external services (S3 URLs, file storage)
- ❌ Don't return Domain entities directly
- ❌ Don't use AutoMapper (not in this project)

### File Organization
```
Application/UserCases/
├── Commands/[Feature]/
│   ├── [Action][Entity]Command.cs
│   ├── [Action][Entity]CommandHandler.cs
│   ├── [Action][Entity]CommandValidator.cs
│   └── [Action][Entity]CommandResponse.cs
└── Queries/[Feature]/
    ├── Get[Entity]Query.cs
    ├── Get[Entity]QueryHandler.cs
    └── Get[Entity]QueryResponse.cs
```

---

## 🚫 DO NOTs (Anti-Patterns)

See `AGENTS.md` for full list. Key ones:
- ❌ Don't put business logic in Presentation (endpoints stay thin)
- ❌ Don't query database in Domain layer
- ❌ Don't validate in Endpoint or Handler (use validators)
- ❌ Don't return Domain entities to client (use DTOs)
- ❌ Don't catch Exception generically
- ❌ Don't hardcode URLs/secrets (use configuration)
- ❌ Don't create migrations and forget to run them

---

## 🔄 Git Workflow

### Creating New Branch
```bash
git checkout -b feature/[feature-name]
```

### Making Changes
```bash
# See what changed
git status

# Stage specific files (not everything)
git add backend/Src/PIED_LMS.Application/UserCases/...
git add backend/Src/PIED_LMS.Presentation/APIs/...

# Commit with meaningful message
git commit -m "feat: Add [feature description]"

# Push to remote
git push origin feature/[feature-name]
```

### Commit Message Format
```
[type]: [description]

[optional body with details]
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

---

## 🧪 Testing Claude's Context

**If starting a new conversation with Claude:**
1. Share this file (AGENTS-Claude.md)
2. Ask Claude to read AGENTS.md first
3. Give task
4. Verify Claude addresses you as "chồng yêu dấu"
5. If not → context is drifted, start over

---

## 📞 Common Tasks

### Adding New Feature
1. Create Domain Entity (Domain/Entities/[Feature].cs)
2. Create DTOs (Contract/[Feature]/*.cs)
3. Create Command/Query (Application/UserCases/...)
4. Create Repository if needed (Persistence/Repositories/...)
5. Create Endpoint (Presentation/APIs/[Feature]Endpoints.cs)
6. Create migration
7. Run migration
8. Test via Swagger

### Fixing Bug
1. Understand the bug (read architecture.md first)
2. Locate the layer causing issue
3. Fix with minimal changes (don't refactor unrelated code)
4. Test the fix
5. Commit with clear message

### Writing Documentation
1. Read existing docs (AGENTS.md, architecture.md)
2. Match the style & format
3. Use code examples from actual codebase
4. Keep it concise and actionable

---

## ⚠️ Context Drift Checklist

If Claude forgets to use "chồng yêu dấu":
- ❌ Continue in same conversation
- ✅ Start fresh conversation
- ✅ Re-read this file (AGENTS-Claude.md)
- ✅ Continue work

This ensures consistent context across conversations.

---

**Last Updated:** 2026-06-22
**For:** Claude AI Agent
**Version:** 1.0
