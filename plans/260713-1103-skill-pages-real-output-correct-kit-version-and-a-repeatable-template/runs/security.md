---
slug: security
invocation: /ak:security full --red-team
resolvedSkill: ~/.claude/skills/ak-security/SKILL.md
kitVersion: v0.2.0
akCli: 2.1.0
ranOn: 2026-07-13
status: RAN
blocker: ''
redacted: false
---

# security — a threat model of a site with almost nothing to attack

## Input

```bash
/ak:security full --red-team
```

Scope: 129 tracked files. A STRIDE + OWASP sweep with four red-team personas, plus `npm audit` and
a secret scan across the full git history.

The interesting thing about the target is what it *isn't*: a static Next.js content site. No
database, no auth, no user accounts, no write endpoints.

## Raw output

### The surface, measured before anything else

````
Route handlers                                                  3
  …of those, force-static (compiled to a file, never executes)  2
Dynamic endpoints that execute per-request on attacker input    1   ← /og
Write endpoints (POST/PUT/PATCH/DELETE)                         0
Server-side outbound requests (SSRF surface)                    0
Auth / sessions / cookies                                       0
Databases, user records, PII                                    0
````

> The whole runtime attack surface of this website is
> `GET /og?title=<attacker-controlled string>`. Everything else is a prerendered file on a CDN.

### [Medium] `/og` is an unsigned, unbounded, uncached image renderer

````
src/app/og/route.tsx:13   const title = request.nextUrl.searchParams.get('title') ?? siteConfig.name;
src/app/og/route.tsx:37   fontSize: title.length > 60 ? 56 : 68,   ← branches on length, never bounds it

Exports: contentType only. No `dynamic`, no `revalidate`, no Cache-Control.
Compare: llms.txt/route.ts:6 and search-index.json/route.ts:3 both export force-static.
````

*Denial of wallet.* Every distinct `?title=` is a CDN cache miss → a fresh Vercel function
invocation that rasterizes a 1200×630 PNG through satori+resvg, which is CPU-bound. A loop over
random titles bypasses the cache entirely and bills the owner per request. No rate limit, no WAF
rule.

It is **not** XSS — satori rasterizes text to pixels, it does not execute markup. The secondary
impact is that anyone can render an arbitrary string into a branded card served from the real
domain. Reputational, not a breach.

### [Low] An unescaped JSON-LD sink, fed by third-party text

````
src/components/seo/json-ld.tsx:16
  dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
````

`JSON.stringify` does not escape `<`, so a `</script>` inside any string in the schema breaks out
of the tag. And the strings are **not first-party**: `build-catalog.ts` generates
`skill.description` and `skill.keywords` from the frontmatter of the *vendored third-party kit*.
The code comment on line 15 says *"Content is built from our own data, never user input"* — which
is not quite true.

The audit then tested exploitability rather than asserting it: the only `<` characters in the
generated catalog are in `argumentHint` fields, which never reach JSON-LD. **Not currently
exploitable.** An unguarded sink on a real untrusted-input path, currently clean, behind two human
gates. One-line fix.

### [Info] `npm audit`: 3 moderate, 0 reachable — and the "fix" is the danger

````
postcss <8.5.10   XSS via unescaped </style>. Transitive, inside next@16.2.10's bundled copy.
                  Requires attacker-controlled CSS through postcss's stringifier. This site's
                  CSS is first-party and compiled at build time. UNREACHABLE.

                  `npm audit fix --force` "fixes" this by installing next@9.3.3 —
                  a seven-major-version downgrade.

js-yaml           Prototype pollution. Flagged as a direct devDependency — but grep says it is
                  never imported anywhere in src/ or scripts/. A dead devDep. UNREACHABLE.
````

### What it verified as *sound*, by attacking it

- The live `VERCEL_OIDC_TOKEN` in `.env.local` is correctly ignored, and **has never been
  committed** — checked against every tracked file in every commit, not just the working tree.
- `isAgentKitUrl()` compares a *parsed hostname*, not a substring: `agentkit.best.evil.com`
  correctly returns `false`.
- Every external link carries `rel="noopener noreferrer"`; affiliate links add `sponsored`, and
  the build asserts it.

## What a reader should notice

**A threat model is mostly an exercise in subtraction, and the subtraction is the deliverable.**
Five of six STRIDE categories are not "no findings" here — they are *structurally inapplicable*.
There are no accounts, so there is nothing to spoof. No privileges, so nothing to elevate to. No
user can perform any action, so there is nothing to repudiate and nothing worth logging. Once you
have honestly established that, you have also established that the only thing left worth defending
is the single endpoint that still executes on a request — and that is exactly where the one real
finding turned out to be.

**You would not have found it by pattern-matching a checklist.** A checklist would have generated
"no CSP", "no rate limiting", "missing audit logs" — all technically true, all noise on a brochure
site — and buried the one thing that actually costs money.

**And a scanner's output is not a risk register.** `npm audit` returned three moderate advisories,
all three unreachable, and acting on one would have downgraded Next.js by seven major versions.
An audit that manufactures severity to justify its own existence teaches the person reading it to
stop reading.

## Findings raised with the owner

The `/og` Medium is a live cost issue on a deployed site and was surfaced separately. Not fixed
here — it is outside this phase's scope, and it is the owner's Vercel bill.
