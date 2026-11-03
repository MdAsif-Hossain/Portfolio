# Verification record

Verified locally on 3 November 2026. This is a frontend-only implementation; production deployment and external account access are not part of the completed checks.

| Check | Result | Evidence |
| --- | --- | --- |
| Production build | PASS | `npm run build` produces `dist/` |
| Strict TypeScript | PASS | `tsc -b` is part of the build; zero type errors |
| Local retrieval tests | PASS | 4 tests: specific retrieval, agent ranking/citations, research status, unknown/blank/markup input |
| Retrieval coverage | PASS | Node coverage: `agent.ts` 97.03% lines, 91.49% branches, 100% functions; this is not whole-UI coverage |
| Production browser suite | PASS | 8 Playwright tests; headless installed Chrome using software WebGL |
| Final clipboard adjustment | PASS | Production rebuild and the affected loading/copy test rerun |
| Desktop and mobile accessibility scan | PASS | axe WCAG 2 A/AA and 2.1 AA: zero violations in the tested states |
| Responsive width checks | PASS | No horizontal overflow at 320, 390, 768, 1024 and 1440 pixels |
| Keyboard behavior | PASS | Mobile navigation Escape/focus; certificate dialog Escape and focus restoration |
| Graphics fallback | PASS | WebGL deliberately disabled; static fallback and portfolio demo remain usable |
| Backend-free behavior | PASS | Demo interaction produced zero fetch/XHR requests |
| Loading/empty/error/success states | PASS | Suggested questions, execution state, source results, unknown questions, clipboard success/failure |
| Visual review | PASS | Desktop hero/projects/about and mobile hero/contact screenshots inspected |
| Dependency audit | PASS | Installation audit reported zero vulnerabilities across 107 packages |
| Source scan | PASS | No API keys, `fetch`, raw HTML injection, or debug logging found in current `src/` |
| Lint | NOT CONFIGURED | No lint command added; code formatted with Prettier |
| Git diff | NOT AVAILABLE | Supplied workspace is not a Git repository; original HTML and assets preserved |
| ECC evidence record | PASS | `node scripts/vendor/ecc-check-evidence.cjs artifacts/design-evidence.json` |
| Production target | NOT PERFORMED | AWS Amplify build configuration updated, but nothing deployed |

## Browser suite coverage

1. Production page, WebGL canvas, original portrait, valid internal anchors and no uncaught page errors.
2. Project filtering, query-string state and browser back navigation.
3. Agentic/research retrieval, source navigation after filtering, unknown questions, markup-safe rendering and trace details.
4. Certificate modal, verification link, Escape and restored focus.
5. Empty/loading/success states, duplicate-run prevention, no API calls, email copying and manual-copy fallback.
6. Mobile menu, keyboard focus and five viewport widths.
7. Reduced-motion usability and forced no-WebGL fallback.
8. Desktop/mobile automated accessibility checks.

## Material limits

- The 3D renderer is a separate lazy-loaded bundle: approximately 239 KB gzip. Vite reports its normal large-chunk warning. Main application JavaScript is approximately 126 KB gzip and CSS approximately 9.5 KB gzip. Fonts are local; scene pixel ratio is capped at 1.5 and animation pauses offscreen/in hidden tabs.
- Testing used Chrome with software WebGL. Physical phones, Safari, Firefox, hardware GPU performance and production hosting were not tested.
- An automated accessibility pass is not a complete assistive-technology audit.
- Source checks in the demo validate local document references; they do not independently verify the portfolio's supplied achievement or metric claims.
- ECC's checker validates the shape and presence of evidence, not screenshot quality; the images were reviewed separately.

Screenshots and the machine-readable evidence record are in `artifacts/`. This directory is ignored by Git so regenerated screenshots do not pollute source changes.
