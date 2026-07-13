---
slug: web-testing
invocation: /ak:web-testing https://agentkit.quest
resolvedSkill: ~/.claude/skills/ak-web-testing/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# web-testing — a clean result, and the work required to believe it

## Input

Run against the **live production site**, not a local build:

```bash
/ak:web-testing https://agentkit.quest
```

Real Playwright + Chromium. Core Web Vitals via `PerformanceObserver` registered in
`addInitScript` — so the observers exist *before* any page script runs — plus axe-core for
WCAG A/AA, plus a keyboard-navigation pass. Three runs per page, medians taken.

## Raw output

### Core Web Vitals (Chromium 1280×800, medians of 3)

````
                          LCP        TTFB       CLS
Homepage                  396 ms     241 ms     0.0000
/skills/agent-browser     428 ms     232 ms     0.0000
Homepage, throttled       1500 ms    235 ms     0.0025   (4x CPU, Slow 4G)
Skill page, throttled     1484 ms    149 ms     0.0002

Targets: LCP < 2.5s · CLS < 0.1 · TTFB < 800ms
````

### Accessibility: 0 violations — and it proved the scanner could fail

````
axe-core 4.12.1 — wcag2a, wcag2aa, wcag21a, wcag21aa
Homepage:      0 violations, 0 incomplete, 22 rule-groups passing
Skill page:    0 violations, 0 incomplete, 22 rule-groups passing
````

**A clean result is worth nothing if the tool is silently no-op'ing**, so it falsified its own
pass. It injected known-broken markup into the live page and re-ran:

````
Injected: <img> with no alt · empty <button> · empty <a> · #bbb-on-white text

axe returned exactly 4:
  image-alt      [critical]
  button-name    [critical]
  link-name      [serious]
  color-contrast [serious]

The scanner detects. The clean result is real.
````

### Keyboard navigation

````
All 8 tab stops show a visible `solid 2px` focus ring.
Ctrl+K opens role="dialog" with aria-modal="true" and aria-label="Search AgentKit Quest".
Focus moves INTO the input. Escape closes it.
````

### The number that would have become a phantom bug

````
Homepage run 1:  LCP 3600ms / TTFB 3480ms   ← looks like a failure

It isn't. curl shows the edge answering in 176-257ms across 5 requests, with
X-Vercel-Cache: HIT. And the THROTTLED run beat the unthrottled run 1.

The 3480ms was a cold Chromium process paying first-TLS and first-connection
cost — a cold BROWSER, not a cold server.

Had I run once and reported, I'd have filed a perf bug against a site that is fast.
````

## What a reader should notice

**The rigour is the deliverable, not the numbers.** Three things in this run are the difference
between a test report and a guess:

1. **It took medians and discarded the warm-up.** The first run always lies.
2. **It cross-checked an alarming number with a second instrument.** The browser said 3.5 seconds;
   `curl` said 200ms. One of them was measuring the browser, not the site.
3. **It falsified its own passing result.** "0 violations" and "0 rules ran" produce identical
   output. The only way to tell them apart is to feed the scanner something broken and watch it
   complain.

**That third one is the habit worth stealing.** Most a11y reports you will read do not do it, and
most of them are correct — but you cannot tell which ones from the report.

The unglamorous finding: **the site is genuinely clean.** Sub-500ms LCP, effectively zero layout
shift, no WCAG A/AA violations, and a command palette that a keyboard user can actually reach and
escape from.

## When NOT to reach for it

- **Against localhost, if you want the truth about production.** A local `next start` has no CDN,
  no TLS handshake, no real network. It measures your app; it does not measure your site.
- **For a single number.** One run of anything is noise. If you are not taking medians, you are
  reporting the browser's mood.
- **Instead of the unit-level suite.** This tests the shipped page. It will not tell you *why*
  something broke — see [`/ak:test`](/skills/test) for assertions you own, and
  [`/ak:debug`](/skills/debug) for causes.

## Combining it

- **After a rendering change:** [`/ak:web-frameworks`](/skills/web-frameworks) decides what is
  static → `/ak:web-testing` measures whether that actually reached the user.
- **Before trusting a perf "fix":** [`/ak:react-best-practices`](/skills/react-best-practices)
  will tell you a rule fires. This tells you whether it matters in a browser.
- **Design and a11y together:** [`/ak:ui-ux-pro-max`](/skills/ui-ux-pro-max) reviews the code;
  this drives the real thing with a keyboard.

## Disposition

The script was throwaway, run from a temp directory — **nothing was added to `tests/`**, and the
repo is unchanged. The permanent suite ([`/ak:test`](/skills/test)) guards invariants; this was a
measurement, and measurements do not belong in a regression suite.
