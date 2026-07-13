/**
 * Post-build assertions.
 *
 * These check the things that are invisible in code review and expensive in
 * production: a missing canonical, an affiliate link that lost its ref param, a
 * thin page that leaked into the index. Every one of them fails silently
 * otherwise — so they get asserted against the real build output, not the source.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const APP_DIR = join(ROOT, '.next', 'server', 'app');

const failures: string[] = [];
const notes: string[] = [];

function fail(message: string) {
  failures.push(message);
}

/** Every prerendered .html in the build output. */
function htmlFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(path, acc);
    else if (entry.name.endsWith('.html')) acc.push(path);
  }
  return acc;
}

const pages = htmlFiles(APP_DIR);
if (pages.length === 0) {
  fail('No prerendered HTML found. Run `npm run build` first.');
}

// --- Route counts -----------------------------------------------------------

const skills = JSON.parse(
  readFileSync(join(ROOT, 'src/data/skills.generated.json'), 'utf8'),
) as { slug: string }[];
const agents = JSON.parse(
  readFileSync(join(ROOT, 'src/data/agents.generated.json'), 'utf8'),
) as { slug: string }[];

/** `.next/server/app/en/skills/find-skills.html` → `/en/skills/find-skills`. */
function routeOf(path: string): string {
  return path.replace(APP_DIR, '').replace(/\\/g, '/').replace(/\.html$/, '');
}

// Match on route segments, not substrings: the slug `find-skills` makes
// `/skills/find-skills` end in "skills" and silently breaks naive matching.
const skillPages = pages.filter((p) => /^\/[^/]+\/skills\/[^/]+$/.test(routeOf(p)));
const agentPages = pages.filter((p) => /^\/[^/]+\/agents\/[^/]+$/.test(routeOf(p)));

if (skillPages.length < skills.length) {
  fail(`Expected ${skills.length} skill pages, prerendered ${skillPages.length}.`);
}
if (agentPages.length < agents.length) {
  fail(`Expected ${agents.length} agent pages, prerendered ${agentPages.length}.`);
}

// --- Hubs must actually link to their children ------------------------------
//
// A client-only hook (useSearchParams) once forced /skills out of static
// rendering: the page still "built fine", still counted as prerendered, and still
// passed every other check — while shipping a crawler an empty div and zero links
// to the 88 skill pages it exists to point at. Assert the links are in the HTML.

const hubs: { file: string; pattern: RegExp; min: number; label: string }[] = [
  {
    file: join(APP_DIR, 'en', 'skills.html'),
    pattern: /href="\/skills\/[a-z0-9-]+"/g,
    min: skills.length,
    label: '/skills',
  },
  {
    file: join(APP_DIR, 'en', 'agents.html'),
    pattern: /href="\/agents\/[a-z0-9-]+"/g,
    min: agents.length,
    label: '/agents',
  },
];

for (const hub of hubs) {
  if (!existsSync(hub.file)) {
    fail(`${hub.label}: no prerendered HTML at ${hub.file}`);
    continue;
  }
  const html = readFileSync(hub.file, 'utf8');
  const found = new Set(html.match(hub.pattern) ?? []).size;
  if (found < hub.min) {
    fail(
      `${hub.label}: prerendered HTML contains ${found} child links, expected ${hub.min}. ` +
        'The hub is not statically rendering its list — crawlers see nothing.',
    );
  }
}

// --- Per-page SEO invariants ------------------------------------------------

for (const path of pages) {
  const html = readFileSync(path, 'utf8');
  const name = path.replace(APP_DIR, '').replace(/\\/g, '/');

  // Framework error/404 shells have no SEO surface to check.
  if (name.includes('_not-found') || name.includes('_global-error')) continue;

  const isNoindex = /<meta name="robots" content="[^"]*noindex/.test(html);

  if (!/<link rel="canonical"/.test(html)) {
    fail(`${name}: missing canonical link.`);
  }
  if (!/<meta name="description"/.test(html)) {
    fail(`${name}: missing meta description.`);
  }
  if (!isNoindex && !/<meta name="robots" content="[^"]*index/.test(html)) {
    fail(`${name}: no robots directive.`);
  }

  // Every outbound AgentKit link must carry attribution and campaign tagging.
  const links = html.match(/href="https:\/\/agentkit\.best[^"]*"/g) ?? [];
  for (const link of links) {
    if (!link.includes('utm_campaign')) {
      fail(`${name}: affiliate link without utm_campaign → ${link}`);
    }
  }

  const anchors = html.match(/<a[^>]+href="https:\/\/agentkit\.best[^"]*"[^>]*>/g) ?? [];
  for (const anchor of anchors) {
    if (!/rel="[^"]*sponsored/.test(anchor)) {
      fail(`${name}: affiliate anchor missing rel="sponsored".`);
    }
  }
}

