# SEO Content Map — agentkit.quest

**Last updated:** 2026-07-12 (revised after red-team + revenue correction)
**Source plan:** `plans/260712-1556-seo-content-map/plan.md`
**Red-team:** `plans/260712-1556-seo-content-map/reports/from-red-team-to-planner-content-map-adversarial-review.md`
**SERP evidence:** recon run 2026-07-12 — `plans/260712-1440-agentkit-quest-web-skeleton/reports/researcher-260712-{1602,1558}-*.md`

---

## How to read this document

**There are no search-volume numbers, deliberately.** Nothing available to this project returns volume (WebSearch does not; Ahrefs/SEMrush/Keyword Planner need paid accounts). Inventing them would mean scheduling months of work against fabricated inputs.

Rows are ranked on two things that *were* measured against live SERPs:

- **Intent** — `TRANS` (deciding to pay) · `COMM` (comparing) · `INFO` (learning).
- **Winnability** — can a zero-authority domain displace what ranks today? Graded from the actual SERP, evidence quoted in the row.

**Owner column.** One keyword, one URL. The `OWNER` column names the single page allowed to target that keyword. Any other page touching it must go long-tail, merge, or die. Without this, 40 pages on a domain with no authority to spare split their internal PageRank and Google picks the shallowest one.

**Status:** `TODO` · `WRITING` · `LIVE` · `NOINDEX` (route exists; stub; excluded from sitemap) · `DROPPED`

---

## Revenue context (read before deciding effort)

| Source | Figure | Confidence |
|---|---|---|
| Product owner's stated figure | ~6 bn VND ≈ **$230,000 lifetime** | Asserted; **unverified here** |
| TrustMRR (verified via Polar API, 2026-07-12) | **$73,419 lifetime**, no MRR — one-off sales | Verified, but **Polar processor only** |

The two disagree by ~3×. Unresolved: the vendor may use multiple processors, or the larger figure may aggregate several of the founder's products. **Both are recorded; neither is quietly preferred.**

At the user's figure — $230k over ~9 months of selling (kit's first commit: 2025-10-02) ≈ $25k/mo ≈ **~250 sales/month at $99**. Affiliate commission is **$40/sale**:

| Share of vendor sales captured | Commission |
|---|---|
| 3% | **$300/mo** |
| 5% | **$500/mo** |
| 10% | **$1,000/mo** |

That justifies the ~40-page investment. **If the $230k figure turns out to include other products, the realistic band drops to $100–300/mo** — confirm before committing the full effort.

---

## Two rules that govern this map

**1. Target the job, not the invocation.** Nobody searches `/ak:code-review`. Skill pages keep their URLs but target the *job the skill does* ("claude code code review"), so AgentKit is the **answer** to the query, not the subject of it.

But — and this is the red-team's correction — that only works if the page **genuinely answers the query, free method included**. A page that withholds the free answer to make the kit look necessary does not answer the query, and loses to the official docs and dev.to, which do, for free. **There is no penalty to fear; there is irrelevance, which is duller and far more likely.** So every page teaches the free way in full, and positions the kit as *"here is the hour count you're buying instead of building this."*

**2. Design for the artefact, not the essay.** 26 of these pages are informational — the exact class AI Overviews are hollowing out. And the page rated *most* winnable (row 9) is a **definitional** question: the perfect AI Overview answer, zero clicks. **If a page's value can be restated in four sentences, it will be, and we get no click.** Every informational page ships something un-summarisable: a runnable repo, a 30-row copy-paste table, a decision tree, real output from a real run.

---

## Tier W1 — The link engine. Ships first.

**Without external links, nothing below this line ranks.** Internal links redistribute authority; they do not create it. This tier is the only thing in the map that manufactures any.

Evidence: GitHub repos rank **top-5 for nearly every winnable query** in this niche — `disler/claude-code-hooks-mastery`, `VoltAgent/awesome-claude-code-subagents`, `shinpr/claude-code-workflows`, `alirezarezvani/claude-skills`. **In this niche, the repo is the link asset.**

