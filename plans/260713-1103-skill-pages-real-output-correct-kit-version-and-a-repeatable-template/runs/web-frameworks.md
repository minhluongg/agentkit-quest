---
slug: web-frameworks
invocation: /ak:web-frameworks src/
resolvedSkill: ~/.claude/skills/ak-web-frameworks/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# web-frameworks — the audit was mostly right, and one confident claim was wrong

## Input

```bash
/ak:web-frameworks src/
```

Target: Next.js 16.2.10, App Router, React 19, static-first.

## Raw output

### It caught that the skill itself is stale — before trusting it

````
Important caveat about the skill: its references are Next 13/14-era.
  references/nextjs-app-router.md:39     teaches the SYNCHRONOUS `params: { slug: string }` form
  references/nextjs-data-fetching.md:816 same
  references/nextjs-optimization.md:1300 teaches experimental.ppr

On Next 16 the repo is right and the skill is stale.
I used the skill for WHAT TO CHECK, not for WHAT IS TRUE.
````

That single paragraph is the most useful thing in the report. A skill is a checklist, and a
checklist written against Next 14 will confidently tell you to "fix" correct Next 16 code.

### It audited the build output, not the source's intentions

````
.next/prerender-manifest.json: 131 routes prerendered
/og is the ONLY app route not prerendered.

So: 100% static, plus one dynamic-by-necessity image endpoint. For a content site
whose data all lives in the repo, that is the correct architecture, not an anti-pattern.
````

### The real finding: a font subset nobody can read

````
src/lib/fonts.ts:6,13 — subsets: ['latin', 'vietnamese']
src/lib/fonts.ts:3-4  — comment claims "It costs nothing today."

That comment is false, and I verified it against the built HTML.

.next/server/app/en.html emits exactly 4 <link rel="preload" as="font">:
  03fc1b4a8d284b5e → IBM Plex Sans,  latin
  051742360c26797e → JetBrains Mono, latin
  90c51ce8fb754fe8 → IBM Plex Sans,  unicode-range: U+1EA0-1EF9, U+20AB  ← Vietnamese
  fa39153a3fc630ba → JetBrains Mono,                                     ← Vietnamese

`rel="preload" as="font"` fetches at HIGH priority, UNCONDITIONALLY. `unicode-range`
gates lazy @font-face activation — it does NOT gate an explicit preload.

So half the eagerly-fetched font bytes on every page are glyphs this English-only
site can never render, competing with LCP resources.
````

## And then it got one thing confidently wrong

It declared `/og` exporting no cache config to be **correct, not a defect**, on this reasoning:

````
ImageResponse sets cache-control: public, immutable, max-age=31536000 in production
  (node_modules/next/dist/compiled/@vercel/og/index.node.js:21490)
Each unique ?title= renders once, then serves from CDN for a year.
Adding `dynamic` or `revalidate` to /og would range from useless to breaking.
````

The source it quotes is real. **The conclusion is false**, and we only know because we measured it
instead of reading it:

````
$ npm run build && NODE_ENV=production npx next start
$ curl -sI localhost:3000/og?title=test | grep cache-control
cache-control: no-cache, no-store
````

The library's production branch never fires in a built app. `no-store` tells every CDN in the path
to keep nothing — so every distinct `?title=` was a fresh function invocation rasterizing a PNG,
billed per request. A separate security run had flagged exactly this; the framework run read the
library source and talked itself out of it.

**Both audits were half right, and neither had run the endpoint.**

## What a reader should notice

**Audit the build output, not the source's intentions.** That is this run's own best advice, and
the one place it failed to take it is the one place it was wrong. The font preload is invisible in
`fonts.ts` — whose comment confidently asserts the opposite — and undeniable in the emitted HTML.
The `/og` cache header is the mirror image: plausible in the library source, false in the response.

**A framework audit on a static-first app is mostly a list of features correctly declined.** Cache
Components, PPR, ISR, `next/image`, Turborepo — all N/A, and the report says so rather than
inventing work. The real risk in an app like this is not "what should we cache" but "what could
silently opt a page out of static rendering". This codebase has scar tissue from exactly that: a
`useSearchParams()` that once served crawlers an empty hub page, and a proxy matcher that once
404'd every social card.

## Findings raised with the owner

- **The `/og` cache header — fixed**, after measuring it. The first fix attempt (`export const
  revalidate`) also did nothing, for a third reason neither audit named: `ImageResponse` builds
  its own `Response` and its header wins over Next's segment config. The route now writes the
  header itself.
- **The Vietnamese font preload** — real, one-line fix, not applied here (outside this phase).
- **No root `not-found.tsx`** — unmatched URLs get Next's unstyled default. Plausible entry point
  on a site whose traffic is organic search.