// --- ref param --------------------------------------------------------------

const allHtml = pages.map((p) => readFileSync(p, 'utf8')).join('');
const refPresent = /agentkit\.best[^"]*[?&]ref=/.test(allHtml);
if (!refPresent) {
  // NEXT_PUBLIC_* is inlined at BUILD time. If the env var is missing in the
  // production build, the deployed site ships un-attributed links and earns
  // nothing — silently, until someone notices an empty commission report a
  // quarter later. In production that is a hard failure, not a note.
  const message =
    'No ?ref= on any affiliate link — NEXT_PUBLIC_AFFILIATE_REF was unset at build time.';

  if (process.env.VERCEL_ENV === 'production') {
    fail(`${message} Every click in this deploy would be unpaid.`);
  } else {
    notes.push(`${message} Fine locally; set it in Vercel before deploying.`);
  }
}

// --- Disclosure -------------------------------------------------------------

if (!/affiliate links/i.test(allHtml)) {
  fail('Affiliate disclosure text not found in any rendered page.');
}

// --- Sitemap must not advertise noindex URLs --------------------------------

const noindexUrls = new Set<string>();
for (const path of pages) {
  const html = readFileSync(path, 'utf8');
  if (!/<meta name="robots" content="[^"]*noindex/.test(html)) continue;

  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (canonical) noindexUrls.add(canonical);
}

const sitemapPath = join(APP_DIR, 'sitemap.xml.body');
if (existsSync(sitemapPath)) {
  const sitemap = readFileSync(sitemapPath, 'utf8');
  for (const url of noindexUrls) {
    if (sitemap.includes(`<loc>${url}</loc>`)) {
      fail(`Sitemap lists a noindex URL: ${url}`);
    }
  }
} else {
  // Not a note. A check that cannot find its input has not passed — it has not run,
  // and a silently-skipped assertion is worse than no assertion, because the green
  // tick still gets read as "the sitemap is clean".
  fail(
    'sitemap.xml.body not found in build output — the sitemap/noindex cross-check could not run.',
  );
}

// --- The kit version must not rot -------------------------------------------
//
// Every page once declared `kitVersion: '2.20.0'` — a number from the superseded
// ClaudeKit-era kit — and nothing rendered it, so nothing caught it. It reached the
// site's top commercial page as prose ("the kit is on version 2.20.0") and sat there.
//
// So the stale version is now a build failure. The allowlist below is the one place
// `2.20.0` is legitimate: a *captured* `ck --version` transcript, where it is the
// legacy CLI's true output. That file is evidence, not error — a blanket sweep would
// falsify it, which is why this is an allowlist and not a blanket ban.

const STALE_VERSION = '2.20.0';

/** Files where `2.20.0` is correct. Repo-relative, forward slashes. */
const STALE_VERSION_ALLOWLIST = new Set([
  // A real `ck --version` transcript: claudekit-cli 4.5.0 does report engineer@v2.20.0.
  'content/guides/install-agentkit.mdx',
  // The public correction callout, which must quote the wrong number to correct it.
  'content/guides/agentkit-vs-free-alternatives.mdx',
]);

function contentFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) contentFiles(path, acc);
    else if (entry.name.endsWith('.mdx')) acc.push(path);
  }
  return acc;
}

for (const path of contentFiles(join(ROOT, 'content'))) {
  const rel = path.replace(ROOT, '').replace(/\\/g, '/').replace(/^\//, '');
  if (STALE_VERSION_ALLOWLIST.has(rel)) continue;

  if (readFileSync(path, 'utf8').includes(STALE_VERSION)) {
    fail(
      `${rel} still cites the superseded kit version ${STALE_VERSION}. ` +
        'The Engineer kit is v0.2.0 (`ak kit list-kits`). If this occurrence is a captured ' +
        'transcript rather than a claim, add it to STALE_VERSION_ALLOWLIST with a reason.',
    );
  }
}

// --- Report -----------------------------------------------------------------

console.log(`Checked ${pages.length} prerendered pages.`);
console.log(`  skills: ${skillPages.length}/${skills.length}`);
console.log(`  agents: ${agentPages.length}/${agents.length}`);
console.log(`  noindex (stub) pages: ${noindexUrls.size}`);

for (const note of notes) console.log(`  note: ${note}`);

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}

console.log('\n✓ all build assertions passed');