| # | Asset | Owner keyword | Why | Status |
|---|---|---|---|---|
| R1 | **GitHub repo `claude-code-hooks`** — 26 runnable hooks, MIT, by use case (security/git/testing/quality/formatting/context), each executed by 103-assertion CI | — (ranks on its own; earns links) | Free and useful → attracts links from people who never link to blog posts. Credible *because* it is free. | **LIVE** — [github.com/minhluongg/claude-code-hooks](https://github.com/minhluongg/claude-code-hooks), CI green on Win/Mac/Linux. Not yet PR'd into awesome-lists (W3, manual). |
| 11 | `/guides/claude-code-hooks-examples` | **claude code hooks examples** | The repo's companion guide — a copy-paste table + repo, deliberately not prose (AI-Overview-resistant). | **LIVE**, indexable, in sitemap. |
| 9 | `/guides/skills-vs-commands-vs-subagents` | **claude code skill vs command vs subagent** | The ranking test (weakest SERP: #1 was a newsletter). Ships a decision tree, not prose. Leads with the 2026 "commands merged into skills" fact that dates every older guide. | **LIVE**, indexable, in sitemap. *Note: this is P1 row 9, shipped early as the ranking hypothesis test — see sequencing.* |

---

## Tier P0 — Commercial. The conversion surface.

Small audience, but the **only** queries where someone is deciding to spend money. Near-zero competition.

> ✅ **Prerequisite met: the kit is owned.** The purchased kit is installed at `.claude/` and vendored at `claudekit-engineer/` (v2.20.0). Its plan → cook → review workflow and subagents were used first-hand throughout this project — genuine material for the reviews Google's reviews system demands.

> ⚠️ **Routes do not exist.** `/compare/*`, `/reviews/*`, `/pricing` have no route segments in the app. **KISS: publish all of these under `/guides/`.** URL prefixes carry no ranking weight; a `/compare/` taxonomy costs a route group and buys nothing.

| # | URL | OWNER keyword | Intent | SERP evidence (2026-07-12) | Winnable? | Status |
|---|---|---|---|---|---|---|
| 1 | `/guides/agentkit-vs-free-alternatives` | **is agentkit worth it** | TRANS | **No page answers this.** Free rivals are huge (awesome-claude-code-toolkit = 135 agents; aitmpl = 1000+ components; Anthropic bundles skills free) yet nothing compares them honestly against a $99 kit. Also the only P0 row with category-level pull. | **Very high** | **LIVE** — first-hand review, honest Buy if / Don't buy if verdict, in sitemap. |
| 2 | `/guides/agentkit-vs-claude-code-alone` | **do i need claudekit** | TRANS | Unoccupied. Reader already has Claude Code and is asking whether the kit adds anything. | **Very high** | TODO |
| 3 | `/guides/agentkit-engineer-review` | **claudekit review** | TRANS | `theclaudekit.com` (vendor-adjacent) ranks p1. A vendor reviewing itself is a gap, not a wall — but only if ours is first-hand. **Requires the kit.** | **High** | TODO |
| 4 | `/guides/claudekit-to-agentkit` | **claudekit renamed agentkit** | INFO→TRANS | `claudekit.cc` 301s to `agentkit.best`; CLI moved `ck`→`ak`; **the vendor's own shipped kit still says `ck:` internally.** Existing users hitting this confusion have nowhere to go. High-trust entry point. | **Very high** | TODO |
| 6 | `/guides/which-agentkit-kit-to-buy` | **agentkit engineer vs marketing vs bundle** | TRANS | Uncontested. Reader is past "should I buy" and onto "which one" — **the highest-intent query on the whole site.** | **Very high** | TODO |

**Dropped from P0** (red-team, accepted):
- ~~`/pricing`~~ — **you will not outrank a vendor's own pricing page for its own pricing**, and if you did, the searcher wanted the vendor anyway.
- ~~`/guides/agentkit-refund-and-license`~~ — same reason. The vendor answers this definitionally better.
- ~~`/compare/agentkit-vs-cursor`~~ — **moved to P1.** It is not a commercial query *for AgentKit*; the conversion mechanism ("and here's the kit that closes the gap") is a bait-and-switch that violates our own honesty rule. It is also the **most** competitive query in the map (SitePoint, Builder.io, 7+ incumbents — "fragmented" ≠ "weak").

**Kill rule (P0).** At 90 days a new domain shows ~zero impressions **regardless of page quality** — killing on impressions then would delete the commercial tier on evidence indistinguishable from "the domain is new". So: at 90 days the valid signals are **indexation** (is it in the index at all?) and **position for the exact-match keyword**. Impressions become a valid kill signal at **~6 months**.

---

## Tier P1 — Category pillars. Traffic and links.

Real demand, weak SERPs. But these readers largely want the *free* way — **judge these on links earned and assisted conversions, not direct sales.**

| # | URL | OWNER keyword | Intent | SERP evidence | Winnable? | Status |
|---|---|---|---|---|---|---|
| 9 | `/guides/skills-vs-commands-vs-subagents` | **claude code skill vs command vs subagent** | INFO | **#1 result is a newsletter. No canonical guide exists.** The weakest SERP found. ⚠️ Also the most AI-Overview-vulnerable page here (definitional) — **must** ship a decision tree, not prose. | **Very high** | TODO |
| 10 | `/guides/how-to-write-a-claude-code-skill` | **how to create claude code skill** | INFO | A Substack ranks #4 titled *"best practices nobody put in the docs"* — the SERP itself is saying the official docs are insufficient. | **High** | TODO |
| 12 | `/guides/claude-code-agent-orchestration` | **claude code agent orchestration** | INFO | Top results are **SaaS blogs marketing their own tools, not teaching.** A neutral guide with working code breaks in. AgentKit's 13 agents are a live worked example. | **High** | TODO |
| 13 | `/guides/claude-code-workflow-patterns` | **claude code workflow patterns** | INFO | MindStudio ranks #5 with "5 patterns". Beatable with more patterns + a decision tree. **Owns "plan mode" too** — see cannibalisation note. | **Med-high** | TODO |
| 7 | `/guides/claude-code-vs-cursor` | **claude code vs cursor 2026** | COMM | Moved down from P0. Fragmented indie blogs, outdated. Real traffic — but 7+ incumbents including SitePoint and Builder.io. Do **not** bolt an AgentKit CTA onto it; that is the bait-and-switch the honesty rule forbids. | **Medium** | TODO |

**Cannibalisation resolved.** Three pages previously targeted one topic:
- ~~`/guides/claude-code-plan-mode`~~ → **merged into row 13** as a section. (Armin Ronacher's post holds #1 there anyway — a real authority, not a newsletter.)
- ~~`/skills/plan` targeting "claude code planning workflow"~~ → **retargeted** to a distinct long-tail, or dropped. Row 13 owns the planning cluster.

**Kill rule (P1).** Below position 20 at 6 months **and** zero links earned → cut. Authority-building has to actually build authority.

---

## Tier P2 — The 20 skill pages, targeted at job keywords.

Routes already exist (the skeleton generates all 88, currently `noindex` stubs). Writing `content/skills/<slug>.mdx` flips a page to indexable automatically.

> ⚠️ **Blocked on code work.** The claim that this "costs no architecture change" was **false**. Three gaps, all verified:
> - Override schema has **no `keywords` field** — `generateMetadata()` pushes the vendor's *invocation-flavoured* keywords into `<meta>` and JSON-LD unconditionally. A page whose whole thesis is "target the job" would ship invocation keywords.
> - Override schema has **no `noindex` field** — so this tier's kill rule has no mechanism; the only way to unpublish is to delete the file.
> - Worked examples must be **pinned to a kit version** in frontmatter, or one `ak:` breaking change invalidates all 20 pages at once. (This vendor's own kit *still says `ck:` internally* — it breaks its own naming.)

| # | URL | OWNER keyword (the JOB) | Skill | Status |
|---|---|---|---|---|
| 15 | `/skills/code-review` | claude code code review | `/ak:code-review` | NOINDEX |
| 16 | `/skills/debug` | claude code debugging workflow | `/ak:debug` | NOINDEX |
| 17 | `/skills/test` | claude code generate tests | `/ak:test` | NOINDEX |
| 18 | `/skills/security` | claude code security audit | `/ak:security` | NOINDEX |
| 19 | `/skills/mcp-builder` | build an mcp server with claude code | `/ak:mcp-builder` | NOINDEX |
| 20 | `/skills/git` | claude code conventional commits | `/ak:git` | NOINDEX |
| 21 | `/skills/docs` | claude code generate documentation | `/ak:docs` | NOINDEX |
| 23 | `/skills/web-testing` | claude code playwright tests | `/ak:web-testing` | NOINDEX |
| 24 | `/skills/deploy` | claude code deploy to vercel | `/ak:deploy` | NOINDEX |
| 25 | `/skills/devops` | claude code docker *(K8s split out — one page, one keyword)* | `/ak:devops` | NOINDEX |
| 26 | `/skills/databases` | claude code database schema design | `/ak:databases` | NOINDEX |
| 27 | `/skills/better-auth` | better auth setup with claude code | `/ak:better-auth` | NOINDEX |
| 28 | `/skills/react-best-practices` | claude code react performance | `/ak:react-best-practices` | NOINDEX |
| 29 | `/skills/web-frameworks` | claude code next.js app router | `/ak:web-frameworks` | NOINDEX |
| 30 | `/skills/ui-ux-pro-max` | claude code ui design | `/ak:ui-ux-pro-max` | NOINDEX |
| 31 | `/skills/agent-browser` | claude code browser automation | `/ak:agent-browser` | NOINDEX |
| 32 | `/skills/repomix` | pack a repo for an llm | `/ak:repomix` | NOINDEX |
| 33 | `/skills/review-pr` | claude code review a github pr *(distinct from row 15)* | `/ak:review-pr` | NOINDEX |
| 34 | `/skills/scout` | claude code explore a large codebase | `/ak:scout` | NOINDEX |
| 22 | `/skills/plan` | *(retarget or drop — row 13 owns planning)* | `/ak:plan` | NOINDEX |

**Overlaps flagged and resolved:** row 15 (code review) vs 33 (review a PR) — distinct keywords, kept. Row 24 (Vercel deploy) vs 25 (Docker) — row 25 previously targeted *Docker AND Kubernetes in one row*, which ranks for neither; K8s dropped. Row 16 (debug) vs 34 (explore codebase) — distinct enough, watch in GSC.

**Kill rule (P2).** Revert to `noindex` if the page cannot say something the official docs and the free toolkits do not. Cheap to keep otherwise — the route exists regardless.

---

## Tier P3 — Getting started.

Low competitive value alone (official docs own the head terms). Its job is internal linking and a landing place.

| # | URL | OWNER keyword | Status |
|---|---|---|---|
| 35 | `/guides/what-is-agentkit` | what is agentkit | NOINDEX (placeholder deleted — rewrite) |
| 36 | `/guides/install-agentkit` | install agentkit / ak cli | NOINDEX (placeholder deleted — rewrite) |
| 37 | `/guides/agentkit-core-commands` | agentkit commands | TODO |
| 38 | `/guides/agentkit-first-project` | agentkit tutorial | TODO |

---

## Tier P4 — Remaining 68 skills + 13 agents. Stay `noindex`.

**Do not mass-publish.** The skeleton's content gate exists exactly so we can ship 88 routes without shipping 88 thin pages. Publishing them all to chase an index footprint is how a domain earns a scaled-content-abuse penalty — and that penalty takes the P0 conversion pages down with it.

Promote out of P4 only on a specific trigger: a real query appears in Search Console, or a P1 pillar needs it as a genuine internal-link target.

---

## Sequencing

| Wave | Ship | Purpose |
|---|---|---|
| **W0** | ✅ Delete placeholder pages (done — they were indexable, in the sitemap, body text *"Placeholder body."*). **Then** Search Console + sitemap. **Buy the kit.** | Never let a domain's first crawl see thin pages. |
| **W1** | **R1 repo** + row 11 | The link engine. |
| **W2** | Rows 9, 12 | The weakest SERPs. Ranking proof. |
| **W3** | **Distribution** — repo → awesome-lists; guides → HN, Reddit, dev.to (canonical back here) | The previous draft had **no distribution phase at all**. |
| **W4** | P0 (rows 1, 2, 3, 4, 6) | Conversions — now with a kit we own and a domain with links. |
| **W5+** | P1 remainder → P2 | Volume, once the domain can rank. |

**Decision gate at W2+12 weeks:** if row 9 cannot reach page 2 *against a newsletter*, nothing in this map will rank. Stop and re-plan rather than write 35 more pages.

---

## What this map is missing

It is inferred from SERPs, not measured from demand. It will be wrong in places.

**The correction mechanism is the measurement loop** (`phase-04-measurement-loop.md`): connect Search Console at launch, and after ~8 weeks rewrite this map from real query data — impressions, CTR, position — instead of inference. Until then, every row's rank is a hypothesis, not a fact.
