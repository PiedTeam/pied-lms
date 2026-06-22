# AGENTS-AntiGravity.md - Guide for AntiGravity Platform

This document describes how AntiGravity should orchestrate development workflows for this repository.

---

## 🤖 About AntiGravity

- **Platform:** AntiGravity - Multi-Agent Coding Platform
- **Role:** Orchestrator of multiple AI agents + automation + testing
- **Specialty:** End-to-end software development workflows, browser automation, UI testing

### Capabilities
✅ Orchestrate multiple AI agents
✅ Execute code (dotnet run, etc)
✅ Run tests (unit, integration, E2E)
✅ Browser automation & visual testing
✅ UI testing & validation
✅ Parallel task execution
✅ State management across agents
✅ Real-time feedback loops
✅ Full end-to-end workflows
✅ Deployment automation

### Strengths vs Single Agents
- **Multiple AI agents working together** → handle complex tasks
- **Code execution** → verify code actually works
- **Browser automation** → test UI changes visually
- **Real-time testing** → catch bugs before commit
- **Parallel workflows** → faster development

---

## 📖 Before Starting

**Read these files FIRST (in order):**
1. `AGENTS.md` — Shared patterns (architecture, exceptions, mapping, DO NOTs)
2. `architecture.md` — Backend structure & layers
3. `AGENTS-AntiGravity.md` — This file (AntiGravity-specific workflow)
4. `SETUP_GUIDE.md` — How to run the project
5. `useCase.md` — Business requirements

**Key Context for AntiGravity:**
- This is a .NET 10 + React LMS (Learning Management System)
- Backend uses Clean Architecture + CQRS
- Frontend is React-based (see frontend/ folder)
- Database is PostgreSQL (see SETUP_GUIDE.md)
- Local setup required before running code

---

## 🎯 AntiGravity Workflow Patterns

### Pattern 1: Feature Development (End-to-End)

```
1. PLANNING PHASE
   ├─ Agent A: Analyze requirements
   ├─ Agent B: Design database schema
   ├─ Agent C: Plan API endpoints
   └─ Orchestrator: Coordinate & resolve conflicts

2. BACKEND IMPLEMENTATION
   ├─ Agent A: Generate backend code (Commands, Queries, Handlers)
   ├─ Agent B: Generate validators & DTOs
   ├─ Agent C: Generate migrations & database updates
   └─ Orchestrator: Run migrations & verify DB integrity

3. TESTING & VERIFICATION
   ├─ Agent A: Run unit tests
   ├─ Agent B: Run integration tests (with real DB)
   ├─ Agent C: Start backend server & test via Swagger
   └─ Orchestrator: Verify API responses match contract

4. CODE REVIEW & REFINEMENT
   ├─ Agent A: Static code analysis
   ├─ Agent B: Check patterns compliance (AGENTS.md)
   ├─ Agent C: Verify exception handling
   └─ Orchestrator: Approve or iterate

5. COMMIT & DOCUMENTATION
   ├─ Agent A: Generate commit message
   ├─ Agent B: Update architecture.md if needed
   ├─ Agent C: Update API documentation
   └─ Orchestrator: Push to branch
```

### Pattern 2: Bug Fix (Rapid)

```
1. IDENTIFICATION
   ├─ Agent A: Reproduce bug from issue
   ├─ Agent B: Locate root cause in codebase
   └─ Orchestrator: Confirm layer & impact

2. FIX
   ├─ Agent A: Implement minimal fix
   ├─ Agent B: Run tests to verify fix
   ├─ Agent C: Check for regression in other features
   └─ Orchestrator: Validate all tests pass

3. COMMIT
   └─ Push fix to branch
```

### Pattern 3: Documentation Update

```
1. ANALYZE CURRENT STATE
   ├─ Agent A: Review existing documentation
   ├─ Agent B: Review actual code implementation
   └─ Orchestrator: Identify gaps/discrepancies

2. UPDATE
   ├─ Agent A: Write/update documentation
   ├─ Agent B: Add code examples from actual repo
   └─ Orchestrator: Verify documentation is accurate

3. COMMIT
   └─ Push documentation changes
```

### Pattern 4: Database Migration

```
1. DESIGN PHASE
   ├─ Agent A: Analyze current schema
   ├─ Agent B: Design schema changes
   └─ Orchestrator: Validate against business rules

2. IMPLEMENTATION
   ├─ Agent A: Create EF Core migration
   ├─ Agent B: Run migration on test DB
   ├─ Agent C: Verify data integrity
   └─ Orchestrator: Check backward compatibility

3. TESTING
   ├─ Agent A: Run integration tests
   ├─ Agent B: Test edge cases (large datasets, etc)
   └─ Orchestrator: Approve migration

4. COMMIT
   └─ Push migration + any code changes
```

