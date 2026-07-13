/**
 * The gate between a captured skill transcript and anything published.
 *
 * Skill pages exist to show what a skill *actually printed*. That value is the
 * whole point, and it is also the hazard: the runs happen against this repo, and
 * this repo holds a live credential and a licence-gated vendored kit. Left alone,
 * the path from `/ak:security-scan` to a Google-indexed page is unbroken —
 * transcript → content/*.mdx → prerendered HTML → sitemap → crawler cache.
 *
 * So: nothing leaves `runs/` until it has passed through here. `npm run prebuild`
 * runs it, so a leak fails the build rather than waiting for someone to remember.
 *
 * It fails LOUDLY and never auto-scrubs. A scrubber that silently cleans its input
 * trains everyone to stop reading the output, and the one thing that must not happen
 * is nobody looking. A hit stops the pipeline; a human decides whether to redact and
 * mark `[REDACTED]`, or to drop the transcript.
 *
 * Redaction is mandatory. Fabrication is forbidden. They are different acts: removing
 * a token and marking it is required; typing a line that was never printed is not.
 *
 * ---
 *
 * A code review of the first version broke it four ways, with working inputs. Every
 * one made it print `✓ clean` on a file containing an API key — the precise inverse of
 * its purpose. What follows is written against those four, and each is named at the
 * code that fixes it. A gate nobody has tried to break is not a gate; it is a comment.
 *
 *   npx tsx scripts/redact-transcript.ts <file|dir>...
 */
