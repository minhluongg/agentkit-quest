# W3 Distribution — everything is drafted; you press the buttons

**Date:** 2026-07-13 · **Phase:** 2 of `plans/260713-1441-agent-content-cut-to-what-has-a-trigger/`

Every rule below was read from the target's own `CONTRIBUTING.md` or issue form, not inferred.
Nothing here has been posted. **Nothing in this phase can be posted by an agent** — one target
forbids it in writing, and the rest run on your identity.

---

## The finding that reorders the whole phase

The content map's W3 row reads: *"repo → awesome-lists; guides → HN, Reddit, dev.to"* — lists first.

**The maintainer of the biggest list (49,903 stars) says that order is the common way to fail.**
Verbatim, from `hesreallyhim/awesome-claude-code/CONTRIBUTING.md`:

> "Too many people think like this: (i) Build something awesome; (ii) Submit to Awesome Claude Code;
> (iii) Get accepted, because of being awesome; (iv) Get users. However, a more likely chain of
> events is: (i) Build something awesome; (ii) **Get users**; (iii) Submit it to Awesome Claude Code
> — or just focus on the project, and I'll notice it if it gathers enough interest. **If 'getting on
> the list' is any part of a promotional strategy for your project, you should be prepared to have a
> backup plan.**"

Supporting evidence, measured today: that repo has **643 open issues**, eight new resource
submissions **today alone**, and roughly one merged resource in the past month. Submitting is a
lottery ticket — cheap to buy, low odds, and the odds are stated on the tin.

**So the order is: get users → then the lists.** Which means **§3 (HN / Reddit) is the phase, and
§1–2 are the cheap tickets you buy on the way past.**

---

## §1 — rohitg00/awesome-claude-code-toolkit (2,305★) · the one real, actionable link

**This is the best target and it is not close.** It accepts PRs, it accepts brand-new zero-star
projects, and it has a direct precedent.

> ⚠️ **Do NOT contribute to its `hooks/scripts/` path.** Its `CONTRIBUTING.md` says *"Hook Scripts —
> Scripts go in `hooks/scripts/` with an update to `hooks/hooks.json`."* That **copies your hooks
> into their repo**. You would be donating 26 tested hooks to a 2,305-star competitor and receiving
> no link. The **Ecosystem table** is the outbound-link section. That is the one to target.

Precedent in that table right now — a directly comparable project, listed with no stars at all:

> `cc-discipline` | **new** | Guardrails for Claude Code — shell hooks that physically block bad
> behavior … not just markdown rules.

**The entry, in their exact table format** (`| Name | Stars | Description |`):

```markdown
| [claude-code-hooks](https://github.com/minhluongg/claude-code-hooks) | new | 26 hooks for Claude Code, each executed as a real child process against a real payload in CI — 103 assertions, green on Windows, macOS and Linux. Zero dependencies: plain Node, no bash, jq, or Python. Every hook fails open — a crashing hook exits 0 rather than ending your session. MIT |
```

**Their PR process, verbatim:** fork → branch → commit → push → open PR. Their guidelines also say
*"Update the README table if adding a new item to any category"* and **"No generated attribution
footers in files"** — so no AI trailers in the commit.

**Suggested PR title:** `docs: add claude-code-hooks to Ecosystem`

**Suggested PR body:**

```markdown
Adds `claude-code-hooks` to the Ecosystem table.

26 hooks for Claude Code across security, git, quality, testing, formatting and context.

What is different about it:

- **Every hook is tested.** Each one is executed as a real child process, fed a real Claude Code
  payload on stdin, and asserted on its exit code and stdout — 103 assertions, CI green on Windows,
  macOS and Linux. The suite caught real bypasses before release, including `rm --recursive --force /`,
  `git push origin +main`, and `bash <(curl ...)`.
- **Zero dependencies.** Plain Node — no bash, no jq, no Python/uv. Claude Code ships over npm, so
  Node is already on every machine that can run it. The official hook examples use bash + jq, which
  breaks on Windows.
- **Hooks fail open.** An unexpected error exits 0 and does nothing, rather than blocking the
  session. A guardrail that breaks the thing it guards is not a guardrail.

MIT. Not affiliated with Anthropic.
```

**Honest expectation:** 30 open PRs, and its last merge was 2026-05-12 — two months ago. It merges
third-party PRs when it is awake (five in a row on 2026-05-11/12, all from outside contributors).
It may simply be dormant. The PR costs ten minutes and sits there for free.

---

## §2 — hesreallyhim/awesome-claude-code (49,903★) · the lottery ticket

**Read this before doing anything.** Two rules, both verbatim, both carrying a penalty:

> "**ALL RECOMMENDATIONS MUST BE MADE USING THE WEB UI ISSUE FORM TEMPLATE, OR YOU RISK BEING
> RESTRICTED FROM INTERACTING WITH THIS REPOSITORY TEMPORARILY.**"
>
> "**It is not possible to submit a resource recommendation using the `gh` CLI.**"
>
> "resource recommendations must be **created by human beings**."

So: **do not open a PR there** (it risks a ban), and **an agent cannot do this for you** — not as a
policy I am choosing, as a rule they wrote. It is a five-minute form in a browser.

