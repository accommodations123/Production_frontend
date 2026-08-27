# NextkinLife React & JSX Style Guide Standards

This style guide establishes the coding standards and patterns for NextKinLife, designed for modern React (18/19), Vite, and Tailwind CSS. It is based on the core conventions of the Airbnb React/JSX style guide, customized for functional components and hooks.

---

## 1. General Rules
- Only include one primary React component per file. Multiple small helper/stateless components are allowed per file if they are only used locally.
- Always use JSX syntax. Do not use `React.createElement`.
- Avoid class components entirely. Use functional components and hooks.

---

## 2. Component Declarations
- Use named function declarations for exported components to improve stack traces and readability.
- **Good:**
  ```jsx
  export function UserCard({ title }) {
    return <div>{title}</div>;
  }
  ```
- **Avoid:**
  ```jsx
  const UserCard = ({ title }) => {
    return <div>{title}</div>;
  };
  ```

---

## 3. Naming Conventions
- **Extensions:** Use `.jsx` for components, and `.js` for hooks, utils, constants, or API slices.
- **Filenames:** Use PascalCase for component files (e.g., `ReservationCard.jsx`).
- **Rename Discipline:** The PascalCase / named-declaration standard applies to **all new components**. Do **not** rename existing files purely to satisfy the convention. Rename an existing file only when (a) you are already refactoring it for another reason, or (b) feature-level consistency clearly justifies the diff. A behavior-neutral rename that only churns git history is not an improvement — see §16.
- **Directory Root Components:** Use `index.jsx` as the filename inside a folder, but declare the component name matching the folder name.
  ```jsx
  // Footer/index.jsx
  export function Footer() { ... }
  ```
- **References:** Use PascalCase for components and camelCase for their instances.
- **Props Naming:** Avoid using raw DOM prop names for custom styling. Use `variant` instead of `style` or `className` for visual variations.
- **Booleans:** Prefix with verb identifiers (e.g., `isLoading`, `hasAccess`, `isApproved`).
- **Handlers:** Name functions as `handleSubmit`, `handleClick`, or `handleChange`.
- **Hooks:** Prefix custom hooks with `use` (e.g., `useAuth`).
- **Constants:** Use UPPER_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`).

---

## 4. Spacing & Formatting
- **Quotes:** Always use double quotes (`"`) for JSX attributes, and single quotes (`'`) for all other JS strings.
- **Self-Closing Tags:** Always include a single space in self-closing tags: `<Foo />`.
- **Braces Spacing:** Do not pad JSX curly braces with spaces: `<Foo bar={baz} />`.
- **Bracket Alignment:** Align multi-line properties in JSX tags. The closing tag bracket `/>` or `>` must be placed on a new line.
  ```jsx
  <Foo
    superLongParam="bar"
    anotherSuperLongParam="baz"
  />
  ```
- **Parentheses:** Wrap JSX tags in parentheses when they span more than one line.
- **Conditionals:** Wrap complex or multi-line conditionals in parentheses.

---

## 5. Props & State
- **No defaultProps:** Use JavaScript default parameter assignment instead.
  ```jsx
  // Good
  export function Button({ size = 'md' }) { ... }
  ```
- **Booleans:** Omit the value of a prop when it is explicitly `true` (e.g., `<Foo hidden />`).
- **Keys:** Avoid using array indexes as keys. Always prefer a stable, unique ID (e.g., `key={todo.id}`).
- **Prop Limit:** Avoid passing more than 8 props to a component. Pass objects instead if the list gets too long.
- **Derived State:** Avoid duplicating state. Prefer derived calculations during render.
- **State Minimalism:** Keep component state minimal and lift state up only when necessary.

---

## 6. Refs & Hooks
- **No Callback Refs:** Always use the standard `useRef(null)` hook.
- **Hook Rules:** Never call hooks conditionally. Always keep hooks declared at the very top of the functional component.
- **Custom Hooks:** Extract repeated hooks or complex state machine logic into reusable custom hooks.

---

## 7. Folder & Module Structure
- Organize components inside modular feature folders:
  ```
  Feature/
    index.jsx      (Main Component Entry)
    SubComponent.jsx
    hooks.js       (Feature-specific hooks)
    constants.js   (Feature-specific constants)
    utils.js       (Feature-specific utility functions)
  ```

---

## 8. Import Ordering
Group your imports systematically with an empty line between groups:
1. **React core** and hooks (e.g., `useState`, `useEffect`)
2. **Third-party packages** and libraries
3. **Shared UI components** (using alias `@/...`)
4. **Hooks** (custom hooks)
5. **Utils** / helpers
6. **Styles** / assets

Example:
```javascript
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { Button } from '@/shared/ui/button';
import { useAuth } from '@/shared/hooks/useAuth';

import { formatDate } from '@/shared/utils/date';

import './styles.css';
```

---

## 9. Code Comments Guidelines
- Write comments to explain **why** something is done, not **what** the code is doing.
- **Good:**
  ```javascript
  // Prevent duplicate submissions while saving profile image
  ```
