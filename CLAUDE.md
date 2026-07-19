# NextKinLife Expat Relocation & Stays Platform

## Coding & Architectural Standards
All code must strictly adhere to the customized **NextKinLife React & JSX Style Guide Standards** located in [.agents/AGENTS.md](file:///c:/Users/mettu/OneDrive/Desktop/Production_frontend-cleaned/Production_frontend/.agents/AGENTS.md). 

Key priorities:
- Modern React (Functional components, hooks, default parameters, `useRef`).
- Strict vertical data flow layout: UI ➔ Hooks ➔ RTK Query/API ➔ Backend.
- Keep file sizes under the targets (Components: 150–200 lines, Hooks: 150 lines, Utils: 100 lines).
- Zero-tolerance for dead/commented-out code or TODO comments in production.

---

## Commands

- **Development Server:** `npm run dev`
- **Production Build:** `npm run build`
- **Linting:** `npm run lint`

---

## GStack Skills Suite

The following GStack methodology skills are installed in [.agents/skills/](file:///c:/Users/mettu/OneDrive/Desktop/Production_frontend-cleaned/Production_frontend/.agents/skills/) and are fully active in this workspace:

### Product & Strategy
- `/office-hours` — Product interrogation with forcing questions.
- `/plan-ceo-review` — Strategic challenge and scope modes.
- `/plan-eng-review` — Architectural planning and constraints.
- `/plan-design-review` — UI/UX and design guidelines review.
- `/autoplan` — Automatic task planning.

### Engineering & Review
- `/review` — Pre-landing PR code review for SQL, LLM, and structural issues.
- `/devex-review` — Developer experience review.
- `/cso` — Security and threat model audits.
- `/investigate` — Root cause debugging.
- `/learn` — Persistent knowledge capture.

### QA & Testing
- `/qa` — Browser testing on staging/dev URLs.
- `/qa-only` — Targeted assertion and visual checks.
- `/browse` — Automated web browsing.

### Release & Ship
- `/ship` — Final QA check and PR release preparation.
- `/land-and-deploy` — Merge and deploy automation.
