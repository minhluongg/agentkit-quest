/**
 * Source-level content assertions. Runs at `prebuild`, before Next compiles anything.
 *
 * The sibling script, `verify-build.ts`, asserts things about the *build output* — a missing
 * canonical, an affiliate link that lost its ref, a thin page that leaked into the sitemap.
 * Its own header says so: "asserted against the real build output, not the source."
 *
 * The stale-version check briefly lived there, and it does not belong: it reads
 * `content/**\/*.mdx`, which is source. Keeping it there cost a full Next build before a
 * one-character typo could fail — minutes on a CI runner, for something a filesystem walk
 * catches in a second.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, resolve, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

const failures: string[] = [];

// --- The kit version must not rot ------------------------------------------
//
// Every page once declared `kitVersion: '2.20.0'` — a number from the superseded
// ClaudeKit-era kit — and nothing rendered it, so nothing caught it. It reached the site's
// top commercial page as prose ("the kit is on version 2.20.0") and sat there.
//
// So a stale version is now a build failure. The allowlist below is where `2.20.0` is
// legitimate — and the fact that an allowlist is needed at all is the point: one of the
// occurrences is *evidence*, not error, and a blanket sweep would have falsified it.

const STALE_VERSION = '2.20.0';

/** Files where `2.20.0` is correct. Repo-relative, forward slashes. */
const STALE_VERSION_ALLOWLIST = new Set([
  // A real `ck --version` transcript: the legacy claudekit-cli does report engineer@v2.20.0.
  'content/guides/install-agentkit.mdx',
  // The public correction callout, which must quote the wrong number in order to correct it.
  'content/guides/agentkit-vs-free-alternatives.mdx',
]);

function mdxFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) mdxFiles(path, acc);
    else if (entry.name.endsWith('.mdx')) acc.push(path);
  }
  return acc;
}

for (const path of mdxFiles(join(ROOT, 'content'))) {
  const rel = relative(ROOT, path).replace(/\\/g, '/');
  if (STALE_VERSION_ALLOWLIST.has(rel)) continue;

  if (readFileSync(path, 'utf8').includes(STALE_VERSION)) {
    failures.push(
      `${rel} cites the superseded kit version ${STALE_VERSION}. The Engineer kit is v0.2.0 ` +
        '(`ak kit list-kits`). If this occurrence is captured output rather than a claim, add ' +
        'it to STALE_VERSION_ALLOWLIST with a reason.',
    );
  }
}

// --- No page ships that nobody committed ------------------------------------
//
// `content/skills/cook.mdx` appeared untracked, and the build read it: the page went
// indexable and into the sitemap, inviting Google to crawl something no one had reviewed.
// Meanwhile every status report said "20 pages" while the site was serving 21.
//
// The build was already printing the number — `noindex (stub) pages: 74` became 73 — and
// nobody read it. **A number that is printed but never asserted is a number nobody reads.**
//
// Untracked content is not a style problem. In this repo a file's mere existence flips a
// page from noindex to indexable, so an uncommitted file is a silent, unreviewed change to
// what search engines are told to crawl.

function untrackedContent(): string[] {
  try {
    const out = execFileSync('git', ['ls-files', '--others', '--exclude-standard', 'content'], {
      cwd: ROOT,
      encoding: 'utf8',
    });
    return out.split('\n').filter((line) => line.trim().endsWith('.mdx'));
  } catch {
    // No git (a tarball build, a stripped CI image). Not a reason to fail — just say the
    // check did not run, rather than implying it passed.
    console.warn('! git unavailable — could not check for untracked content.');
    return [];
  }
}

for (const file of untrackedContent()) {
  failures.push(
    `${file} is not committed, but the build reads it — so it ships, goes indexable, and ` +
      'enters the sitemap without anyone having reviewed it. Commit it or delete it.',
  );
}

// --- Every published skill page meets the same bar --------------------------
//
// Six pages were missing "Combining it", one was missing "When NOT to reach for it" too, and
// one linked to no guide at all. They had been written across a long session to a standard
// that drifted, and nothing noticed — the gaps were found by someone thinking to look.
//
// A standard that depends on remembering to audit it is not a standard. These are the four
// things that make a skill page worth publishing rather than a paraphrase of the vendor's
// description, so they are asserted.

/** Headings every published skill page must carry. Matched on a distinctive prefix. */
const REQUIRED_SECTIONS = [
  // The free method IS the page's reason to rank. A page that withholds it loses to the
  // official docs and dev.to, which do not.
  'How to do it without a kit',
  // A usage call, not a purchase call — when is the free way simply better?
  'When NOT to reach for it',
  // The workflow chain. A skill described in isolation is a skill nobody knows when to use.
  'Combining it',
];

for (const path of mdxFiles(join(ROOT, 'content/skills'))) {
  const rel = relative(ROOT, path).replace(/\\/g, '/');
  const source = readFileSync(path, 'utf8');
  const headings = [...source.matchAll(/^## (.+)$/gm)].map((m) => (m[1] ?? '').trim());

  for (const required of REQUIRED_SECTIONS) {
    if (!headings.some((h) => h.startsWith(required))) {
      failures.push(`${rel} is missing its "## ${required}" section.`);
    }
  }

  // Evidence, or an honest admission that there is none. Never silence — a page with neither
  // reads exactly like a page nobody checked, and the reader cannot tell them apart.
  const hasTranscript = /^````/m.test(source);
  const admitsNoRun = /have not run|not one of them|not published a run/i.test(source);
  if (!hasTranscript && !admitsNoRun) {
    failures.push(
      `${rel} has no captured transcript and does not say so. Show what the skill printed, or ` +
        'state plainly that it was not run here and why. Silence is the one option that is not ' +
        'available.',
    );
  }

  // A skill page with no guide link is an orphan the pillar tier cannot feed.
  if (!/\]\(\/guides\//.test(source)) {
    failures.push(`${rel} links to no guide. It is an island.`);
  }
}

// --- Report -----------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} content failure(s):`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}

console.log('✓ content assertions passed');
