---
slug: ui-ux-pro-max
invocation: /ak:ui-ux-pro-max review src/components/
resolvedSkill: ~/.claude/skills/ak-ui-ux-pro-max/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# ui-ux-pro-max — it found two real bugs, and retracted a third

## Input

```bash
/ak:ui-ux-pro-max review src/components/
```

A 666-line priority-ranked checklist (Accessibility → Touch → Performance → Style → Layout →
Type/Color → Animation → Forms → Nav → Charts). Applied in review mode, then **every claim
measured on the live site with Playwright** rather than eyeballed.

## Raw output

### [HIGH] Keyboard focus escapes the open mobile drawer

Measured at 390px:

````
tab 5: IN-DRAWER  a "Get AgentKit"
tab 6: >>ESCAPED  input "Filter skills"
tab 7: >>ESCAPED  button "All 91"
````

`mobile-nav.tsx:57-87` has no `role="dialog"`, no `aria-modal`, no focus trap. The page behind is
scroll-locked and visually covered, so a keyboard user is tabbing through invisible controls.

**The same codebase gets this right elsewhere.** `command-palette.tsx:148-166` traps Tab, closes
on Escape, and returns focus to the trigger — verified live. The drawer just never got the same
treatment.

### [HIGH] Guide tables force horizontal page scroll on phones

````
                                          360px viewport   overflow
/guides/agentkit-vs-free-alternatives     478px            +118px
/guides/claude-code-hooks-examples        406px            +46px
/guides/agentkit-core-commands            393px            +33px
/  and  /skills                           360px            clean
````

`globals.css:222` styles `.prose-doc table` with no scroll container, and `mdx-components.tsx`
maps no `table` component. **`.prose-doc pre` does get `overflow-x: auto` (line 251)** — code
blocks scroll correctly. Tables were missed.

The whole body scrolls sideways, not just the table. **11 of 14 guides contain tables.**

### [MEDIUM] The active filter chip's count fails contrast

````
skills-explorer.tsx:197 — [&_span]:text-primary-foreground/70 on bg-primary

Dark:   #0f172a @70% over #3b82f6  =  3.19:1   (needs 4.5:1)  FAIL
Light:  #ffffff @70% over #2563eb  =  3.34:1                  FAIL

Dropping the /70 gives 4.85:1 / 5.17:1 and passes.
````

### And then it retracted a Critical

````
I initially measured the focus ring as `currentColor` and nearly filed an
"invisible focus ring — WCAG fail" as critical.

It was a measurement artifact — I was reading a computed style MID-TRANSITION.
Settled, it is var(--ring) on every element: 3.68:1 light, 7.02:1 dark.
Both clear the 3:1 bar.
````

### What it verified as sound, with numbers

````
Body text contrast          17.85:1 light / 16.30:1 dark
--muted-foreground           7.58:1 / 6.96:1
Primary button               5.17:1 / 4.85:1
Reduced motion               0 elements still animating >50ms under prefers-reduced-motion
One-off hex values in src/   0 — every colour goes through a token
Icon buttons without label   0 across 24 components
Line length                  70 chars — dead centre of the 60-75 band
````

## What a reader should notice

**The interesting failures were not in the design system — they were at its edges.** Token
discipline here is near-perfect and the accessibility bar clears most production sites. Yet both
real bugs live where **authored content meets styled chrome**: markdown tables got no scroll
wrapper *even though code blocks did*, and the mobile drawer got no focus trap *even though the
command palette did*.

Both are cases where a pattern was solved once, correctly, and simply not carried across to its
sibling. **That is where to look on a codebase that is otherwise careful.**

**And the retraction is the most valuable thing in the report.** It nearly filed a Critical
accessibility failure that did not exist, because it sampled a computed style during a 200ms
transition. On a site this carefully built, the correct prior is that *a surprising finding is a
bad measurement* — verify before you file, or a design audit becomes a generator of confident
fiction.

**Roughly half the skill's 200+ rules are mobile-app rules a docs site cannot fail.** Skipping 30
form rules on a site with no forms is correct, not lazy — and saying so is part of the output.

## Disposition

Both HIGH findings are **real, reproduced, and reported to the owner.** Neither is fixed here —
they are outside this phase's scope, and the table fix touches 11 live guide pages.
