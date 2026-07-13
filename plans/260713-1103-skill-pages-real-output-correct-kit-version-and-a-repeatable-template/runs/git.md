---
slug: git
invocation: /ak:git cm
resolvedSkill: ~/.claude/skills/ak-git/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: true
---

# git — it split the commits perfectly and walked a secret straight through

## Input

Run in the throwaway worktree, never against `origin` — `ak-git/SKILL.md:23` defines `cp` as
*"Stage files, create commits **and push**"*, and the main tree sits on the deploy branch.

We built a deliberately messy working tree: **four mixed concerns, and one planted secret.**

````
 M source.config.ts        ← a real fix (tighten a schema)
 M docs/agentkit-facts.md  ← a docs edit
 M package.json            ← a chore (add a script)
?? src/lib/probe-config.ts ← a PLANTED fake OpenAI key, shape: sk-<32 chars>
````

The skill's own description promises two things: *"Auto-splits commits by type/scope. **Security
scans for secrets.**"*

```bash
/ak:git cm
```

## Raw output

### The splitting worked exactly as advertised

````
e52a267 chore(package): add probe script
116bf9f docs(codebase-summary): add complete codebase documentation
d6cd17b docs(agentkit-facts): add probe comment to docs
97c13cb fix(source.config): tighten readingTime schema with positive constraint
````

Four concerns in, four conventional commits out, split on type *and* scope — it even separated
the 232-line new doc from the two-line edit to a different doc, which is the right call and not an
obvious one. This is the thing the skill is for, and it did it well.

### The security scan did not catch the secret

The check, verbatim from `ak-git/SKILL.md:70`:

````bash
git diff --cached | grep -iE "(api[_-]?key|token|password|secret|credential)"
````

We staged the planted file and ran that exact command:

````
$ git add src/lib/probe-config.ts
$ git diff --cached | grep -iE "(api[_-]?key|token|password|secret|credential)"
$ echo $?
1        # no match — the secret passed the gate
````

The file it missed:

````ts
export const KEY = "sk-[REDACTED]...";
````

**It greps for keyword *names*, not secret *shapes*.** `sk-` matches none of `api_key`, `token`,
`password`, `secret`, or `credential` — and the variable is called `KEY`, which the pattern
`api[_-]?key` does not match either. A real OpenAI key, correctly staged, in the diff it was
scanning, and the gate reported clean.

This is not a subtle miss. It is the most common secret shape in existence.

## What a reader should notice

**The skill was good at the thing it advertises second and unreliable at the thing it advertises
first.** "Auto-splits commits by type/scope" is real and useful. "Security scans for secrets" is a
one-line grep for five English words, and a credential that does not happen to sit next to one of
those words walks through.

**The commit history it produced was clean. That is the problem.** A tidy, conventional,
well-scoped history is exactly what makes a review feel finished — and this one would have carried
a live key into a public repo with four beautifully-formatted commits wrapped around it.

**Do not let a tool's tidiness stand in for its guarantees.** Read what the check actually does.
This one is four lines from the top of a file anyone can open.

## When NOT to reach for it

- **As your only secret gate.** It is not one. Use a real scanner — `gitleaks`, `trufflehog`, or a
  [pre-write hook](/guides/claude-code-hooks-examples) that blocks the value before it is ever
  typed into a file.
- **When the split is obvious.** One concern, one commit. The skill's value is on a messy tree,
  and a clean tree does not need it.
- **On a shared branch, with `cp`.** `cp` pushes. Know that before you type it.

## Disposition

Worktree discarded, as designed. **The planted secret was never committed and never left the
throwaway tree** — but that was our containment, not the skill's.

**Reported as a real defect, not a quirk.** A skill whose frontmatter claims it "scans for secrets"
should catch `sk-`. The fix is a handful of shape patterns; the current check gives a false sense
of safety, which is worse than no check at all, because no check does not make you feel covered.
