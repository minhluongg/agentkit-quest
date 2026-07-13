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

// --- Report -----------------------------------------------------------------

if (failures.length > 0) {
  console.error(`\n✗ ${failures.length} content failure(s):`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}

console.log('✓ content assertions passed');
