---
slug: repomix
invocation: npx repomix src --style markdown --compress
resolvedSkill: ~/.claude/skills/ak-repomix/SKILL.md
tool: repomix 1.16.1
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: true
---

# repomix — packing this repo's `src/` for an LLM

## Input

Run in the isolated worktree (`worktrees/runs`, branch `runs/capture-260713`), against this
site's own `src/` directory — 57 files of Next.js app code.

```bash
npx repomix src --style markdown --compress
```

## Raw output

ANSI escape sequences stripped; the absolute output path redacted (it was the author's home
directory, not the reader's).

````
✔ Packing completed successfully!

📈 Top 5 Files by Token Count:
──────────────────────────────
1.  data/skills.generated.json (14,712 tokens, 59,257 chars, 48.9%)
2.  data/agents.generated.json (2,612 tokens, 11,299 chars, 8.7%)
3.  app/[lang]/(marketing)/page.tsx (786 tokens, 3,364 chars, 2.6%)
4.  app/[lang]/(docs)/skills/[slug]/page.tsx (684 tokens, 2,939 chars, 2.3%)
5.  components/affiliate/kit-cta.tsx (623 tokens, 2,593 chars, 2.1%)

🔎 Security Check:
──────────────────
✔ No suspicious files detected.

📊 Pack Summary:
────────────────
  Total Files: 57 files
 Total Tokens: 30,068 tokens
  Total Chars: 122,635 chars
       Output: [REDACTED]/repomix-src.md
     Security: ✔ No suspicious files detected

🎉 All Done!
````

## What a reader should notice

**Two generated JSON files are 57.6% of the pack.** `skills.generated.json` alone is 14,712
tokens — 48.9% — and it is a build artefact, not code anyone reads. Pack `src/` naively and more
than half your context budget goes to data an LLM does not need to reason about the app.

That is the number the "Top 5 Files by Token Count" table exists to show you, and it is the one
thing a `cat`-and-paste approach never tells you. The fix is a `--ignore` glob, and you only know
to reach for it because the tool ranked the files.

The security check is not decorative either: it scanned all 57 files for secrets before writing
the pack. This repo has a `.env.local` with a live token; `src/` does not contain it, and repomix
confirms that rather than asking you to trust it.

## Notes for the page

- The `--compress` flag is doing real work: 122,635 chars from 57 files. Worth stating.
- The ANSI codes and the absolute output path are why every transcript needs the redaction gate
  before it reaches `content/`. Do not paste raw terminal output into MDX.
