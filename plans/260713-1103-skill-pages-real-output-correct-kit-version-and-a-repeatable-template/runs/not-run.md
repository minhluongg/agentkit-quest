---
kind: meta
capturedOn: 2026-07-13
kitVersion: v0.2.0
akCli: 2.1.0
---

> `kind: meta` — this is the register of skills we did **not** run, not a transcript.

# The five we did not exercise, and why

The rule this whole plan runs on: **no invented output.** A skill with no surface in this
repository gets an honest sentence on its page and no terminal block. A staged example — a toy
Postgres spun up so `databases` has a screenshot — is a fake wearing evidence's clothes, and
readers can tell.

Recording the refusals is part of the method. A run log that only contains successes is a run log
someone has edited.

| Slug | Why not | What the page says |
|---|---|---|
| `deploy` | The site deploys through the **owner's** Vercel account via git auto-deploy. Running the `vercel` CLI here would touch their project and their billing. **Not ours to run.** | States the free method in full, and says plainly that we did not exercise the skill because the deploy target is not ours. |
| `devops` | No Dockerfile, no Kubernetes, no container anywhere in the repo. Verified: `test -f Dockerfile` → absent. | Says we have no container surface, so we have nothing to show. |
| `databases` | No database. No `prisma/schema.prisma`, no ORM, no connection string. All content is MDX and generated JSON, resolved at build. | Same. |
| `better-auth` | No authentication. No accounts, no sessions, no cookies — verified during the [security audit](/skills/security), which found the site has *no identity to spoof at all*. | Same. |
| `mcp-builder` | No MCP server in this repo, and building one purely to screenshot it would be the contrived-success failure mode this plan spends two pages forbidding. | Same. |
| `cook` | **No transcript, and the page shipped anyway** — it was written to close the `cook` link leak (10 guides pointed at a `noindex` stub), and the plan explicitly decoupled that from a capture. Added 2026-07-13 after review caught that the page had been published with no register entry: the *exact* hole that `review-pr` was added to close, re-dug in the same batch of work that closed it. | Says plainly there is no captured run, and that the free method is the part we stand behind. |
| `review-pr` | **Different reason from the five above: a real target exists.** This repo has an open PR, so reviewing it would be genuine work. The blocker is containment, not absence — `--reply` posts to GitHub and `--fix` writes to the tree, and the harness for running a write-and-post-capable skill safely is not built. Added 2026-07-13, after this page was found to have fallen through the register entirely: no transcript, no entry, no page line. | States plainly that the kit's version is unexercised here, and why. |

## Why this is not a gap in the pages

Each of the five keeps its full **free-method** section — the part a reader actually came for, and
the part that makes these pages worth ranking. What they lack is a captured transcript, and they
say so in one line rather than implying one exists.

**That is a weaker page than the nine with real output. It is not a dishonest one.** The
alternative — standing up a throwaway Postgres so `databases` has a terminal block — would produce
a page that *looks* stronger and is worth less, because the example would have been staged for the
photograph rather than encountered in real work.

## The one that could change

`deploy` is the only one where the blocker is permission rather than absence. If the owner wants a
real transcript, it exists — the site *does* deploy to Vercel, and the run would be genuine. It
needs their say-so, not a workaround.