**[Open the form](https://github.com/hesreallyhim/awesome-claude-code/issues/new?template=recommend-resource.yml)**
and paste these values:

| Field | Value |
|---|---|
| **Display Name** | `claude-code-hooks` |
| **Category** | **`Security`** |
| **Link** | `https://github.com/minhluongg/claude-code-hooks` |
| **Author Name** | `minhluongg` |
| **Author Link** | `https://github.com/minhluongg` |

**Description** (their rules: 10–500 chars, *"descriptions — not a sales pitch"*, *"don't address the
reader"*, one line, **no emojis**):

```
Twenty-six Claude Code hooks covering security, git safety, test integrity, and code quality. Each hook is executed as a child process against a real Claude Code payload in CI, with 103 assertions passing on Windows, macOS and Linux. Written in plain Node with no dependencies — no bash, jq, or Python — and every hook fails open, exiting 0 on an unexpected error rather than ending the session.
```

**On the category.** The dropdown has 18 options and **none of them is "Hooks"** — I checked. The
closest honest fit is `Security`: six hooks are security proper, and the headline ones
(`block-secret-writes`, `block-dangerous-rm`, `protect-sensitive-files`, `block-test-sabotage`) are
what makes the set distinctive. `Linting` and `Infrastructure & DevOps` are the alternatives and
both undersell it.

**Also worth knowing:** approval earns you a badge for the README —
`[![Mentioned in Awesome Claude Code](https://awesome.re/mentioned-badge.svg)](...)`.

---

## §3 — The part that actually works: get users

This is now the main event, on the maintainer's own advice.

### Hacker News — Show HN

Post the **repo**, not the site. HN punishes anything that smells like content marketing, and the
repo is the honest artifact.

**Title** (HN rules: no marketing adjectives, no emoji):

```
Show HN: 26 tested, zero-dependency hooks for Claude Code
```

**First comment** (post immediately after submitting — this is the convention, and it is where the
real pitch goes):

```
I kept copying Claude Code hook snippets out of blog posts and README files, and I
noticed something: almost none of them have ever been run. They ship with regexes that
match nothing, or match everything.

So I wrote 26 and tested all of them. Each hook is executed as a real child process, fed
a real Claude Code payload on stdin, and asserted on its exit code and stdout — the same
contract Claude Code itself relies on. 103 assertions, green on Windows, macOS and Linux.

The tests earned their keep. They caught a `rm -rf "$VAR/"` guard whose quote handling was
wrong — precisely the case it exists to catch — and after an adversarial pass, bypasses via
`rm --recursive --force /`, `git push origin +main`, and `bash <(curl ...)`. All regression
tests now.

Two other things I cared about:

- Zero dependencies. The official examples use bash + jq. jq isn't on most Windows machines
  and the bash breaks under PowerShell. The largest existing hooks repo needs Python and uv.
  These are plain Node — and Claude Code ships over npm, so Node is already there.

- They fail open. A hook that crashes takes your session with it. Every one of these wraps
  its body so an unexpected error exits 0 and does nothing. A guardrail that breaks the
  thing it guards is not a guardrail.

The one I'd actually argue for is `block-test-sabotage` — it blocks `.skip`, `.only`,
`@ts-ignore` and blanket `eslint-disable`. The test fails, the agent disables it, the suite
goes green, the bug ships. That's the most common dishonest behaviour I've seen in agentic
coding and it is the easiest to miss in review.

MIT, no attribution required. Happy to be told which of these are wrong.
```

**Timing:** weekday, 08:00–10:00 US Eastern. Do not ask anyone to upvote — HN detects voting rings
and it is terminal.

### Reddit — r/ClaudeAI and r/ClaudeCode

Read each sub's self-promotion rule first; several require a flair or restrict link posts. **A text
post that leads with the free artifact and links to the repo.** Same content as the HN comment,
minus the "Show HN" framing. Do not post both subs the same hour.

### dev.to — cross-post

Cross-post `/guides/claude-code-hooks-examples`. **`rel=canonical` back to agentkit.quest is
mandatory** — dev.to has far more domain authority than we do, and an uncanonicalised cross-post
will outrank our own page for our own keyword, with our own text. dev.to supports a
`canonical_url` field in the post's front matter; fill it.

---

## What to do, in order

1. **§3 HN + Reddit.** This is what produces users and stars, and everything else keys off it.
2. **§1 rohitg00 PR** (Ecosystem table, *not* `hooks/scripts/`). Ten minutes, real link, may sit.
3. **§2 hesreallyhim form.** Five minutes in a browser. A ticket, not a plan. Better odds *after*
   §3 has produced traction — which is exactly what the maintainer said.

---

## Already done, in this session

- **`claude-code-hooks` README fixed.** The quickstart claimed **85 assertions**; the suite runs
  **103**. Two numbers for the same suite, eleven lines apart — in the repo whose entire premise is
  that its hooks are demonstrably tested. Committed **locally, not pushed** (commit `91beb26`).
  **Push it before submitting anywhere.**
- **The P1 kill rule now has an instrument.** It was unfireable: two clauses, no way to measure
  either. `docs/seo-content-map.md` now names Search Console → Links → referring domains, threshold
  **< 3**, and forbids substituting impressions.

## Unresolved

- **The content map's W3 row still says lists-then-social.** The evidence above inverts it. The row
  should be corrected — flagging rather than silently rewriting the map, since the sequencing is a
  strategy call.
- `karanb192/claude-code-hooks` (445★) and `rohitg00`'s `hooks/scripts/` are **traps**, recorded here
  so nobody "helpfully" submits there later. Both absorb your hooks and return no link.
