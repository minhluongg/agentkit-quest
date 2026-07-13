---
kind: meta
capturedOn: 2026-07-13
akCli: 2.1.0
kitVersion: v0.2.0
worktree: worktrees/runs
branch: runs/capture-260713
---

> `kind: meta` exempts this file from the redaction gate. It is the run log's header, not a
> transcript: it *names* kit paths in order to document which kit answered `/ak:`, and naming a
> path is not leaking a file's contents. **No `runs/<slug>.md` transcript may carry this flag** —
> it is greppable (`grep -rn "kind: meta" plans/*/runs`) precisely so that smuggling one in shows
> up in review.

# Capture environment

Recorded once, at the top of the run. Every `runs/<slug>.md` in this directory was produced under
these conditions. **This file is the provenance for the `kitVersion: 'v0.2.0'` stamped on every
skill page** — read from the CLI, not copied from a plan.

## The CLI and the kit

````
$ ak --version
ak 2.1.0

$ ak kit list-kits
NAME       VERSION  EXTENDS  AGENTS  SKILLS  COMMANDS  HOOKS  RULES  OUTPUT-STYLES  SCRIPTS
core       0.1.0    -        10      54      0         30     7      6              2
engineer   0.2.0    core     16      91      0         17     7      6              10
marketing  0.2.0    core     32      73      0         3      7      6              9
````

Matches `docs/agentkit-facts.md` exactly: **engineer v0.2.0, 16 agents, 91 skills.** Both product
kits extend `core`, which is why the numbers overlap rather than sum. Do not add them.

## Which kit answers `/ak:` — the question a red-team reviewer got wrong

A reviewer claimed `/ak:` cannot resolve in this project, because `.claude/skills/` holds only
ClaudeKit-era `ck-` skills, and concluded the whole real-output plan was dead. **Verified, and the
conclusion is wrong** — but the underlying hazard it found is real, so it is recorded here.

| Location | `ak-` skills | `ck-` skills |
|---|---|---|
| Project `.claude/skills/` | **0** | 9 (of 93 entries) |
| Global `~/.claude/skills/` | **91** | 1 |

`~/.claude/skills/ak-code-review/SKILL.md` is **byte-identical** to the vendored
`agentkit-engineer/skills/ak-code-review/SKILL.md` (`diff` clean). So `/ak:` resolves — from the
global install — against the same v0.2.0 kit the catalog was built from. The thesis holds.

**But the project's 9 `ck-` skills can shadow.** Nothing in an invocation proves which file
answered it. So:

> **Every `runs/<slug>.md` must record `resolvedSkill:` — the path of the `SKILL.md` that actually
> answered.** A `ck-` path means the transcript is v2.20.0 output and must **not** be stamped
> `v0.2.0`.

## Safety gates active for every run in this directory

- **No skill runs in the main working tree.** All runs happen in `worktrees/runs`, on branch
  `runs/capture-260713`. Confirm `git branch --show-current` ≠ `main` before every session.
- **Forbidden against this repo's `origin`:** `/ak:git cp`, `/ak:git merge`, `/ak:ship`.
  `ak-git/SKILL.md:22` makes `cp` push; `ak-ship/SKILL.md:3` merges to `main`. The main tree sits
  on `main`, and a merge there is a live deploy.
- **`/ak:fix` requires an explicit non-auto flag** — `--auto` is its default (`ak-fix/SKILL.md:18`).
- **Every transcript passes the redaction gate before it leaves this directory:**
  ```
  npm run redact:check -- plans/260713-1103-.../runs
  ```
  It fails loudly and does not auto-scrub. `.env.local` holds a live `VERCEL_OIDC_TOKEN`, and
  `/ak:security-scan` scans for secrets first. **Redaction is mandatory; fabrication is forbidden.**
- **Transcripts use four-backtick fences, ANSI stripped.** Skill output often contains its own
  three-backtick fences, which would close the outer fence early and let MDX parse the remainder —
  breaking the build, or worse, silently mangling the "real" transcript.
