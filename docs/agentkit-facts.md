# AgentKit — Verified Facts

**The single source of truth for every AgentKit number, command, and claim this site publishes.**

Last verified: **2026-07-13**, by installing the `ak` CLI and running it on Windows 11.

> **Read this before writing any content.** Every figure below was counted from the kit itself,
> not read off a marketing page. If a number is not in this file, it does not go on the site
> until someone verifies it and adds it here. This file exists because we once published 88
> skills and 13 agents — both wrong, both taken from a superseded kit — and told readers the
> vendor's own figures were inflated. They were not. We were.

---

## The counts

| | Value | Verify with |
|---|---|---|
| **Engineer skills** | **91** | `ak kit list-kits` |
| **Engineer agents** | **16** | `ak kit list-kits` |
| **Categories** | **11** | `src/data/categories.generated.json` |
| **Engineer kit version** | **v0.2.0** | `ak kit list-kits` |
| **CLI version** | **ak 2.1.0** | `ak --version` |
| **Marketing skills / agents** | **73 / 32** | `ak kit list-kits` |
| **Core (shared base)** | **54 skills / 10 agents** | `ak kit list-kits` |

```
$ ak kit list-kits
NAME       VERSION  EXTENDS  AGENTS  SKILLS  COMMANDS  HOOKS  RULES  OUTPUT-STYLES  SCRIPTS
core       0.1.0    -        10      54      0         30     7      6              2
engineer   0.2.0    core     16      91      0         17     7      6              10
marketing  0.2.0    core     32      73      0         3      7      6              9
```

> **Re-captured 2026-07-14.** The earlier block here was missing the `OUTPUT-STYLES` and `SCRIPTS`
> columns — the counts were right, the *shape* was stale. A reader who ran the command would not have
> got what we printed. On a site whose whole argument is "we show you the terminal", a terminal block
> nobody can reproduce is the one thing we cannot ship. **Re-capture the whole block, not the
> numbers.**

Both product kits **extend `core`**, which is why the numbers overlap rather than add up. Do not
sum them.

**Never type these numbers into a component.** They are derived at build time from
`@/lib/catalog` (`skills.length`, `agents.length`) and `publishedSkillSlugs()` /
`publishedAgentSlugs()` for the "how many have we written" counts. A literal in a component is a
number that goes silently wrong the day the kit ships skill 92.

### The vendor's figures disagree, and that is fine

agentkit.best advertises **"60+ skills"** and **"17 agents"**. Our count is 91 and 16. The
vendor's numbers are round and slightly stale; ours are counted. **State the version, publish
what we counted, and do not call the vendor a liar** — that is exactly the mistake we already made
once.

---

## Prices

| Product | Price |
|---|---|
| Engineer | **$99** one-time |
| Marketing | **$99** one-time |
| Bundle | **$149** |

**Affiliate:** 20% starting commission (progressive with GMV). Buyer gets **20% off their first
purchase** through the referral link. Commission holds through a 14-day refund window. Confirmed
from the affiliate dashboard, 2026-07-12. See `docs/seo-content-map.md`.

---

## Commands: two surfaces, do not confuse them

This is the single most common mistake in our own content.

### 1. The `ak` CLI — typed in a terminal

```
ak init | new | setup | login | logout | whoami | licenses | doctor
ak kit list-kits | init | install | install-path | refresh | uninstall | validate
ak migrate            # ClaudeKit → AgentKit. Dry-run by default.
ak run <skill>        # run a skill from the CLI (burns your API credits)
ak backups restore <id>
ak self-update | versions | audit | diagnostics | activity | sessions
ak gui | config | api | plan | projects | update | uninstall | watch
```

### 2. The `/ak:` slash commands — typed inside Claude Code

Canonical prefix is **`/ak:`**. `/ck:` still works as the **legacy alias**, and people who learned
it still search for it — so mention it, but lead with `ak:`.