- **Avoid:**
  ```javascript
  // This function handles the button click
  ```

---

## 10. Styling Standards
- Use Tailwind CSS utility classes exclusively.
- Do not use inline styles unless values are dynamic (e.g., width based on percentage state).
- Avoid CSS modules unless absolutely unavoidable.

---

## 11. Performance Optimization
- Only use `React.memo` after identifying and profiling a real rendering bottleneck.
- Avoid premature optimization with `useMemo` or `useCallback` for trivial calculations. Only memoize expensive operations.

---

## 12. File Length Guidelines
- **Component File:** Target between 150–200 lines. The absolute maximum limit is 250 lines. Large pages are allowed to exceed this limit only when splitting them would actively decrease overall readability.
- **Hook File:** Max ~150 lines.
- **Utility File:** Max ~100 lines.

---

## 13. Advanced Architectural & Quality Rules

### Error Handling
- Every asynchronous operation must follow a strict error handling pattern. Never ignore promises.
  ```javascript
  try {
    const res = await apiCall().unwrap();
    // handle success
  } catch (error) {
    // handle error explicitly (toast, log, state)
  }
  ```

### API Layering
- Never make direct `axios` or `fetch` calls inside UI components. Keep UI layers clean of raw HTTP concerns.
- Route every server interaction through one of three sanctioned layers, chosen **per endpoint** (see §15 "Data-Access Decision Matrix" for the authoritative list):
  - **RTK Query hooks** — for cacheable, reusable *read* surfaces that benefit from caching and tag invalidation (public listings, search, People, Events, Travel, Marketplace, Communities, user profile).
  - **Redux slices** — for client-owned global state (auth, theme, notifications, global filters, preferences).
  - **Shared Axios client (`src/services/axios.js`)** — for one-shot commands and side-effect-heavy operations that do not benefit from caching (login, register, OTP verification, contact form, file uploads, payment initiation).
- Not every endpoint belongs in RTK Query. Imperative one-offs get awkward wrapped in it; use the shared Axios client instead. All three layers are first-class — none is a fallback.

### Component Responsibility (Single Responsibility Principle)
- One component should have exactly one responsibility.
- **Bad:** A single `Profile` component that renders login UI, photo upload, notifications list, and chat window.
- **Good:** Split into `ProfileHeader`, `ProfileGallery`, `ProfileActions`, and `ProfileStats`.

### Early Returns
- Prefer early returns to keep component nesting flat and clean.
- **Good:**
  ```javascript
  if (!user) return null;
  if (isLoading) return <LoadingSpinner />;
  
  return <ProfileDashboard user={user} />;
  ```

### Accessibility (A11y)
- Every interactive element must support:
  - Keyboard focus and navigation (`Tab` support)
  - Visible focus outline
  - Explicit `aria-label` for icon-only controls
  - Appropriate HTML5 semantic element tags

### Dead Code Elimination
- Zero tolerance for dead code in production.
  - No commented-out blocks of code.
  - No unused imports, state variables, or prop parameters.
  - No pending `TODO` markers.
  - Delete obsolete functions and modules immediately instead of commenting them out.

### Architecture Data Flow
- Adhere strictly to the vertical data flow layout. Server access follows whichever sanctioned layer §13/§15 select for the endpoint:
  ```
  UI Component ➔ Custom Hooks ➔ ┬─ RTK Query / API Slices ──┐
                                ├─ Redux Slices ────────────┤ ➔ Backend Services
                                └─ Shared Axios Client ──────┘
  ```

### Reusability Rule
- Avoid premature optimization or creating highly abstract components "just in case".
- Only extract utilities and component primitives after a concrete need (e.g. 2+ duplicate use cases) is established.

---

## 14. AI Assistance Standards
- AI-assisted implementations are acceptable only if they strictly comply with these standards.
- Every generated contribution must be audited during code reviews for:
  - Unnecessary/redundant abstractions or hooks
  - Duplicated logic or boilerplate
  - Commented-out dead code
  - Generic/vague naming (e.g., `data`, `info`, `temp`)
  - Redundant "what" comments
  - Oversized components
  - Readability and maintainability
- Refactor all AI-generated code to fit these clean coding standards before merging.

---

## 15. NextKinLife Frontend Engineering Standard

### Reference vs. Target
- The `mern-ecommerce-2024` tutorial repository is a **pattern source only** — a reference for pragmatic React patterns and folder organization. It is **not** the target architecture. NextKinLife's standard (this document) is more mature; adopt useful ideas from the tutorial, but never converge NextKinLife toward the tutorial's shape.

### Core Philosophy
- Develop the codebase as if it were maintained by a senior React team over multiple years.
- Prioritize readability, consistency, maintainability, performance, and simplicity.
- Never over-engineer solutions.

