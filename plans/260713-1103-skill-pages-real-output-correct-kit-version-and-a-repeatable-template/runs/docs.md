---
slug: docs
invocation: /ak:docs summarize
resolvedSkill: ~/.claude/skills/ak-docs/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# docs — summarising this codebase, and what it got wrong

## Input

Run in the isolated worktree (`worktrees/runs`), because this skill **writes**: per
`ak-docs/references/summarize-workflow.md`, `summarize` analyses the codebase and *updates*
`docs/codebase-summary.md`.

```
/ak:docs summarize
```

Target: this site's own `src/` (57 files), `content/`, `source.config.ts`, `scripts/`.

## Raw output

It produced a 232-line `docs/codebase-summary.md` with 12 sections. The structure was good — it
correctly identified the three-stage data flow, and it found the content-override gate without
being told to look for it:

````
2. **Content Override Gate** (`source.config.ts` + `src/lib/overrides.ts`)
   - Guides live in `content/guides/` (user-authored via Fumadocs)
   - Skills/agents have stub pages (auto-generated from catalog) + optional
     overrides in `content/skills/` and `content/agents/`
   - An override file with real content makes a skill/agent page indexable;
     without it, page carries `noindex` (spam prevention)
````

That is accurate, and it is the single most important mechanism in the repo.

## Then we checked its facts, and two things were wrong

### 1. It invented an incident that never happened

What it wrote (`codebase-summary.md:113`):

````
The site initially shipped auto-generated stubs for all 91+ skills/agents.
This triggered Google's spam classifier (scaled thin content). The gate
mechanism now: ...
````

What the source actually says (`src/lib/overrides.ts:24`):

````
 * Without this gate we would ship 91 auto-generated skill pages and 16 agent
 * pages whose only content is a paraphrase of upstream metadata. Google
 * classifies that as scaled content abuse, and the penalty lands on the whole
 * domain — not just the thin pages.
````

The source is **conditional and preventive**: *"without this gate we **would** ship…"*. The
summary turned it into **a past event, stated as fact**: the site shipped the stubs, and Google
penalised it. **Neither happened.** The gate was built before launch, precisely so it would not.

A doc intended to become a codebase's reference now asserts a production incident that does not
exist. Nobody reading it would know to doubt that sentence.

### 2. It got the counts wrong — and wrong in a specific, familiar way

````
codebase-summary.md:3    "It publishes 88 skills, 16 agents, and user-authored guides"
codebase-summary.md:141  "src/data/skills.generated.json (88 items)"
````

Verified against the catalog it claims to be describing:

````
$ node -e "console.log(require('./src/data/skills.generated.json').length)"
91
$ ls content/guides/*.mdx | wc -l
14        # it reported 47
````

**88 is not a random error.** It is the exact figure this project already retracted in public —
a count from the superseded ClaudeKit-era kit. The current code comment it was summarising says
**91**, in the same file, four lines above the passage it did paraphrase correctly.

## What a reader should notice

**The structure was worth having. The facts were not.** Point this skill at an unfamiliar repo
and it will find the architecture, name the modules, and identify the load-bearing mechanism — the
expensive part of writing a summary, done in two minutes. Then it will confidently attach numbers
and history that are wrong, in prose indistinguishable from the parts that are right.

**So the skill is a drafting tool, not a source of truth.** Use it to get the shape. Verify every
number, and be especially suspicious of any sentence that narrates *history* — "initially",
"originally", "this caused" — because the code it is reading has no history in it, so those
sentences are the model filling a gap.

This is not a reason to avoid the skill. It is the reason this project keeps
`docs/agentkit-facts.md` and its first rule: *"If a number is not in this file, it does not go on
the site until someone verifies it and adds it here."* We wrote that rule after publishing 88/13
from a stale kit. The kit's own docs skill just tried to reintroduce 88.

## Disposition

The generated `codebase-summary.md` was **not merged**. It lives only in the throwaway worktree.
Adopting it would mean publishing a fabricated incident and a retracted count into the repo's own
reference documentation.