---

## 🔄 Agent Coordination Rules

### Agent Roles in AntiGravity

**Agent A (Analysis & Design):**
- Read architecture & requirements
- Plan implementation
- Design APIs & schemas
- Code review
- Do NOT directly modify code without approval

**Agent B (Implementation & Testing):**
- Write code based on Agent A's plan
- Run tests & verify functionality
- Report issues back to Agent A
- Iterate until tests pass

**Agent C (Documentation & Integration):**
- Update documentation
- Verify integration between layers
- Check compliance with AGENTS.md
- Ensure logging is appropriate

**Orchestrator (Coordination):**
- Coordinate between agents
- Manage state & decisions
- Handle conflicts
- Make go/no-go decisions
- Execute final commits & pushes

### Communication Pattern

```
Orchestrator: "Agent A, analyze the requirement"
Agent A: "Plan: Create Course entity with X fields, need DB migration"
Orchestrator: "Agent B, implement based on plan"
Agent B: "Done. Tests passing. 3 DB changes needed"
Orchestrator: "Agent C, create migration & update docs"
Agent C: "Migration created. Schema docs updated"
Orchestrator: "All good. Committing..."
```

### Conflict Resolution

**If agents disagree:**
1. Orchestrator calls for evidence/reasoning
2. Reference AGENTS.md for patterns
3. Reference architecture.md for layers
4. Make decision based on project guidelines
5. Proceed with approved approach

---

## 🛠️ Execution Checklist

### Before Running Code

- [ ] `dotnet restore` successful
- [ ] Database connection string correct (appsettings.json)
- [ ] Migrations up-to-date (`dotnet ef database update`)
- [ ] No syntax errors
- [ ] All dependencies installed

### During Code Execution

- [ ] Capture full output (success & errors)
- [ ] Note any warnings
- [ ] Verify actual behavior vs expected
- [ ] Take screenshots/recordings if UI involved
- [ ] Log all commands executed

### After Code Execution

- [ ] All tests passed ✅
- [ ] No new warnings/errors ✅
- [ ] Expected behavior verified ✅
- [ ] No regressions in other features ✅
- [ ] Ready to commit

---

## 🌐 Browser Automation & UI Testing

### Capability

AntiGravity can automate browser testing:
- Start React frontend (`npm start`)
- Navigate to pages
- Interact with UI (click, type, submit)
- Verify visual changes
- Capture screenshots
- Test end-to-end flows

### When to Use

✅ **Use browser automation for:**
- Verifying UI changes actually render
- Testing form submissions end-to-end
- Testing navigation flows
- Validating error messages display
- Screenshot for documentation

❌ **Don't use browser automation for:**
- Unit testing (use Jest/xUnit)
- API testing (use HTTP tests)
- Performance testing (use profiler)
- All requests should be covered by API tests first

### Example Flow

```
Backend: API is ready (Swagger at /swagger)
Frontend: React app running
AntiGravity: 
  1. Open browser to http://localhost:3000/courses
  2. Click "Create Course" button
  3. Fill form: Title="Test Course", Description="..."
  4. Submit form
  5. Verify course appears in list
  6. Take screenshot
  7. Report: "✅ Create course flow works"
```

---

## 📊 Testing Strategy (AntiGravity Context)

### Layer-by-Layer Testing

**1. Database Layer (EF Core)**
- Test migrations create correct schema
- Test migrations rollback cleanly
- Run with test database

**2. Application Layer (Handlers)**
- Unit tests for business logic
- Test all branches (success, error, edge cases)
- Mock repositories for isolation

**3. API Layer (Endpoints)**
- Integration tests with real DB
- Test HTTP status codes
- Test request/response contracts
- Test validation errors

**4. UI Layer (React)**
- Component tests
- Integration tests
- E2E tests via browser automation

### Testing Order

```
1. Run unit tests (fast, in-memory)
   dotnet test backend/Src/PIED_LMS.Tests/

2. Run integration tests (real DB)
   dotnet test --filter "Category=Integration"

3. Start backend server
   dotnet run --project backend/Src/PIED_LMS.API

4. Test API via Swagger
   http://localhost:5001/swagger

5. Start frontend
   cd frontend && npm start

6. Run UI tests via browser automation
   (Screenshot verification, flow testing)
```

---

## 📋 Complete Feature Development Workflow

