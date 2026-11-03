# Asif Hossain — AI engineering portfolio

A frontend-only portfolio built with React 19, TypeScript, Vite, React Three Fiber / Three.js, and Motion. The design presents agentic AI work through an interactive 3D system, project case studies, a local retrieval demo, research, and credentials.

## Run locally

Requires Node.js 22.12+ or a supported newer release (developed with Node 24).

```powershell
cd E:\asif-portfolio\portfolio
npm ci
npm run dev
```

Open the Local URL printed by Vite, normally http://localhost:5173.

```powershell
npm run build
npm run preview
```

The production output is `dist/`. It is entirely static. No backend, database, API keys, account setup, or paid service is needed.

## What's interactive

- A custom WebGL agent network with a shader-lit core, orbital paths, pointer response, and selectable workflow stages.
- A motion pause control; the scene also stops when offscreen, when the tab is hidden, and when reduced motion is requested.
- A visual fallback if WebGL fails, while the rest of the portfolio remains usable.
- Project filters with URL state and browser history support.
- A local BM25 portfolio search with an illustrated execution trace, source links, and an explicit unknown-answer state.
- Native certificate dialogs with keyboard focus restoration, mobile navigation, and email copying with a failure fallback.

The portfolio demo is **not a live LLM or autonomous agent**. It executes local retrieval and composes answers from existing source summaries. Stage playback is illustrative; no fabricated timing or independent factual-verification claims are shown.

## Edit content

| File                      | Purpose                                                                       |
| ------------------------- | ----------------------------------------------------------------------------- |
| `src/App.tsx`             | Portfolio sections, project records, publications, credentials, contact links |
| `src/AgentScene.tsx`      | React Three Fiber scene, geometry, shaders, animation                         |
| `src/styles.css`          | Design tokens, layout, responsive behavior, reduced-motion styles             |
| `src/knowledge.ts`        | Documents the portfolio demo retrieves and cites                              |
| `src/agent.ts`            | Local BM25 scoring, intent routing, evidence checks                           |
| `public/assets/img/`      | Original portrait, certificates, social image                                 |
| `public/favicon.svg`      | New brand icon                                                                |
| `tests/portfolio.spec.ts` | Browser interaction, responsive, fallback and accessibility checks            |

Keep project facts in `App.tsx` and `knowledge.ts` consistent. The metrics and publication statuses come from the supplied portfolio; they were not independently re-evaluated during this redesign. Accepted IEEE papers remain labeled accepted/to appear; arXiv entries remain labeled preprints.

The original HTML is saved in `legacy/index.html`; the original `css/`, `js/`, `vendor/`, and `assets/` are retained for reference. None of those old application scripts are included in the new production bundle. This archive is not a second maintained application.

## Checks and screenshots

```powershell
npm test
npm run test:e2e
```

Browser checks use installed Google Chrome through Playwright. If Chrome is unavailable, install it or change the `channel` in `playwright.config.ts` to an installed browser. Tests run against the production build at port 4173.

With the development server running:

```powershell
npm run capture
```

Screenshots are written under `artifacts/`. The reviewed design contract and verification scope are recorded in `DESIGN.md` and `VALIDATION.md`.

## Static hosting

`amplify.yml` now runs `npm ci` and `npm run build`, then publishes `dist/`. Set the Amplify app root to this `portfolio` directory if the Git repository contains it as a subdirectory. Any static host that serves `dist/` is also sufficient. No deployment was performed in this task.

## Design and engineering guidance

Applied relevant guidance from [ECC](https://github.com/affaan-m/ECC):

- [Frontend Design Direction](https://github.com/affaan-m/ECC/tree/main/skills/frontend-design-direction): audience, visual hierarchy, responsive states, rendered evidence.
- [Frontend Patterns](https://github.com/affaan-m/ECC/tree/main/skills/frontend-patterns): component composition, lazy loading, focus management, error boundaries.
- [React Performance](https://github.com/affaan-m/ECC/tree/main/skills/react-performance): defer heavy scene code, cache geometry, avoid per-frame React state, and keep static assets local.
- [Verification Loop](https://github.com/affaan-m/ECC/tree/main/skills/verification-loop): distinguish build/test results from production acceptance.

Also consulted [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) and the [Anthropic frontend design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design).

The small ECC evidence checker is retained at `scripts/vendor/ecc-check-evidence.cjs` with its MIT license. It checks the evidence record's completeness, not visual quality. No ECC hooks, global configuration, or backend services were installed.
