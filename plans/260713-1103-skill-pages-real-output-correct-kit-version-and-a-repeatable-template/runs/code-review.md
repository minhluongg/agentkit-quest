---
slug: code-review
invocation: /ak:code-review main...HEAD
resolvedSkill: ~/.claude/skills/ak-code-review/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# code-review — pointed at the security gate we had just written

## Input

The diff of the branch we were on, reviewed while it was still open: 4 commits, 51 files. The
substance was ~330 lines of new TypeScript, and the centrepiece was
`scripts/redact-transcript.ts` — **a gate whose entire job is to stop a credential reaching a
published page.**

```
/ak:code-review main...HEAD
```

We had already tested that gate ourselves. It blocked a fake token, a private-kit path, and the
real `VERCEL_OIDC_TOKEN` from `.env.local`. Six of our own fixtures, six passes. We believed it
worked.

## Raw output

The review's own summary line, verbatim:

````
`verify-build.ts` and `page.tsx` are sound — I tried to break them and could not.
`redact-transcript.ts` does not do what its header comment claims. I constructed
five files containing an OpenAI-shaped key, a real Windows home path, or both;
the gate printed `✓ clean` and exited 0 on FOUR of them. The file's own doc
comment says "the one thing that must not happen is nobody looking" — a false
`✓ clean` is precisely the thing that stops people looking.
````

### Critical 1 — the `[REDACTED]` marker was a whole-line bypass

````
if (line.includes('[REDACTED]')) return;      // redact-transcript.ts:176
````

It skipped the **line**, not the redacted **span**. So anything sharing a line with the marker
became invisible:

````
token=[REDACTED] cwd=C:\Users\<redacted>\Documents\secret-project
````

→ `✓ clean`, exit 0.

The review's note on this is the part that stings: *"This is the realistic failure, not an exotic
one: a human redacts the token on a line, the tool goes green, and the username on the same line
ships."* The bypass was **created by using the tool correctly.**

### Critical 2 — the meta exemption had two doors, both open

We had already thought about the obvious abuse: a transcript slapping `kind: meta` on itself to
skip the scan. We guarded it — and guarded it too narrowly:

````
/^status:\s*(RAN|NOT-RUN)\s*$/m       // only the canonical values
````

So `status: RAN (partial capture)` did not match, the file was classified as meta, and it was
**skipped entirely** — API key and all. *"The stricter the `status` regex, the wider this hole."*

And the frontmatter itself was never really parsed:

````
source.split('---')[1]
````

That returns whatever sits between the first two `---` **anywhere in the file**. A document with
no frontmatter, whose body contains a horizontal rule, could forge one:

````
# notes

---
kind: meta
---

key: sk-<redacted>
````

→ `✓ clean`, exit 0.

### Important 3 — the case-sensitivity that defeated the commit before it

````
/[A-Za-z]:\\Users\\[^\\\s]+/          // no `i` flag
````

Windows paths are case-insensitive and real tools print them lowercase. The lowercase rendering of
a home path walked straight through the check written to catch its uppercase twin — **the exact
leak class the previous commit existed to fix.** A one-character fix: add the `i` flag.

*(The two literal paths that were here are now [REDACTED] — the fixed gate caught them in this very
file, which is the most convincing thing it could have done.)*

### Important 7 — the gate was wired to nothing

*"'Nothing leaves `runs/` until it has passed through here' is enforced by a human remembering to
type `npm run redact:check`."* No CI, no hook, no `prebuild`. The header comment described a
guarantee the repo did not have.

## Verification — we reproduced every one

Each bypass rebuilt as a fixture and run against the gate as committed:

````
c1  [REDACTED] on a live line     ✗ '✓ clean' — LEAKED
c2a status: RAN (partial capture) ✗ '✓ clean' — LEAKED
c2b forged frontmatter            ✗ '✓ clean' — LEAKED
i3  lowercase windows path        ✗ '✓ clean' — LEAKED
````

All four now blocked; the two control fixtures (genuinely clean, genuine meta header) still pass.
The gate runs in `prebuild`, so a leak fails the build instead of waiting to be remembered.

## What a reader should notice

**It did not find nits. It found the four ways to walk past the security control, and it proved
each one with a file.** Then it went further and said which parts it had attacked and *failed* to
break — the regex backtracking, the date parsing, the allowlist path normalisation, the hydration
safety of the new component — so the clean bill of health on those is worth something, because it
is a report of an attempt, not an absence of effort.

**And it was reviewing code that had already been tested.** We wrote six fixtures for that gate and
all six passed. Every one tested a *leak we had thought of*. The review's value was not diligence;
it was **an adversary who had not written the code**, and therefore did not share its blind spots.

The finding that best captures it: our `[REDACTED]` skip meant that **redacting a secret correctly
was what created the hole.** Nobody who wrote that line was ever going to see it.

## Disposition

All Critical and Important findings fixed in the same session; fixtures kept as regression tests.
The two Minor findings (symlink recursion, an ENOENT stack trace on a missing `content/`) were
judged real but not worth the code — recorded, not fixed. One finding — that agent pages still do
not render their `kitVersion` — is **accepted and left open**: it is Phase 1 scope, and the build's
version assertion covers the rot it was worried about.