import { readFileSync, readdirSync, existsSync, lstatSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

interface Hit {
  file: string;
  line: number;
  rule: string;
  /** The offending line, itself withheld — this tool must never print what it caught. */
  detail: string;
}

const hits: Hit[] = [];

/**
 * Secret values, read from .env.local at runtime.
 *
 * Read, never embedded: a hardcoded secret in a tracked script is the same leak this
 * script exists to prevent, just committed. Values are matched literally, so a
 * credential matching no known prefix pattern is still caught.
 *
 * `NEXT_PUBLIC_*` is excluded, and that is not a loophole — the prefix is Next.js's
 * declaration that the value is compiled into the client bundle and served to every
 * visitor. Treating the site's own URL as a secret made the gate fire on every page
 * that merely mentions agentkit.quest, which is how a gate becomes background noise.
 *
 * The parsing below is fussy for a reason. The review found three ordinary `.env`
 * forms that the naive version mis-read, and each failed *silently*: a mis-parsed
 * secret simply never matches anything, so the credential goes unprotected while the
 * tool still reports success.
 */
function secretValues(): string[] {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return [];

  const values: string[] = [];

  for (const raw of readFileSync(envPath, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    // `export FOO=bar` is valid in a .env consumed by a shell. The old
    // `startsWith('NEXT_PUBLIC_')` test read the `export`, not the key — so
    // `export NEXT_PUBLIC_SITE_URL=…` slipped past the public-value filter and the
    // site's own URL became a "secret" that fired on every page mentioning it.
    const body = line.startsWith('export ') ? line.slice(7).trim() : line;

    const eq = body.indexOf('=');
    // No `=` is not a key/value pair — it is a continuation line or junk. The old
    // code did `slice(indexOf('=') + 1)`, and `indexOf` returning -1 made that
    // `slice(0)`: the whole line became a "secret" literal.
    if (eq === -1) continue;

    const key = body.slice(0, eq).trim();
    if (key.startsWith('NEXT_PUBLIC_')) continue;

    let value = body.slice(eq + 1).trim();

    // Quoted values keep everything inside the quotes, including a `#`. Unquoted
    // values end at an inline comment — dotenv strips it, and the old code did not,
    // so `TOKEN=abc123 # deploy key` yielded a "secret" with the comment glued on
    // that could never match a real transcript line.
    const quoted = /^(['"])(.*)\1$/.exec(value);
    if (quoted) {
      value = quoted[2] ?? '';
    } else {
      const comment = value.indexOf(' #');
      if (comment !== -1) value = value.slice(0, comment).trim();
    }

    // Short values are `true`, a port, a region. Matching those literally would flag
    // every transcript. Real credentials are long.
    if (value.length >= 12) values.push(value);
  }

  return values;
}

const SECRETS = secretValues();

interface Rule {
  name: string;
  test: RegExp;
  why: string;
  /**
   * `transcript` rules fire only on captured output. `always` rules fire everywhere,
   * including hand-written `content/`.
   *
   * The split exists because this is a site *about* Claude Code: `.claude/settings.json`
   * and `agentkit-engineer/` are its subject matter, and a page explaining where to put
   * a hook has to name the directory. Firing on those in prose produced 15 findings on
   * pages doing nothing wrong — and a gate that cries wolf is a gate people skip past.
   *
   * In a *transcript* the same strings mean something else: a skill echoed a path out of
   * a private, licence-gated tree, and that gets published verbatim. The rule is not
   * dropped, it is scoped.
   */
  scope: 'always' | 'transcript';
}

/** A hit is a stop, not a warning. */
const RULES: Rule[] = [
  // Credentials. Fatal anywhere — no page has a reason to carry one.
  { name: 'openai-key', test: /\bsk-[A-Za-z0-9_-]{16,}/, why: 'API key shape', scope: 'always' },
  { name: 'github-token', test: /\bgh[pousr]_[A-Za-z0-9]{16,}/, why: 'GitHub token shape', scope: 'always' },
  { name: 'jwt', test: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, why: 'JWT shape', scope: 'always' },
  { name: 'bearer', test: /\bBearer\s+[A-Za-z0-9._-]{16,}/, why: 'Authorization header', scope: 'always' },
  { name: 'vercel-token', test: /\bVERCEL_[A-Z_]*TOKEN\b\s*[:=]\s*\S+/i, why: 'Vercel token assignment', scope: 'always' },
  { name: 'aws-key', test: /\bAKIA[0-9A-Z]{16}\b/, why: 'AWS access key', scope: 'always' },
  { name: 'private-key', test: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, why: 'Private key block', scope: 'always' },

  // The machine, not the project. This caught `C:\Users\Admin\bin\ak.exe` published on
  // three live guide pages — the author's real username, inside otherwise genuine
  // installer transcripts.
  //
  // The `i` flag is load-bearing. Windows paths are case-insensitive and real tools
  // print them lowercase; without it, `c:\users\admin\...` sailed through the very
  // check written to catch `C:\Users\Admin\...`.
  { name: 'windows-home', test: /[A-Za-z]:\\Users\\(?!<)[^\\\s]+/i, why: 'Local Windows home path', scope: 'always' },
  { name: 'posix-home', test: /\/(?:c\/)?Users\/(?!<)[^/\s]+/i, why: 'Local home path', scope: 'always' },
  { name: 'linux-home', test: /\/home\/(?!<)[^/\s]+/i, why: 'Local home path', scope: 'always' },

  // Transcript-only. The vendored kit is licence-gated (.gitignore: "It must not land in
  // a public repo"), and `/ak:scout` or `/ak:repomix` will happily echo its contents.
  // Naming the directory in prose, though, is documentation — not leakage.
  { name: 'private-kit', test: /agentkit-engineer[/\\]/, why: 'Private vendored kit path', scope: 'transcript' },
  // `~` and `/` join the leading char class: the old pattern caught `.claude/` but sailed
  // past `~/.claude/`, so the same path written two ways got two different answers — in the
  // same file, three lines apart. Neither sound nor complete.
  { name: 'claude-dir', test: /(?:^|[\s"'`([~/])\.claude[/\\]/, why: 'Local Claude config path', scope: 'transcript' },
];

/** Report the shape, never the value. */
function detail(line: string, rule: string): string {
  return `[${rule} match — value withheld, ${line.trim().length} chars on this line]`;
}

/**
 * Is this file captured output, or hand-written prose?
 *
 * Anchored to the real layout, not a floating substring. The old test was
 * `rel.includes('/runs/')`, and this repo contains `worktrees/runs/` — a full checkout
 * — so every guide inside it was treated as a transcript and produced 14 findings on
 * prose doing nothing wrong. The inverse also broke: a top-level `runs/x.md` has no
 * leading slash, so transcript rules silently switched *off* for it.
 */
function isTranscript(rel: string): boolean {
  return /^plans\/[^/]+\/runs\//.test(rel);
}

/**
 * Inside `plans/`, only `runs/` is in scope.
 *
 * The rest of a plan directory is scratch — gitignored, never published, and full of
 * absolute paths because it is written by and for the machine that ran it. Scanning it
 * would fail the build on prose nobody will ever read, which is how a build gate gets
 * commented out.
 *
 * `plans/<slug>/runs/` is different: it is tracked, it ships in a public repo, and its
 * contents are copied verbatim onto published pages. It gets scanned.
 */
function inScope(rel: string): boolean {
  if (!rel.startsWith('plans/')) return true;
  return isTranscript(rel);
}

/**
 * `kind: meta` exempts a file from the scan. It exists for one class of file: the run
 * log's own header, which *names* paths like `agentkit-engineer/` in order to document
 * which kit answered an invocation. Naming a path is not leaking a file's contents.
 *
 * Two bypasses had to be closed here, and both let a file carrying an API key through
 * untouched:
 *
 *  1. The old check only rejected `kind: meta` when it also saw a *canonical* status
 *     (`RAN` / `NOT-RUN`). `status: RAN (partial capture)` did not match, so the file
 *     was classified meta and skipped entirely. The stricter that regex was, the wider
 *     the hole — so now *any* `status:` key at all disqualifies a meta claim.
 *
 *  2. The old code read `source.split('---')[1]`, which is not a frontmatter parser: it
 *     returns whatever sits between the first two `---` *anywhere* in the file. A file
 *     with no frontmatter whose body contains a horizontal rule could therefore forge
 *     one. Frontmatter is now only frontmatter when the file opens with it.
 */
function frontmatterOf(source: string): string | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  return match ? (match[1] ?? '') : null;
}

function metaState(source: string): 'meta' | 'scan' | 'smuggled' {
  const frontmatter = frontmatterOf(source);
  if (frontmatter === null) return 'scan';

  const meta = /^kind:\s*meta\s*$/m.test(frontmatter);
  if (!meta) return 'scan';

  // Any `status:` at all means this is a transcript wearing a meta badge.
  return /^status:/m.test(frontmatter) ? 'smuggled' : 'meta';
}

function scan(file: string) {
  const source = readFileSync(file, 'utf8');
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  const state = metaState(source);

  if (state === 'smuggled') {
    hits.push({
      file: rel,
      line: 1,
      rule: 'smuggled-exemption (a transcript claiming `kind: meta`)',
      detail: '[a file declaring `status:` is a transcript and cannot exempt itself]',
    });
    return;
  }
  if (state === 'meta') return;

  const transcript = isTranscript(rel);

  /**
   * Is this line inside a fenced code block?
   *
   * The transcript-scoped rules were written on a false assumption: that a file under
   * `runs/` *is* captured output. It is not — it is a run *report*: mostly prose, tables
   * and quotations, with the captured output quoted inside fences.
   *
   * So the gate blocked a sentence that merely *named* `.claude/skills/` while describing
   * what a reviewer had said, and turned the build red on the author's own prose. That is
   * the failure this script's own header warns about: a gate that cries wolf is a gate
   * people learn to skip past.
   *
   * Captured output lives inside a fence. Prose about a path is documentation — on a site
   * whose entire subject is Claude Code, it is the subject matter. Scope the rules to the
   * fence and the distinction becomes structural rather than a guess about wording.
   *
   * Credential rules are unaffected: they stay `always`, and they scan every line of every
   * file. A token has no business in prose either.
   */
  let inFence = false;
  const fenceEdge = /^\s*(`{3,}|~{3,})/;

  source.split('\n').forEach((line, i) => {
    if (fenceEdge.test(line)) {
      inFence = !inFence;
      return; // the fence marker itself carries nothing
    }

    // Strip the redacted SPANS, then scan what is left.
    //
    // The old code skipped the whole LINE when it saw `[REDACTED]`. That is a bypass,
    // and the realistic one: a human redacts the token, the tool goes green, and the
    // home path sitting on the same line ships anyway.
    const remainder = line.replaceAll('[REDACTED]', '');

    const active = RULES.filter(
      (rule) => rule.scope === 'always' || (transcript && inFence),
    );

    for (const rule of active) {
      if (rule.test.test(remainder)) {
        hits.push({ file: rel, line: i + 1, rule: `${rule.name} (${rule.why})`, detail: detail(line, rule.name) });
      }
    }

    for (const secret of SECRETS) {
      if (remainder.includes(secret)) {
        hits.push({
          file: rel,
          line: i + 1,
          rule: 'env-value (literal value from .env.local)',
          detail: detail(line, 'env-value'),
        });
      }
    }
  });
}

const SCANNABLE = /\.mdx?$/;

/**
 * `lstat`, not `stat`: a symlink loop under a scanned directory would otherwise recurse
 * until the stack blows. Symlinks are not followed.
 */
function walk(path: string, explicit: boolean) {
  const stat = lstatSync(path);

  if (stat.isSymbolicLink()) return;

  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) walk(join(path, entry), false);
    return;
  }

  if (SCANNABLE.test(path)) {
    // An explicitly-named file is always scanned: if someone points the gate at a plan
    // doc, they want it checked. The scope filter only prunes a directory *walk*.
    if (explicit || inScope(relative(ROOT, path).replace(/\\/g, '/'))) scan(path);
    return;
  }

  // A gate must never certify a file it did not open. The old version silently ignored
  // any non-markdown path, so passing a `.txt` capture containing an API key printed
  // `✓ clean` and exited 0. Inside a directory walk, skipping a `.png` is correct; but
  // a file named *explicitly* on the command line is a file someone expects to be
  // checked.
  if (explicit) {
    console.error(`✗ refusing to certify a file this gate cannot read: ${relative(ROOT, path)}`);
    console.error('  Only .md and .mdx are scanned. Convert the capture, or scan it another way.\n');
    process.exit(2);
  }
}

// --- Run --------------------------------------------------------------------

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error('usage: tsx scripts/redact-transcript.ts <file|dir>...');
  process.exit(2);
}

for (const target of targets) {
  const path = resolve(ROOT, target);
  if (!existsSync(path)) {
    console.error(`✗ not found: ${target}`);
    process.exit(2);
  }
  walk(path, true);
}

if (SECRETS.length === 0) {
  // Expected in CI, where .env.local does not exist. Say so rather than implying the
  // literal-value arm ran: the shape rules still fire, but a credential matching no
  // known prefix would not be caught here.
  console.warn(
    '! No .env.local values to match literally (expected in CI). Shape rules still ran.\n',
  );
}

if (hits.length > 0) {
  console.error(`\n✗ ${hits.length} finding(s). Nothing may be published until each is resolved.\n`);
  for (const hit of hits) {
    console.error(`  ${hit.file}:${hit.line}`);
    console.error(`    rule: ${hit.rule}`);
    console.error(`    line: ${hit.detail}\n`);
  }
  console.error('Resolve each by editing the transcript: remove the value and mark it [REDACTED].');
  console.error('Do NOT rewrite the surrounding output. Redaction is allowed; fabrication is not.\n');
  process.exit(1);
}

console.log(`✓ clean — ${targets.join(', ')} (${SECRETS.length} env value(s) checked literally)`);
