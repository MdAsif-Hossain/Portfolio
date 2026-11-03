# Design contract

## Purpose and audience

Help a recruiter quickly understand Asif's agentic AI and AI engineering skills, inspect evidence in real projects, and make contact. Primary action: explore selected work. Secondary action: run the local portfolio retrieval demonstration. Contact remains available in the header and final section.

## Direction

An AI systems studio: ink and navy surfaces, sea-glass green for the agent network, blue for document intelligence, warm brass for the policy assistant. Manrope provides the editorial hierarchy; IBM Plex Mono marks system state and technical metadata. All fonts ship locally.

The memorable element is a procedural 3D agent core with orbital paths and a readable plan/retrieve/act/verify/respond sequence. Pointer movement changes its orientation. Workflow controls update the highlighted satellite and explanation. Animation has an explicit pause control and respects reduced motion, page visibility, and viewport visibility.

## Content hierarchy

1. Identity, engineering purpose, active agent network, selected evidence.
2. Three project case studies with real source links and evaluation context.
3. Skills explained by what they enable, with project evidence.
4. A fully local, inspectable portfolio retrieval demo.
5. First-author research with accepted/preprint distinctions.
6. Biography, portrait, education, recognition and verifiable certificates.
7. Direct email, profile links, and email-copy affordance.

The site uses the supplied portfolio as its factual source. Diagrammed invoice fields are illustrative artwork, not a captured Attest run. No resume file or deployment status is invented.

## Responsive contract

- Main visual targets: 1440 × 1000 desktop and 390 × 844 mobile.
- Additional overflow checks: 320, 768 and 1024 pixels wide.
- Mobile uses a single-column hero, accessible expandable navigation, stacked projects, and a stacked demo console.
- Project and publication titles wrap normally. Email remains readable at the narrowest viewport.
- Content stays available if 3D cannot render. Touch scrolling remains native.

## States

- Loading: an orb silhouette reserves the scene's space; demo execution shows progress and disables duplicate runs.
- Empty: the demo offers specific starting questions.
- Error: unsupported WebGL displays the fallback; failed clipboard writes leave the email visible and explain how to copy it.
- Partial: not applicable to the current local-only data model. Unknown questions use an explicit evidence-limited answer, not a fabricated partial response.
- Success: cited source summaries and inspectable execution details; confirmed clipboard success.
- Permission: no account or application permission state. Optional clipboard denial is handled as an error without an access request.

## Evidence

See `artifacts/hero.png`, `projects.png`, `about.png`, `mobile-hero.png`, and `mobile-contact.png`. Automated tests check source navigation after filtering, certificate focus restoration, empty/loading/success states, unknown questions, mobile navigation, and no-WebGL operation. The local JSON evidence record is `artifacts/design-evidence.json`.
