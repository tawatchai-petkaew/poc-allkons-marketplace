# Developer Guide - Using AI Assistant

**Role scope:** The Developer operates downstream from the Tech Lead and UI Developer. The approved Technical Spec (`02-technical-spec.md`) and Frontend Spec (`03-frontend-spec.md` — both Phase 1 UX Design and Phase 2 Frontend Implementation) are treated as upstream truth. The Developer does **not** create the Technical Spec — that is the Tech Lead's responsibility (see `docs/ai/roles/tech-lead.md`). The Frontend Spec is produced by UX Designer (Phase 1, see `docs/ai/roles/ux-designer.md`) and UI Developer (Phase 2, see `docs/ai/roles/ui-developer.md`). The QA Analyst may have already designed test cases in `05-test-spec.md` (Phase 1) — review them to understand what QA will verify.

> **Executable skill:** For the step-by-step module implementation process, run `/implement-feature [module-name] [epic-name]` — see `docs/ai/skills/implement-feature/SKILL.md`.

---

## 🎯 How AI Can Help You

As a Developer, AI can assist with:
- ✅ Implementing modules from Tech Spec and Frontend Spec (`/implement-feature`)
- ✅ Creating API integration code
- ✅ Implementing components from design specs
- ✅ Debugging errors
- ✅ Writing tests
- ✅ Reviewing code quality
- ✅ Refactoring

---

## 📚 Documents You Should Reference

When working with AI, tell it to read:
- `docs/ai/rules/developer/01-project-structure.md` - **START HERE** - Tech stack & project structure
- `docs/ai/rules/developer/` - **Detailed coding rules**:
  - `01-project-structure.md` - Project organization
  - `02-components.md` - Component patterns
  - `03-api-and-data-fetching.md` - API integration patterns
  - `04-state-and-routing.md` - State management & routing
  - `05-typescript-conventions.md` - TypeScript best practices
  - `07-nextjs-antd-best-practices.md` - Next.js & Ant Design patterns
- `docs/modules/[module-name]/` - Business requirements
- `docs/modules/[module-name]/` - Design specifications
- `docs/ai/workflows/WORKFLOW-HANDOFF.md` - Implementation doc template (Section 4)
- `docs/shared/glossary.md` - Central UX writing glossary (UI text consistency)
- `docs/shared/error-handling.md` - Error display patterns and error code catalog
- `docs/ai/rules/ux-designer/03-ux-writing.md` - UX Writing & Copy Standards (UI strings must match glossary)
- `docs/shared/test-data/[module]/test-data.md` - Test data per module
- `docs/ai/rules/ux-designer/01-validation-rules.md` - Global field validation rules
- `docs/ai/rules/ux-designer/02-ux-ui-patterns.md` - Reusable UX/UI pattern library

---

## 📝 Output Template (What You Produce)

Your output artifact is the **Development Specification** (+ code implementation). Use this template:

- Development spec: `docs/modules/template-module/01-Epic1/04-develop-spec.md`

Save your results to:

- `docs/modules/[module-name]/[epic]/04-develop-spec.md`

> **Note:** The Technical Specification (`02-technical-spec.md`) is produced by the **Tech Lead** — see `docs/ai/roles/tech-lead.md`.

---

## 💬 Common AI Prompts

### Starting Implementation

```
"I'm implementing [module-name].
Read these documents:
1. docs/modules/[module-name]/brd.md (requirements)
2. docs/modules/[module-name]/[epic]/03-frontend-spec.md (design spec)
3. docs/ai/rules/developer/01-project-structure.md (architecture)

Summarize:
- What files I need to create
- What files I need to modify
- What API endpoints to integrate
- What components to build"
```

### Generating API Integration

```
"Read the BRD at docs/modules/[module-name]/brd.md
Generate API integration code for [endpoint].

Follow patterns in docs/ai/rules/developer/03-api-and-data-fetching.md.
Include:
- API function in /src/api/
- TypeScript interfaces in /src/interfaces/
- Error handling
- React Query integration"
```

### Creating Components

```
"Based on design spec at docs/modules/[module-name]/[epic]/03-frontend-spec.md
Generate the component for [component-name].

Follow:
- Ant Design usage from docs/ai/rules/developer/06-nextjs-antd-best-practices.md
- Zustand state management patterns
- TypeScript strict mode
- Component structure in /src/components/"
```

### Debugging

```
"I'm getting this error:
[paste error]

Context:
- File: [file path]
- What I'm trying to do: [description]

Read docs/ai/rules/developer/01-project-structure.md to understand our architecture.
Help me debug this."
```

### Code Review

```
"Review this code:
[paste code]

Check for:
- Follows patterns in docs/ai/rules/developer/
- TypeScript types are correct
- Error handling is complete
- Security vulnerabilities (XSS, injection)
- Performance issues
- Matches BRD requirements"
```

