---
slug: agent-browser
invocation: agent-browser open + snapshot
resolvedSkill: ~/.claude/skills/ak-agent-browser/SKILL.md
tool: agent-browser CLI
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# agent-browser — the format delivers, the headline number does not

## Input

Run against the live site.

```bash
agent-browser open https://agentkit.quest
agent-browser snapshot
```

The skill's pitch is a specific, measurable claim (`ak-agent-browser/SKILL.md:19`):

> Chrome/Chromium via CDP with accessibility-tree snapshots and compact `@eN` element refs
> (**~280 chars/snapshot** vs 8K+ for Playwright MCP).

That is a number, so we measured it.

## Raw output

The snapshot format is genuinely good — an accessibility tree, not a DOM dump, with stable refs
you can act on immediately:

````
- banner
  - link "/ agentkit.quest" [ref=e1]
  - navigation "Main" [ref=e2]
    - link "Guides" [ref=e10]
    - link "Skills" [ref=e11]
    - link "Agents" [ref=e12]
  - button "Search guides, skills, and agents" [ref=e3]
    - StaticText "Search…"
    - StaticText "⌘K"
  - button "Toggle theme" [ref=e4]
  - link "Get AgentKit" [ref=e5]
- main
  - StaticText "ClaudeKit is now AgentKit"
  - heading "Every AgentKit skill, catalogued." [level=1, ref=e13]
  […]
````

You can read that. You can click `@e3` without writing a selector. Compared with a raw HTML dump
this is a real improvement, and the `[ref=eN]` scheme is the reason.

## Then we measured it

````
Claimed:                                    ~280 chars/snapshot
                                            ("vs 8K+ for Playwright MCP")

Measured, https://agentkit.quest/           18,098 chars
Measured, /skills/cook (a near-empty stub)  11,743 chars
````

**Both are larger than the 8K+ it attributes to the tool it is beating.** The stub page — the
smallest page on the entire site, a `noindex` placeholder with three paragraphs — is 42× the
claimed figure. The homepage is 64×.

## What a reader should notice

**The format is the product; the number is marketing.** Everything the accessibility-tree
snapshot actually gives you — semantic structure, stable refs, no CSS noise — is real and useful,
and it is why you would reach for this over driving raw Playwright. None of that depended on the
snapshot being 280 characters.

**But `~280 chars/snapshot` is a claim about your context budget**, and context budget is the
entire reason an agent-oriented browser tool exists. A reader planning a long autonomous session
around "each page costs me 280 tokens' worth of characters" is planning around a number that is
off by a factor of 50 on a small page.

**We only know because we counted.** The claim is plausible, it is stated confidently, and it sits
in the skill's own description where nobody thinks to check it. Every other page on this site is
here because we ran the skill; this one is here because we ran `wc -c` on the output.

## When NOT to reach for it

- **When you need the user's real Chrome profile.** This drives a fresh browser — no cookies, no
  logged-in session. That is the point (it is deterministic), and it is also a hard limit.
- **When you want assertions, not exploration.** This drives and reports.
  [`/ak:web-testing`](/skills/web-testing) is what you want if the output should be a pass/fail.
- **On a large page, in a long loop.** Snapshots are not 280 characters. Budget for what you
  actually measured on *your* pages.

## Combining it

- **Exploratory QA:** `agent-browser` to drive and see → [`/ak:web-testing`](/skills/web-testing)
  to turn what you found into an assertion that fails next time.
- **After a UI change:** [`/ak:ui-ux-pro-max`](/skills/ui-ux-pro-max) reviews the code; this
  drives the rendered result.

## Note on the run

The first attempt timed out at four minutes: `agent-browser open` holds the browser and does not
return. It works fine with an explicit timeout and a separate `snapshot` call — but the failure
mode is a hang, not an error, which is worth knowing before you put it in a script.