**Goal:** Add new "Quiz" feature to LMS

### Step 1: Planning (Agent A)
- Analyze existing patterns (Course, Exam features)
- Design Quiz entity schema
- Plan API endpoints (/api/quizzes, POST/GET/PUT/DELETE)
- Create detailed implementation plan

### Step 2: Database (Agent C)
- Review plan
- Create EF Core migration
- Run migration on local DB
- Verify schema

### Step 3: Backend - Commands (Agent B)
- Generate CreateQuizCommand + Handler + Validator
- Generate UpdateQuizCommand + Handler + Validator
- Generate DeleteQuizCommand + Handler
- All follow AGENTS.md patterns

### Step 4: Backend - Queries (Agent B)
- Generate GetQuizByIdQuery + Handler
- Generate GetAllQuizzesQuery + Handler
- Include proper navigation properties (Include())
- All with mapping methods

### Step 5: Backend - DTOs (Agent B)
- Create QuizDto, QuizDetailDto
- Create QuizRequest, UpdateQuizRequest
- Use record types

### Step 6: Backend - Endpoints (Agent B)
- Create QuizzesEndpoints class
- MapGet, MapPost, MapPut, MapDelete
- All routes documented with WithOpenApi()
- Proper error responses

### Step 7: Testing (Agent B)
- Start backend: `dotnet run --project backend/Src/PIED_LMS.API`
- Test via Swagger UI
- Test all endpoints (happy path + error cases)
- Verify database changes persist

### Step 8: Code Review (Agent A)
- Review all generated code
- Check patterns compliance
- Verify exception handling
- Check mapping is correct
- Approve or request changes

### Step 9: Documentation (Agent C)
- Update architecture.md if needed
- Update API documentation
- Add examples

### Step 10: Commit (Orchestrator)
- Stage files
- Create commit message
- Push to branch
- Ready for PR

### Timeline: ~1-2 hours for simple feature

---

## ⚠️ Critical Rules for AntiGravity

### DO

✅ **DO coordinate between agents**
- Always have one agent lead decision
- Other agents provide input/feedback
- Orchestrator makes final calls

✅ **DO test execution frequently**
- After each phase, verify code works
- Run actual commands, not just "assume"
- Use real database for integration tests

✅ **DO follow AGENTS.md patterns**
- Every generated code must comply
- Every decision must be justified by patterns
- If pattern is missing, add to AGENTS.md

✅ **DO handle failures gracefully**
- If test fails, identify root cause
- Fix the bug, don't ignore it
- Re-run until passing

✅ **DO document as you go**
- Update architecture.md proactively
- Add examples as code is written
- Keep docs in sync with code

### DON'T

❌ **DON'T assume code works without testing**
- Always execute & verify
- Don't skip database migrations
- Don't skip test runs

❌ **DON'T have conflicting instructions**
- All agents must read AGENTS.md
- All agents must follow same patterns
- Conflicts resolved by Orchestrator

❌ **DON'T break existing features**
- Test for regressions
- Verify all existing tests still pass
- Check related features still work

❌ **DON'T commit untested code**
- Everything must pass tests
- Everything must be verified
- No "we'll fix it later"

---

## 🎯 Success Metrics for AntiGravity

A task is complete when:
- ✅ All code follows AGENTS.md patterns
- ✅ All tests pass (unit, integration, E2E)
- ✅ Database migrations run successfully
- ✅ API endpoints work via Swagger
- ✅ UI changes verified (if applicable)
- ✅ Documentation updated
- ✅ Code reviewed by Agent A
- ✅ Ready to commit & push

---

## 📞 Example AntiGravity Task

**Input:**
```
Add ability to filter courses by difficulty level (Easy, Medium, Hard).
Need to:
- Add DifficultyLevel to Course entity
- Create database migration
- Update GetAllCourses query to support filtering
- Update CourseEndpoints to accept ?difficulty=Easy parameter
- Test via Swagger
```

**AntiGravity Workflow:**
1. Agent A: Design schema changes & query filters
2. Agent C: Create migration
3. Agent B: Update GetAllCoursesQuery & validation
4. Agent B: Update CourseEndpoints with new parameter
5. Agent B: Run `dotnet run` & test via Swagger
6. Agent A: Review code for compliance
7. Agent C: Update architecture.md
8. Orchestrator: Commit & push

**Output:** 
- Code merged to feature branch
- All tests passing
- Swagger shows new filter parameter
- Documentation updated

---

**Last Updated:** 2026-06-22
**For:** AntiGravity Platform
**Version:** 1.0