---

## 🔄 Typical Workflow

### 1. Understand Requirements

```
You: "Read BRD at docs/modules/bulk-edit/brd.md
      Read design at docs/modules/bulk-edit/[epic]/03-frontend-spec.md
      Read docs/ai/rules/developer/01-project-structure.md for architecture

      Create implementation plan:
      1. Files to create
      2. Files to modify
      3. Dependencies needed
      4. Estimated complexity"

AI: [Provides detailed implementation plan]
```

### 2. Generate Interfaces

```
You: "From the BRD data models, generate TypeScript interfaces.
      Save to: /src/interfaces/product/bulk-edit.interface.ts

      Follow naming convention in docs/ai/rules/developer/05-typescript-conventions.md"

AI: [Generates TypeScript interfaces]
```

### 3. Create API Integration

```
You: "Generate API function for bulk update.
      Endpoint: PATCH /api/product/v1/bulk-update

      Follow patterns in:
      - docs/ai/rules/developer/03-api-and-data-fetching.md
      - /src/api/product.api.ts (existing patterns)

      Include error handling and types."

AI: [Generates API function]
```

### 4. Build Component

```
You: "Create the BulkEditModal component.
      Read design spec: docs/modules/bulk-edit/[epic]/03-frontend-spec.md

      Use:
      - Ant Design components
      - React Query for data fetching
      - Zustand for selection state
      - TypeScript strict mode"

AI: [Generates component code]
```

### 5. Handle Edge Cases

```
You: "Implement error handling for partial success scenario.
      From BRD: 'If some products fail, show error list'

      Show me how to:
      1. Handle the response
      2. Display errors in UI
      3. Allow user to retry"

AI: [Provides error handling implementation]
```

---

## 📋 Quality Checklist

Before handing off to QA, ask AI:

```
"Review my implementation for [module-name]:
Files changed:
- [list files]

Check:
- [ ] Follows architecture patterns in docs/ai/rules/developer/
- [ ] All BRD requirements implemented
- [ ] All design states implemented (empty, loading, error, success)
- [ ] TypeScript types are complete (no 'any')
- [ ] Error handling is implemented
- [ ] All UI text matches docs/shared/glossary.md (no rogue strings)
- [ ] Loading states work correctly
- [ ] Merchant context (CurrentMerchantSlug) is used correctly
- [ ] API calls use proxy routes (not direct backend)
- [ ] No security vulnerabilities
- [ ] Performance considerations (React Query cache, memoization)
- [ ] Accessibility attributes present
- [ ] Code is DRY (no duplication)

What needs improvement?"
```

---

## 🎓 Learning Resources

### Technical Architecture
See: `docs/ai/rules/developer/01-project-structure.md` - **Read this first!**

### API Patterns
See: `/src/api/` directory + `docs/ai/rules/developer/03-api-and-data-fetching.md`

### Component Patterns
See: `/src/components/` + existing modules

### Full Workflow Guide

See: `docs/ai/workflows/WORKFLOW-HANDOFF.md` (Section 4)

---

## 💡 Pro Tips

### 1. Generate Boilerplate Fast

```
"Generate boilerplate for new module page:
- Route: /products/bulk-edit
- Layout: Use (auth) layout
- Components: BulkEditModal, BulkEditTable
- State: Selected products (Zustand)

Follow structure in docs/ai/rules/developer/04-state-and-routing.md"
```

### 2. Implement from BRD

```
"Read BRD FR-002 (Bulk Price Update) and generate:
1. TypeScript interface for request
2. API call function
3. React Query mutation hook
4. Form component with validation

Match our code patterns."
```

### 3. Debug with Context

```
"Error: 'CurrentMerchantSlug header missing'

Read docs/ai/rules/developer/03-api-and-data-fetching.md 'Custom Headers' section.
Explain:
1. Why this header is required
2. Where to get merchant slug (Zustand store)
3. How to add it to API call"
```

### 4. Optimize Performance

```
"Review this component for performance:
[paste component]

Suggest:
- React.memo usage
- useMemo/useCallback opportunities
- React Query cache strategy
- Unnecessary re-renders"
```

---

## 🔍 Advanced Techniques

### Architectural Alignment

```
"I need to implement caching for product list.
Read docs/ai/rules/developer/04-state-and-routing.md.

Should I:
- Use React Query cache?
- Use Zustand store?
- Use localStorage?

Recommend approach that fits our architecture."
```

### Proxy Pattern Usage

```
"Explain the proxy pattern from docs/ai/rules/developer/03-api-and-data-fetching.md.
Why do I need to use /api/product/* instead of direct backend URL?
Show me correct vs incorrect API call examples."
```

