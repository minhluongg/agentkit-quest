---
slug: react-best-practices
invocation: /ak:react-best-practices src/
resolvedSkill: ~/.claude/skills/ak-react-best-practices/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# react-best-practices — a mostly-null result, which was the correct answer

## Input

```bash
/ak:react-best-practices src/
```

The skill is **45 rules in 8 priority-ordered categories**, each with a stated impact. Applied to
53 TS/TSX files — a Next.js 16 App Router site, 9 client components, the rest server/RSC.

## Raw output

### The two CRITICAL categories do not fire

````
Eliminating Waterfalls (5 rules) — N/A
  No async data fetching exists in this app. The only awaits in src/app/ are
  `await params` (Next 16's async route params). No fetch() in any server
  component, no Promise.all, no DB, no API.
  There is no waterfall to eliminate because there is no network in the render path.

Bundle: barrel imports — fires textually, but is already handled
  Every component does `import { Search, X } from 'lucide-react'` — the rule's
  exact "Incorrect" example. But Next 16.2.10 ships lucide-react in the DEFAULT
  optimizePackageImports list (node_modules/next/dist/server/config.js:988),
  which is precisely the rule's own "Alternative (Next.js 13.5+)" remedy.

  No action. This is the finding I would have reported if I hadn't checked,
  and it would have been false.
````

### The one real defect: `&&` guarding a number

````
guides/[...slug]/page.tsx:85

  {page.data.readingTime && (
    <span>{page.data.readingTime} min read</span>
  )}

readingTime is z.number().optional() (source.config.ts:27) — no .positive(), no .min().
A guide with `readingTime: 0` passes validation, `0 && …` evaluates to 0, and React
renders a bare "0" into the metadata row.

Honest reachability: LATENT, not live. None of the 14 guides sets readingTime at all,
so the expression is `undefined && …` today and renders nothing. Two consequences: the
bug is unreachable until someone writes 0 — and this entire block is currently dead UI.

This is the only place in the codebase where && guards a number. The other 19 JSX
conditionals all guard strings, booleans, or objects, and the .length ones are
correctly written `> 0`.
````

### It measured the hot path, then told us not to act

````
The 91-skill filter re-normalizes a static corpus on every keystroke — 273 normalize()
calls over data that never changes. Textbook module-level-cache case; the rule fires.

So I measured it rather than assert it:

  corpus: 91 skills
  per keystroke (map+score+filter+sort): 0.2720 ms
  normalize() calls per keystroke: 273

The rule fires, the fix is ~10 lines, and it buys 0.27ms. Don't do it unless the
corpus grows an order of magnitude.
````

## What a reader should notice

**The single most valuable output was a finding it refused to make.** Our `lucide-react` imports
match the rule's "Incorrect" example character for character. A checklist pass would have flagged
it, we would have "fixed" it, and the fix would have been pointless — because Next already applies
that exact remedy by default. The skill only knew that because it went and read `node_modules`.

**And it measured before recommending.** The 91-item filter genuinely triggers a caching rule. It
took 0.27ms. Reporting the number *is* the recommendation: leave it alone.

**One latent bug and three bounded opportunities out of 45 rules is what a clean, mostly-server
codebase is supposed to look like.** The value of this run is the confidence that the expensive
categories genuinely do not apply — not a long list of things to change.

A performance audit that finds a lot on a static site is usually an audit that is
pattern-matching, and pattern-matching is what produces the "fix" that isn't one.

## Disposition

The `readingTime` bug is latent and the block is dead. **Not fixed here** — it is outside this
phase's scope, and the honest fix is a product decision (tighten the schema, or delete a UI block
nothing populates).
