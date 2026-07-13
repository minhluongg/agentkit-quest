---
slug: scout
invocation: /ak:scout Where is the decision made that a skill page is noindex vs indexable?
resolvedSkill: ~/.claude/skills/ak-scout/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# scout — tracing the noindex gate through this codebase

## Input

A question with a known answer, so the skill's work could be checked rather than trusted:

> Where is the decision made that a skill page is noindex vs indexable? Trace the full path from
> an MDX file existing in `content/skills/` to the page's robots meta tag and its inclusion in the
> sitemap.

The skill split the question across two Explore subagents running in parallel — one on the
override/metadata path, one on the sitemap/discovery surfaces — and merged their reports. That
fan-out is what the skill *does*; it is not a wrapper around grep.

## Raw output

The merged answer, as returned:

````
Call chain — content file to robots meta tag:

  content/skills/<slug>.mdx exists
    → source.config.ts:78     skillOverrides = defineCollections({ dir: 'content/skills' })
    → src/lib/overrides.ts:10 skillMap = new Map(skillOverrides.map(...))
    → src/lib/overrides.ts:36 isPublished(kind, slug)
                              return entry !== undefined && entry.noindex !== true
    → page.tsx:38             noindex: !published || override?.noindex === true
    → src/lib/seo.ts:50       robots: noindex
                                ? { index: false, follow: true }
                                : { index: true, follow: true, 'max-image-preview': 'large' }

Two independent sources of noindex:
  1. No .mdx in content/skills/  → skillMap.get(slug) === undefined → isPublished() false
  2. noindex: true in frontmatter → the kill-rule; pulls a published page without deleting it

Note: noindex pages still emit follow: true, not nofollow — links out of a stub still flow.

State: 91 skills · 20 with overrides · 0 with explicit noindex:true · 71 stubs.

DRIFT — three surfaces decide "is this indexable", and only one of them asks:

  src/app/sitemap.ts:35        .filter((skill) => isPublished('skill', skill.slug))   ✓ gated
  src/app/llms.txt/route.ts:30 ...skills.map(...)                                     ✗ no gate
  src/lib/search-index.ts:36   skills.map((skill) => ({ ... }))                        ✗ no gate
````

## Verification — the claim was checked, not taken

Counted against the real build output rather than the source:

````
$ grep -c '<loc>[^<]*/skills/' .next/server/app/sitemap.xml.body
20
$ grep -c '/skills/' .next/server/app/llms.txt.body
91
$ grep -o '"/skills/' .next/server/app/search-index.json.body | wc -l
91
````

`cook` has no `content/skills/cook.mdx`, so it is a `noindex` stub — and it is present in the
built `llms.txt`. The divergence is real, not inferred.

## What a reader should notice

**The skill answered the question and then found something nobody asked about.** The trace itself
was correct and could have been produced by careful grepping. The finding could not: it needed
someone to notice that *three* code paths independently answer "should this page be discoverable",
and that two of them never consult the gate.

**And the right response to that finding is not a patch.** `src/lib/overrides.ts:27` says stubs
exist so that *"users can land on them from search of the exact skill name"* — so the search index
including all 91 is **deliberate**. `noindex` is an instruction to Google, not to the site's own
command palette.

That leaves `llms.txt`, which is a public file served to AI crawlers, listing 71 pages we have
told Google not to index. Whether that is wrong depends on what `llms.txt` is *for* — a complete
reference catalogue, or a mirror of the index. That is a product decision, and the honest output
of a scout is to surface it, not to guess.

**This is the shape of the skill's value: it is fast, it is parallel, and it flags what it noticed
on the way past.** A grep answers the question you asked. This answered the question and told you
which of your assumptions had quietly diverged.

## Open question for the maintainer

Should `llms.txt` filter by `isPublished()`? The search index almost certainly should not (the
stub-as-landing-page behaviour is documented and intentional). `llms.txt` is a genuine call.
**Not changed here — out of this phase's scope, and it is not mine to decide.**