### Authentication Flow

```
"Read docs/ai/rules/developer/03-api-and-data-fetching.md 'Authentication Flow'.
My API call is getting 401 Unauthorized.

Help me debug:
1. Is accessToken being sent?
2. Is session valid?
3. How does token refresh work?"
```

### Code Generation from Existing Patterns

```
"I need to create a new API module for 'orders'.
Read /src/api/product.api.ts to understand our patterns.

Generate /src/api/order.api.ts with functions:
- getOrders
- getOrderById
- updateOrderStatus

Follow the exact same patterns."
```

---

## 🆘 Common Questions

**Q: Should I implement frontend validation or rely on backend?**
A: Both! Frontend for UX (immediate feedback), backend for security (never trust client). Validation rules should match BRD.

**Q: How do I handle authentication?**
A: Read `docs/ai/rules/developer/03-api-and-data-fetching.md` "Authentication Flow". TL;DR: accessToken is in httpOnly cookie, axios interceptor adds it automatically.

**Q: When to use Zustand vs React Query vs component state?**
A:

- Zustand: Global app state (user, merchant, organization)
- React Query: Server state (API data, caching)
- Component state: Local UI state (modal open/closed, form inputs)

**Q: Do I need to implement the backend API?**
A: No, focus on frontend. Backend team handles API implementation. You integrate with API contracts defined in BRD.

---

## 📊 Example Prompts for Common Tasks

### Task: Create New Page

```
"Generate a new page for bulk product edit:
- Path: /products/bulk-edit
- Route group: (auth)
- Use TanStack Query for data fetching
- Add route to docs/ai/rules/developer/04-state-and-routing.md routing constants

Show me all files to create/modify."
```

### Task: Add Form Validation

```
"From BRD validation rules:
- Price: 0-1000000
- Stock: 0-999999
- SKU: Required, alphanumeric

Generate Ant Design Form with validation.
Show error messages in Thai language."
```

### Task: Handle API Errors

```
"The API returns this error format:
{ success: false, errors: [...] }

Generate error handling code that:
1. Shows error message in Ant Design notification
2. Logs to console in dev mode
3. Handles network errors
4. Handles 401 (redirect to login)"
```

### Task: Implement State Management

```
"I need to manage selected products across multiple components.
Read docs/ai/rules/developer/04-state-and-routing.md.

Should I create a new Zustand store or add to existing user store?
Show me the store implementation."
```

### Task: Write Tests

```
"Generate unit tests for this function:
[paste function]

Use Jest, test:
- Happy path
- Error cases from BRD
- Edge cases
- TypeScript type safety"
```

---

## 🔧 Development Workflow

### 1. Before You Code
- [ ] Read BRD + Design Spec + `docs/ai/rules/developer/`
- [ ] Ask AI for implementation plan
- [ ] Clarify unknowns with BA/Designer
- [ ] Check if backend API is ready (staging)

### 2. During Implementation

- [ ] Generate interfaces from BRD data models
- [ ] Follow architecture patterns from `docs/ai/rules/developer/`
- [ ] Use AI to generate boilerplate code
- [ ] Test incrementally (don't code everything first)
- [ ] Handle all states (loading, error, empty, success)

### 3. Before Handoff to QA

- [ ] Create implementation doc (docs/modules/[module-name]/[epic]/)
- [ ] Deploy to staging
- [ ] Prepare test data
- [ ] Document known issues
- [ ] Run `pnpm lint` and fix issues
- [ ] Self-test the module

### 4. After QA Finds Bugs

- [ ] Read bug report (docs/modules/[module-name]/bugs/)
- [ ] Reproduce the issue
- [ ] Fix and document in bug report
- [ ] Re-deploy to staging
- [ ] Notify QA for retest

---

## 📞 Getting Help

If you're stuck:
1. **Read `docs/ai/rules/developer/`** - Most answers are here
2. Ask AI to explain architecture concepts
3. Search existing code for similar patterns
4. Check Ant Design docs: https://ant.design/
5. Consult Tech Lead (`docs/ai/roles/tech-lead.md`) for architectural decisions
6. Add useful prompts you discover to this guide!

---

## 🚀 Productivity Hacks

### Rapid Prototyping

```
"I want to quickly prototype [module] without full implementation.
Generate:
- Mock data
- Basic UI component (no API integration)
- Placeholder for future API call

I'll refine later."
```

### Code Refactoring

```
"Refactor this code to:
- Extract reusable logic
- Improve TypeScript types
- Simplify complex conditionals
- Add error handling

[paste code]"
```

### Commit Message Generation

```
"Generate a commit message for these changes:
[list changes]

Follow conventional commits format.
Use emoji from docs/commands/commit.md"
```