The seven that carry the daily workflow, with their **real** argument lists (read from
`argument-hint` in each skill's `SKILL.md`):

| Command | Arguments |
|---|---|
| `/ak:plan` | `[task] [--fast\|--hard\|--deep\|--parallel\|--two] [--tdd] [--no-tasks] [--html] [--github] [--wiki]` · subcommands: `archive`, `red-team`, `validate` |
| `/ak:cook` | `[task\|plan-path] [--interactive\|--fast\|--parallel\|--auto\|--no-test] [--tdd]` |
| `/ak:fix` | `[issue] [--auto\|--review\|--quick\|--parallel]` |
| `/ak:debug` | `[error or issue description]` |
| `/ak:test` | `[context]` · or `ui [url]` |
| `/ak:docs` | `init\|update\|summarize` |
| `/ak:watzup` | *(none)* |

Worth knowing: `--two` generates two competing approaches; `red-team` turns the planner hostile
against a plan it just wrote; `cook --auto` removes the human approval gates.

---

## Install — what actually happens (and what the quick-start omits)

```bash
curl -fsSL https://agentkit.best/install.sh | sh     # macOS / Linux
irm https://agentkit.best/install.ps1 | iex          # Windows
```

A fresh install is **not usable**. `ak doctor` itself reports three blockers the official
quick-start never mentions:

1. **`ak login`** — kits are licence-gated. `ak kit init` cannot fetch a paid kit without a session.
2. **`ak setup`** — no `anthropic_api_key` configured.
3. **`ck` shim collision** — if the legacy `claudekit-cli` is installed, `ak doctor` names both
   paths and tells you to resolve it.

Plus: the installer edits your PATH, so **you must open a new terminal**.

### Traps we hit, so content can warn about them

- **Stable `ak` cannot install the kit from the remote registry.** `ak 2.1.0` + `--remote` →
  `kit engineer requires ak >= 2.2.0-beta.14`. The *bundled* kits install fine.
- **`ak login --email` needs a real TTY.** Piped or non-interactive it submits an empty OTP and
  the server returns `400 Bad Request`, which looks like a rejected account but is not. Use
  `--license-key` or `--api-key` with `--no-interactive` when scripting.
- **`ak kit init --global` replaces `~/.claude`.** It prints a restore command as it does:
  `ak backups restore <id>`. `ak migrate` (dry-run) showed it would archive and neutralise **149
  artifacts** on this machine.
- **`--global` installs once for every project** — to `~/.agentkit/adapters/claude-code/engineer`,
  not into the repo. Drop `--global` only to pin one repo to its own kit version.

---

## Where the kit lives, and how to recount

The kit is vendored at **`agentkit-engineer/`** (gitignored — it is licence-gated, not ours to
commit). To refresh it after an upstream release:

```bash
# 1. Build the kit to a scratch dir. --build-only touches nothing in ~/.claude.
ak kit init engineer --target claude-code --build-only --out ./kit-tmp

# 2. Replace the vendored copy
rm -rf agentkit-engineer && mv kit-tmp/ak-engineer agentkit-engineer

# 3. Regenerate the catalog
npm run catalog:build     # → 91 skills / 16 agents / 11 categories

# 4. Rebuild. verify-build.ts asserts the counts independently.
npm run build
```

**Kit layout** (changed at the rename — the old kit's `guide/SKILLS.yaml` no longer exists):

```
agentkit-engineer/
  skills/ak-<name>/SKILL.md    # frontmatter: name, description, category,
  skills/ak-<name>/references/ #   keywords, argument-hint
  skills/ak-<name>/scripts/
  agents/<name>.md             # frontmatter: name, description, tools, model
  hooks/  rules/
```

### The slug trap — read before touching `build-catalog.ts`

Skills are named **`ak:plan`**, not `plan`. Slugging the raw name produces `/skills/ak-plan` and
**renames every published skill URL in one commit**, destroying the indexed catalog. `toSlug()`
strips the prefix: the bare name is identity, the prefix is presentation.

---

## Agents (16)

The original 13 plus three added at the rename:

- **`advisor`** — interview-driven advisory workflow, runs on the strongest model
- **`explore`** — read-only fan-out search
- **`kongming`** — autonomous counsel on **`fable`** (the strongest model). Advisory-only: returns
  advice, not code. A stuck lower-tier agent can escalate to it.

Agents are **workers a skill delegates to**, not commands you type.

---

## Criticising the kit — the bar, and why it is this high

**Nothing below is published on the site. It is the record of a plan that was killed before it
shipped**, and it exists so nobody rebuilds that plan from the same broken evidence. A red team on
2026-07-14 blocked a plan to publish four flaws on the commercial pages. **Three of the four were
wrong**, and the fourth was about our own repo.

We earn a commission on this kit. That does not forbid criticism — it raises the bar for it.

### What we thought we had, and what we actually had

| The claim we nearly published | What verification found |
|---|---|
| *"`/ak:git`'s secret scan is one grep for five English words."* | **False.** A second scan exists at `skills/ak-git/references/safety-protocols.md:7` — 11 patterns, including the `AKIA` **shape**, `-----BEGIN`, and DB connection strings. `SKILL.md:118` links to it. We read the summary and never opened the reference. |
| *"It does not catch an OpenAI-shaped `sk-` key."* | **False.** It catches it whenever the variable is named conventionally. Our probe was `KEY = "sk-…"` — the one naming that evades `api[_-]?key`. `OPENAI_API_KEY` and `openaiApiKey` are both **blocked**, by both scans. |
| *"We ran it and the gate reported clean."* | **We never captured that.** The transcript's "evidence" is a grep we typed by hand. The skill's own output format defines a `✓ security:` line (`SKILL.md:97`) that appears **nowhere** in our run, and the four commits it produced **do not contain the secret file at all** — so the skill may well have blocked or skipped it, and we did not notice. |
| *"`agent-browser`'s ~280 chars/snapshot measures 18,098 — worse than the tool it claims to beat."* | **Wrong mode.** Every invocation in the skill's own docs uses `snapshot -i`. On that: **8,169 chars** — level with the 8K+ Playwright figure, not worse. Our 18,098 came from a flag the docs never tell you to use. |
| *"5 of 20 skills could not be exercised — an honest ceiling on 91 skills."* | **A fact about our repo, not the product.** `runs/not-run.md` says so itself: no database, no Docker, no auth. A backend engineer would find them fine. Republishing that as a product limit is a checkable lie. |

### The one criticism that survived, and it is stronger than the ones that did not

> **The scan matches variable *names*, not secret *values*.** Rename `OPENAI_API_KEY` to `KEY` and the
> identical live key passes **both** of the kit's greps.

True, mechanical, reproducible, and unrebuttable — because it is about how the check works, not about
whether it got lucky. **It is still not published**, because we have never captured the skill's own
output saying so. Inference is not evidence.

### The bar, before any criticism of this kit ships

1. **Read every `references/` file the skill links to.** Not the summary. The summary is not the gate.
2. **Capture the skill's own output**, including the line where it reports its own verdict. A command
   we ran by hand next to a skill is not the skill.
3. **Run it the way the docs say to run it.** A flag we chose is a result we manufactured.
4. **A property of our repo is not a property of the product.** We are a static MDX site. Most of what
   we cannot exercise, we cannot exercise because of us.
5. **Pin the version and the date on the page**, next to the claim. A criticism with no date is a
   grudge; the kit ships fixes, and being wrong about a flaw is worse than never raising it.
6. **We have been publicly wrong about this vendor twice already** (the `2.20.0` version, the
   88/13 counts). Both were low-stakes numbers. A security accusation is not.

---

## Content rules that follow from all of this

1. **Lead with `ak:`, name `ck:` as the legacy alias.** Both appear in the wild; the kit's own
   files still say `ck:` in places.
2. **Never hardcode a count.** Derive it, or cite this file and the command that produced it.
3. **Pin the version** whenever a count appears. It is the cheapest proof of independence we have.
4. **Do not "correct" the vendor from stale data.** We did that. It was wrong. If our number
   disagrees with theirs, state ours, state the version, and leave it there.
5. **If we got it wrong in public, correct it in public** — a callout, not a quiet edit.
6. **Re-capture the whole terminal block, not the numbers.** A block whose *shape* is stale is a
   block no reader can reproduce — and reproducibility is the only thing that separates this site
   from an affiliate blog.
