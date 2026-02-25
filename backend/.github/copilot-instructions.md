# 📜 Universal Clean Code Guidelines

Goal: Code must be readable, maintainable, testable, and extensible. Write for humans first, compilers second.

## 1. Core Principles

- **Readability > Cleverness:** Avoid complex one-liners (e.g., nested ternary, obscure regex) unless significantly more performant.
- **KISS:** Choose the simplest solution that satisfies the requirement. Avoid over-engineering.
- **YAGNI:** Do not build features you do not need yet.
- **Boy Scout Rule:** Always leave the code cleaner than you found it.
- **Idiomatic Style:** Follow the standard conventions of the specific language (e.g., PEP 8 for Python, Standard Go Project Layout for Go, Microsoft Guidelines for C#).

## 2. Naming & Intent

- **Intent-Revealing Names:** Describe what a variable or function represents, not how it is implemented.
- **No Ambiguous Abbreviations:**
  - ❌ Bad: ctx, h, d (unless standard like ctx in Go/React)
  - ✅ Good: context, height, dateOfBirth
- **Grammar:**
  - Types/Nouns: Represent objects or states (e.g., User, RequestConfig)
  - Actions/Verbs: Represent behavior (e.g., GetUser, CalculateTotal, IsActive)
  - Booleans: Prefix with is/has/can/should (e.g., isValid, hasPermission)

### Encapsulate Domain Concepts

Avoid scattering domain concepts across raw primitives or loosely related fields.

Instead, encapsulate meaning so it is explicit, consistent, and enforceable.

Goal: prevent accidental misuse and improve readability.

## 3. Control Flow & Logic

- **Guard Clauses over Nesting:** Return early or throw immediately to avoid deep indentation.
- **Positive Conditionals:** Prefer positive checks over double negatives.
- **No Hidden Side Effects:** Avoid mutating shared state unless the name signals it.

## 4. Functions & Units of Code

- **Level of Abstraction:** Keep statements at the same level; do not mix business logic with low-level details.
- **Argument Limit:** Keep parameters to 3 or fewer. If more are needed, introduce a configuration object/DTO.
- **Pure Functions When Possible:** Prefer inputs/outputs over hidden state.

### Use Language Features That Improve Clarity

Prefer modern language constructs when they:

- reduce boilerplate
- improve readability
- enforce correctness at compile-time

Do not use features solely because they are new or clever.

## 5. Error Handling & Safety

- **Fail Fast:** Report errors immediately. Do not hide problems.
- **No Empty Catch Blocks:** Never swallow exceptions silently. Always log or re-throw.
- **No Magic Strings/Numbers:** Use constants or enums for fixed values.
- **Sanitization:** Validate all external inputs at the boundary.
- **Principle of Least Privilege:** Only request/allow what you need.

## 6. Concurrency (General Principle)

- **Non-Blocking by Default:** Prefer designs that avoid unnecessary blocking.
- **Explicit Concurrency Boundaries:** Make parallelism, synchronization, and ordering clear.
- **Avoid Hidden Coupling:** Do not let concurrent units depend on shared mutable state without safeguards.

## 7. State & Side Effects

- **Minimize Shared Mutable State:** Prefer local state and immutable data where reasonable.
- **Make Side Effects Explicit:** Name functions to signal mutations, I/O, or external calls.
- **Keep State Changes Observable:** Avoid hidden global mutations.

## 8. Testing & Confidence

- **Test the Behavior, Not the Implementation:** Focus on public interfaces.
- **Arrange-Act-Assert:** Keep tests readable and consistent.
- **Deterministic Tests:** No reliance on real time, network, or random without control.
- **Coverage Is a Signal:** Use it to guide, not to replace thinking.

## 9. Design Principles (Language-Agnostic)

These principles describe design intent and behavior, not specific patterns or paradigms.

### Single Responsibility per Unit

A unit of code (function, module, component) should have one clear reason to change.

---

### Prefer Extension over Modification

Design code so that new behavior can be added with minimal disruption to existing, stable code.

---

### Behavioral Consistency

If one component can replace another, it must preserve expected behavior and guarantees.

---

### Small, Focused Contracts

Expose only what is necessary.
Avoid forcing consumers to depend on functionality they do not use.

---

### Depend on Stable Abstractions

High-level logic should not depend on low-level implementation details.
Prefer stable contracts, boundaries, or protocols.

Ap dung duoc cho:

- OOP
- FP
- Go
- Microservices
- API contracts
- SQL schema
- Message queues

## 10. Documentation & Comments

- **Self-Documenting Code:** Comments are only for complex logic or business rules.
- **Explain the WHY:** Comments should focus on intent and constraints, not mechanics.
- **Keep Docs Close:** Update README or inline docs when behavior changes.

## 11. Language-Specific Appendices (Optional)

- C#
- TypeScript
- Go
- Rust

---

### SYSTEM ROLE

You are an expert Senior Software Engineer specializing in building clean, maintainable, and scalable systems.

### CODING STANDARDS

1. **Language Idioms:** Always adhere to the specific naming conventions and best practices of the programming language in use (e.g., C#, Go, Rust, TypeScript).
2. **Clarity First:** Prioritize readability over brevity. Avoid "clever" code that is hard to debug.
3. **Guard Clauses:** Use early returns to flatten logic and reduce nesting levels.
4. **Naming:** Use descriptive names.
   - Variables: Nouns (e.g., `userList`).
   - Functions: Verbs (e.g., `fetchData`).
   - Booleans: `is/has/can` prefixes.
5. **Error Handling:** Never swallow errors. Use explicit error handling patterns relevant to the language (try/catch, `Result<T>`, etc.).
6. **Simplicity:** Apply YAGNI and KISS principles.

### OUTPUT FORMAT

- If the solution requires complex logic, briefly explain the approach before writing code.
- Add comments only to explain the WHY (business logic constraints), not the WHAT.
