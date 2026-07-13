---
slug: debug
invocation: /ak:debug "a guide with readingTime 0 renders a bare 0"
resolvedSkill: ~/.claude/skills/ak-debug/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# debug — proving a bug instead of reasoning about it

## Input

A real defect, surfaced by an earlier audit and handed over **unproven**:

> `guides/[...slug]/page.tsx:85` renders `{page.data.readingTime && (<span>…</span>)}`, and
> `readingTime` is `z.number().optional()` with no `.positive()`. So `readingTime: 0` should pass
> validation, `0 && …` should evaluate to `0`, and React should render a bare **"0"**.

The skill's core discipline is one sentence: **prove the root cause before changing behaviour.**
So the instruction was to confirm or refute it — not to fix it.

```bash
/ak:debug "a guide with readingTime: 0 renders a stray 0 into the page metadata row"
```

## Raw output

### It refused to stop at the code read

````
Cơ chế đúng như audit nêu — nhưng tôi không dừng ở suy luận, đã tái hiện thật.

Reproduction:
  1. Added `readingTime: 0` to content/guides/install-agentkit.mdx frontmatter
  2. npm run build  →  build PASSES, no zod error (confirms 0 slips through the schema)
  3. grep the real prerendered HTML
````

### The proof

````
.next/server/app/en/guides/install-agentkit.html

...text-muted-foreground">beginner</span>0<span class="flex items-center gap-1.5"><svg ... calendar ...
                                        ^
                                        the bare "0", in the shipped HTML
````

A lone `0` sitting between the closing `</span>` of the difficulty badge and the opening `<span>`
of the "Updated" block. The RSC payload carries the same `0` at the matching position in the tree —
confirming it came from that JSX branch and is not a coincidence from some other content.

Then it reverted the frontmatter and confirmed the working tree was clean.

### And then it found the thing that actually mattered

````
grep readingTime content/guides/*.mdx   →   0 results across all 14 guides.

So today, in production, page.data.readingTime is ALWAYS undefined.
`undefined && (...)` renders nothing. The entire "Clock icon + N min read" block
at page.tsx:85-90 is 100% dead code.

The bug is real and will fire the moment anyone sets readingTime: 0 — but its
impact today is zero, because the feature was never wired to real content.
````

## What a reader should notice

**The code read gave the right answer and the wrong conclusion.** "The `&&` guard is wrong for `0`"
is true, and on its own it would have produced a one-line fix — `.positive()` on the schema — that
closes the bug and misses the point entirely.

**Building it is what exposed the real finding.** Nobody uses this field. Not one of fourteen
guides. The block is dead UI, and the honest question is not "how do we make the guard safe" but
"why is there a reading-time display that nothing populates?" — a product question the fix would
have buried.

That is the whole argument for the discipline. Reproducing costs a build; it bought a finding that
reasoning could not reach, because the reasoning was about the code and the finding was about the
*content*.

**A caveat worth stating plainly:** this bug was easy to reproduce. Many are not — a race
condition, a leak that needs a day of traffic. The discipline is still right, but "reproduce it"
is a cheap instruction to give and sometimes an expensive one to follow.

## Disposition

**Not fixed.** The skill was told to prove the cause, not change behaviour, and it did exactly
that. The fix is a product decision — tighten the schema, or delete a UI block that nothing feeds
— and it belongs to the owner, not to a debugging pass.
