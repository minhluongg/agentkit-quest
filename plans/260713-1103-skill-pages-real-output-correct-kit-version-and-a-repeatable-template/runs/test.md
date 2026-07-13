---
slug: test
invocation: npm test (playwright)
resolvedSkill: ~/.claude/skills/ak-test/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# test — this repo had no tests, so the run *was* writing the first one

## The honest starting point

`/ak:test` runs a suite. **This repo had no suite.** `package.json` had no `test` script, no
vitest, no jest. `playwright` was in the dependencies and imported by nothing — a dead dependency.

So there were two honest options: mark it NOT-RUN, or write the site's first test and let that be
the run. We took the second, because the missing test was a real gap and the page targets
*"claude code generate tests"* — a page about generating tests, with no test, would be a poor
advertisement for the idea.

## Input

The test asserts the invariant this whole site rests on: **a reference page is indexable only once
someone has written real content for it.** Get that wrong and ~90 auto-generated pages ship, which
Google treats as scaled content abuse — and the penalty lands on the whole domain, not just the
thin pages that earned it.

Nothing is hardcoded. The expected sets are derived from the catalog and from `content/skills/`,
so the day the kit ships skill 92 the test still describes reality. A literal count would go
quietly wrong instead.

```ts
// tests/noindex-gate.spec.ts
const publishedSlugs = skills.map((s) => s.slug).filter((slug) => written.has(slug));
const stubSlugs = skills.map((s) => s.slug).filter((slug) => !written.has(slug));

test('the catalog splits into published pages and stubs', () => {
  // If either side is empty the tests below would pass vacuously, asserting nothing.
  expect(publishedSlugs.length).toBeGreaterThan(0);
  expect(stubSlugs.length).toBeGreaterThan(0);
});
```

It runs against `next start` — the production build — not `next dev`. Everything worth asserting
here is emitted at build time by `generateMetadata`; a dev-server run would prove nothing about
what actually ships.

```bash
npm test
```

## Raw output

````
Running 93 tests using 8 workers

  ✓  4 [chromium] › noindex-gate.spec.ts:43:5 › a page with hand-written content is indexable › /skills/code-review (2.1s)
  ✓ 22 [chromium] › noindex-gate.spec.ts:60:5 › a page without hand-written content is noindex › /skills/cook (2.0s)
  ✓ 74 [chromium] › noindex-gate.spec.ts:60:5 › a page without hand-written content is noindex › /skills/security-scan (2.0s)
  […]
  ✓ 93 [chromium] › noindex-gate.spec.ts:73:1 › the sitemap lists every published page and no stub (754ms)

  93 passed (40.9s)
````

## Then we broke it on purpose

**93 green proves nothing until you have seen it go red.** A test that cannot fail is decoration.

We added `noindex: true` to one published page's frontmatter — a plausible one-word mistake — and
ran it again:

````
  ✘  4 [chromium] › a page with hand-written content is indexable › /skills/code-review
  ✘ 93 [chromium] › the sitemap lists every published page and no stub

  Error: expect(locator).toHaveAttribute(expected) failed
  Expected pattern: /(?<!no)index/
  Received string:  "noindex, follow"

  Error: expect(received).toContain(expected)
  Expected substring: "/skills/code-review<"
````

Two failures, on the two surfaces that matter: the crawler's robots directive, and the sitemap
that invited it. Reverted; 93 green again.

## What a reader should notice

**The suite is worth more than the skill run that produced it**, and it is worth being straight
about that. `/ak:test` executes and reports; it does not conjure a suite out of an empty repo. The
judgement about *what to assert* — that the invariant worth protecting was the publish gate, not
"does the homepage load" — is the part a human still owns.

**The deliberate-failure step is the part people skip.** Writing 93 assertions that all pass on the
first run should make you suspicious, not pleased. Ours did pass first time, and we only know they
are real because we broke the thing they watch and watched them notice.

## Notes for the page

- Real numbers: 93 tests, 40.9s cold, 16.1s warm.
- The regression demo is the strongest content on this page. Lead with it.
- Honest framing: the skill runs tests; a human decides what a test is for. Say so.
