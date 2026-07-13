---
slug: plan
invocation: /ak:plan + /ak:plan red-team
resolvedSkill: ~/.claude/skills/ak-plan/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# plan — the red-team subcommand destroyed the plan it had just written

## Input

This one was not staged. **The work in this whole directory was planned with `/ak:plan`**, and
the transcript below is what happened when we then turned the same skill hostile against its own
output.

```bash
/ak:plan "Write real captured output onto the 20 published skill pages"
```

It produced a six-phase plan: a safety gate, a version fix, a capture harness, a template + first
wave, a doc truth-up, and a second wave. Then:

```bash
/ak:plan red-team plans/260713-1103-.../
```

The subcommand spawns hostile reviewers, each with a different adversarial lens — an assumption
destroyer, a failure-mode analyst, a scope critic — and each is required to back every finding
with a `file:line` citation from the actual codebase. Findings without evidence are rejected
before adjudication.

## Raw output

**27 findings. 14 survived deduplication and verification. Four were Critical.** The plan had to
be rewritten from scratch.

### It found a path from a credential to a public page

````
[Critical] .env.local holds a live VERCEL_OIDC_TOKEN. The plan points
/ak:security-scan at "the repo" — and ak-security-scan/SKILL.md:46 runs secret
scanning FIRST, ALWAYS — then orders "paste. Do not summarise" and "never edit
what remains".

The full path: token → runs/security-scan.md → content/skills/security-scan.mdx
→ prerendered HTML → sitemap → Google → AI crawler caches.

No step in the plan looked for this.
````

### It found that "runs on a scratch branch" was a sentence, not a mechanism

````
[Critical] git branch --show-current → main. A merge to main is a live deploy.

  ak-git/SKILL.md:22   `cp` = "Stage files, create commits AND PUSH"
  ak-ship/SKILL.md:3   "merge main, test, review, commit, push, PR"
  ak-fix/SKILL.md:18   --auto is the DEFAULT

The plan says mutating skills "run on a scratch branch" — with no step to create
one, no check, no guard, and a list that omits ship, bootstrap, skill-creator,
worktree, and llms.
````

### It found that the plan's own evidence could never be committed

````
[Critical] .gitignore:62 is `plans/**/*`. Verified with git check-ignore: both the
plan and the template are IGNORED. The `!plans/templates/*` negation is inert —
git cannot re-include a file whose parent directory is excluded.

Every transcript backing 40 public evidentiary claims would live on one machine,
in one untracked directory, reviewable by nobody.
````

### And it caught three things the plan asserted that were simply false

````
Plan claimed                                  Verified reality
─────────────────────────────────────────────────────────────────────────────────
"Two-way guide links ✅ Holds"                4 of 20. Sixteen pages are orphans.
"/skills/plan cannibalises the guide"         Zero keyword overlap. The retarget
                                              was already done; only the map is
                                              stale. The proposed "fix" would have
                                              discarded a real head term.
The 20 OWNER keywords (copied from the map)   10 of 20 differ from what the pages
                                              actually ship. Following the table
                                              would silently retarget 10 indexed
                                              URLs.
````

### The one finding we rejected

A reviewer declared the whole plan dead: *"the `ak` kit is not installed — `.claude/skills/` holds
only `ck-` skills, so `/ak:` cannot resolve, and the real-output thesis is impossible."*

It had checked the project directory and missed the global install. `~/.claude/skills/` holds 91
`ak-` skills, and `ak-code-review/SKILL.md` is byte-identical to the vendored copy. **Rejected on
the evidence** — but the hazard it surfaced was real (the project's 9 `ck-` skills *can* shadow),
so every run record now names the `SKILL.md` that actually answered.

## What a reader should notice

**The plan we would have executed was dangerous, and we did not know it.** Every one of those four
Criticals was invisible from inside the plan — they are things you find by attacking the plan, not
by reading it again more carefully.

**The `file:line` requirement is what makes it work.** A hostile reviewer with no evidence bar
produces plausible-sounding objections; this one had to cite `.gitignore:62`, `ak-git/SKILL.md:22`,
the actual `git check-ignore` output. Every finding could be checked, and one of them was checked
and thrown out.

**And it caught three of our own claims being false.** The plan asserted the guide backlinks were
fine — they were 4 of 20. It asserted a cannibalisation bug that did not exist, and proposed a
"fix" that would have destroyed a working keyword. Confident prose in a planning document reads
exactly like verified fact, and nothing in the document distinguishes them.

## When NOT to reach for it

- **Small, reversible work.** Six phases of planning for a two-file change is the ceremony this
  skill's own `--fast` mode exists to skip.
- **You already know the shape.** Planning is for when the risk is that you are solving the wrong
  problem. If you are not, it is overhead.
- **You will not act on the red team.** Running it and then talking yourself out of the findings
  is worse than not running it — you have now paid for the counsel *and* built a record of having
  ignored it.

## Combining it

- **The full loop:** `/ak:plan` → `/ak:plan red-team` → `/ak:plan validate` → `/ak:cook <plan>`
- **Before planning, if the problem is fuzzy:** `/ak:brainstorm` — a plan is the wrong tool for
  deciding *what* to build.
- **After each phase:** [`/ak:code-review`](/skills/code-review) on what it produced. The red team
  reviews the *plan*; the reviewer reviews the *code*. Both were needed here, and they found
  different things.

## Disposition

The plan was **rewritten from scratch**, not patched. Patching would have left a plan whose
structure still assumed a safe path that did not exist. The rewrite is in this directory, and it
carries the red-team log so the next reader can see what was rejected and why.