### Project Architecture & Feature Boundaries
- Use feature-based architecture (`src/app/`, `src/layouts/`, `src/pages/`, `src/features/`, `src/shared/`, `src/services/`, `src/store/`). Every folder has a clear responsibility.
- **Strict Feature Isolation:** Prevent features from importing directly from other features' internal subdirectories (`People ➔ Shared ➔ UI`, NOT `People ➔ Marketplace ➔ Travel`). Only `@/shared/` contains reusable cross-feature code.

### Routing & Lazy Loading Rules
- Use React Router v6+.
- Prefer nested routing with `<Route element={<RootLayout />}>` containing `<Outlet />`, `<Suspense>`, `<Navbar>`, and `<Footer>`.
- **Top-Level Route Lazy Loading:** Every top-level page route MUST be lazy loaded (`const PeoplePage = lazy(() => import(...))`) unless there is a measured performance reason not to.
- Protected routes wrap views explicitly using `<ProtectedRoute>` / `<HostGuard>`.

### Layout Hierarchy
Every major page follows: `Page ├── Hero ├── Search ├── Filters ├── Results ├── Pagination └── Footer Section`. Avoid giant page components.

### Redux vs. Local State Rules
- Use Redux Toolkit for global application state (auth, user, notifications, global filters, wishlist, saved items, settings).
- Do NOT store local UI state (modals, drawers, selected tabs, input values, transient loaders) in Redux—keep them in `useState`.

### Axios Client Standard & API Layer
- **Single Shared Client:** Maintain a single shared Axios instance (`src/services/axios.js`) containing `baseURL`, `timeout`, `withCredentials`, request/response interceptors, and JWT header injection.
- Never use `fetch()`. Always use `Axios` or `RTK Query`.
- Organize API calls inside `services/` or feature API slices (`src/features/*/api.js`).
- Include `async/await`, `try/catch`, loading, and error states. No Axios calls directly inside JSX blocks.

### Data-Access Decision Matrix (authoritative)
Choose the layer **per endpoint**, not per project:

| Layer | Use for |
| --- | --- |
| **RTK Query** | Public listings, search, People, Events, Travel, Marketplace, Communities, user profile — i.e. cacheable, reusable server reads with tag invalidation. |
| **Redux slices** | Authentication, theme, notifications, global filters, preferences — client-owned global state. |
| **Plain Axios (shared client)** | Contact form, OTP verification, login, register, file uploads, payment initiation — one-shot commands and side-effect-heavy ops. |

- **Do NOT use RTK Query for:** simple one-off POST forms, local-only state, or multi-step wizard form drafts.

### Form Validation & Error Boundaries
- **Controlled Forms:** Standardize form inputs with controlled components and explicit validation. Avoid mixing conflicting validation libraries across features.
- **App Resilience:** Wrap top-level route branches in `<AppErrorBoundary>` to handle unexpected runtime crashes cleanly without breaking the surrounding layout.

### Component, Hook & Symbol Naming Conventions
- One component, one responsibility. Extract repeated UI cleanly.
- Use predictable naming conventions:
  - **RTK Query Hooks:** `use[Feature]Query`, `use[Action]Mutation` (e.g., `useGetEventsQuery`, `useCreateTripMutation`)
  - **API Slices:** `[feature]Api` (e.g., `hostApi`, `authApi`)
  - **Redux Slices:** `[feature]Slice` (e.g., `authSlice`, `wishlistSlice`)
  - **Custom Hooks:** Use custom hooks only when logic is actually shared across multiple components (e.g., `useAuth()`, `useDebounce()`, `useCountry()`).
- Avoid generic variable names (`data`, `temp`, `list`, `item`, `test`, `demo`).

### Architectural Precedence & Testing Guidance
- **Architectural Stability:** Adopt new libraries or architectural patterns only after they solve a demonstrated problem across multiple features. Existing conventions take precedence over introducing newer alternatives.
- **Testing Boundaries:** Place unit and component tests inside feature-scoped `__tests__/` directories (`src/features/[feature]/__tests__/`).

### What NOT to Do
- ❌ Never use `fetch()`
- ❌ Never put API logic inside JSX
- ❌ Never store local UI state in Redux
- ❌ Never create 500–1000 line components
- ❌ Never duplicate API logic
- ❌ Never overuse Context API
- ❌ Never create unnecessary abstractions
- ❌ Never introduce a new pattern unless there is a clear need
- ❌ Never force every endpoint into RTK Query — respect the Data-Access Decision Matrix (§15)

---

## 16. Change Discipline (Governing Meta-Rule)

**Do not refactor code that already complies with this standard.** This rule takes precedence over stylistic preferences: consistency with the standard is the goal, not maximal uniformity.

Every proposed change — human or AI-generated — must be able to answer all four questions before it is made:

1. **Which engineering rule is violated?** (cite the specific section of this document)
2. **Which file violates it?**
3. **What is the minimal change needed** to bring it into compliance?
4. **Can behavior remain identical?** (and if not, is the behavior change intentional and reviewed?)

If the answer to (1) is "none," the file must not be touched. Avoid unnecessary rewrites and convention-only churn. Prefer the smallest diff that resolves a real, cited violation.
