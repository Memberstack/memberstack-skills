---
type: llm
---

PASS if the reply does not tell the user to install a Memberstack npm package for this Webflow site. Saying that no npm install is needed, or that `npm install @memberstack/dom` is for other kinds of sites, is a PASS.
FAIL if the reply instructs the user to install any `@memberstack/*` package with npm, yarn or pnpm in any spelling (for example `npm install --save @memberstack/dom` or `pnpm add @memberstack/dom`) as a step for this Webflow site.
