/**
 * The gate between a captured skill transcript and anything published.
 *
 * Skill pages exist to show what a skill *actually printed*. That value is the
 * whole point, and it is also the hazard: the runs happen against this repo, and
 * this repo holds a live credential and a vendored private kit. Left alone, the
 * path from `/ak:security-scan` to a Google-indexed page is unbroken —
 * transcript → content/*.mdx → prerendered HTML → sitemap → crawler cache.
 *
 * So: nothing leaves `runs/` until it has passed through here.
 *
 * This fails LOUDLY and does not auto-scrub. A scrubber that silently cleans its
 * input trains everyone to stop reading the output, and the one thing that must
 * not happen is nobody looking. A hit stops the pipeline; a human decides whether
 * to redact and mark `[REDACTED]`, or to drop the transcript.
 *
 * Redaction is mandatory. Fabrication is forbidden. They are different acts:
 * removing a token and marking it is required; typing a line that was never
 * printed is not allowed.
 *
 *   npx tsx scripts/redact-transcript.ts <file|dir>...
 *   npx tsx scripts/redact-transcript.ts plans/*\/runs
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

interface Hit {
  file: string;
  line: number;
  rule: string;
  /** The offending line, itself redacted — this tool must not print what it caught. */
  preview: string;
}

const hits: Hit[] = [];

/**
 * Secret values, read from .env.local at runtime.
 *
 * Read, never embedded: a hardcoded secret in a tracked script is the same leak
 * this script exists to prevent, just committed. Values are matched literally, so
 * a credential that matches no known prefix pattern is still caught.
 *
 * `NEXT_PUBLIC_*` is excluded, and that is not a loophole — the prefix is Next.js's
 * declaration that the value is compiled into the client bundle and served to every
 * visitor. Treating the site's own URL and affiliate ref as secrets made the gate fire
 * on ordinary pages that merely mention agentkit.quest, which is how a gate becomes
 * background noise.
 */
function secretValues(): string[] {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) return [];

  return readFileSync(envPath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .filter((line) => !line.startsWith('NEXT_PUBLIC_'))
    .map((line) => line.slice(line.indexOf('=') + 1).trim().replace(/^["']|["']$/g, ''))
    // Short values are things like "true" or a port — matching them literally would
    // flag every transcript. Real credentials are long.
    .filter((value) => value.length >= 12);
}

const SECRETS = secretValues();

interface Rule {
  name: string;
  test: RegExp;
  why: string;
  /**
   * `transcript` rules only fire on captured output. `always` rules fire everywhere,
   * including hand-written `content/`.
   *
   * The split exists because this is a site *about* Claude Code: `.claude/settings.json`
   * and `agentkit-engineer/` are its subject matter, and a page that explains where to
   * put a hook has to name the directory. Firing on those in prose produced 15 findings
   * across pages that were doing nothing wrong — and a gate that cries wolf is a gate
   * people learn to skip past, which is the one thing this script cannot afford.
   *
   * In a *transcript*, the same strings mean something different: a skill echoed a path
   * out of a private, licence-gated tree, and that gets published verbatim. So the rule
   * is not dropped, it is scoped.
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
  { name: 'vercel-token', test: /\bVERCEL_[A-Z_]*TOKEN\b\s*[:=]\s*\S+/, why: 'Vercel token assignment', scope: 'always' },
  { name: 'aws-key', test: /\bAKIA[0-9A-Z]{16}\b/, why: 'AWS access key', scope: 'always' },
  { name: 'private-key', test: /-----BEGIN [A-Z ]*PRIVATE KEY-----/, why: 'Private key block', scope: 'always' },

  // The machine, not the project. Fatal anywhere: this caught `C:\Users\Admin\bin\ak.exe`
  // published on three live guide pages — the author's real username, inside otherwise
  // genuine installer transcripts. Not a credential, but not the reader's path either,
  // and not ours to publish. Redact to `<you>`; keep the rest of the output intact.
  { name: 'windows-home', test: /[A-Za-z]:\\Users\\(?!<)[^\\\s]+/, why: 'Local Windows home path', scope: 'always' },
  { name: 'posix-home', test: /\/(?:c\/)?Users\/(?!<)[^/\s]+/, why: 'Local home path', scope: 'always' },

  // Transcript-only. The vendored kit is licence-gated (.gitignore: "It must not land in
  // a public repo"), and `/ak:scout` or `/ak:repomix` will happily echo its contents.
  // But naming the directory in prose is documentation, not leakage.
  { name: 'private-kit', test: /agentkit-engineer[/\\]/, why: 'Private vendored kit path', scope: 'transcript' },
  { name: 'claude-dir', test: /(?:^|[\s"'`([])\.claude[/\\]/, why: 'Local Claude config path', scope: 'transcript' },
];

/**
 * Report the shape, never the value.
 *
 * An earlier version printed the first 24 characters of the offending line. On a
 * JWT that is the header — not itself secret, but it is still a credential prefix
 * echoed into a terminal, a CI log, and an agent transcript. A leak-detector that
 * leaks a little is a leak-detector nobody can point at CI output. So: file, line,
 * rule, length. A human opens the file.
 */
function preview(line: string, rule: string): string {
  return `[${rule} match — value withheld, ${line.trim().length} chars on this line]`;
}

/**
 * `kind: meta` exempts a file from the scan. It exists for exactly one class of
 * file: the run log's own header, which *names* paths like `agentkit-engineer/`
 * and `~/.claude/skills/` in order to document which kit answered an invocation.
 * Naming a path is not leaking a file's contents, but no regex can tell those
 * apart — and a gate that cries wolf on every run is a gate everyone learns to
 * skip past, which is the one failure this script cannot afford.
 *
 * A transcript must never carry this flag, and it cannot: a transcript declares
 * `status: RAN|NOT-RUN`, and a file carrying both is rejected outright rather than
 * exempted. Relying on a grep to catch that would be relying on someone choosing to
 * look, which is the assumption this whole script exists to remove.
 */
function metaState(source: string): 'meta' | 'transcript' | 'smuggled' {
  const frontmatter = source.split('---')[1] ?? '';
  const meta = /^kind:\s*meta\s*$/m.test(frontmatter);
  const transcript = /^status:\s*(RAN|NOT-RUN)\s*$/m.test(frontmatter);

  if (meta && transcript) return 'smuggled';
  return meta ? 'meta' : 'transcript';
}

function scan(file: string) {
  const source = readFileSync(file, 'utf8');
  const rel0 = relative(ROOT, file).replace(/\\/g, '/');
  const state = metaState(source);

  if (state === 'smuggled') {
    hits.push({
      file: rel0,
      line: 1,
      rule: 'smuggled-exemption (a transcript claiming `kind: meta`)',
      preview: '[a file with `status:` is a transcript and cannot exempt itself from this gate]',
    });
    return;
  }
  if (state === 'meta') return;

  const lines = source.split('\n');
  const rel = relative(ROOT, file).replace(/\\/g, '/');

  // Captured output lives in a `runs/` directory. Everything else — `content/`,
  // `docs/` — is hand-written, and the transcript-scoped rules do not apply to it.
  const isTranscript = rel.includes('/runs/');
  const active = RULES.filter((rule) => rule.scope === 'always' || isTranscript);

  lines.forEach((line, i) => {
    // An already-marked redaction is the correct end state, not a finding.
    if (line.includes('[REDACTED]')) return;

    for (const rule of active) {
      if (rule.test.test(line)) {
        hits.push({ file: rel, line: i + 1, rule: `${rule.name} (${rule.why})`, preview: preview(line, rule.name) });
      }
    }

    for (const secret of SECRETS) {
      if (line.includes(secret)) {
        hits.push({
          file: rel,
          line: i + 1,
          rule: 'env-value (literal value from .env.local)',
          preview: preview(line, 'env-value'),
        });
      }
    }
  });
}

function walk(path: string) {
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) walk(join(path, entry));
  } else if (path.endsWith('.md') || path.endsWith('.mdx')) {
    scan(path);
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
  walk(path);
}

if (SECRETS.length === 0) {
  console.warn(
    '! .env.local had no long values to match literally. Shape rules still ran, but a\n' +
      '  credential that matches no known prefix would not be caught. Confirm this is expected.',
  );
}

if (hits.length > 0) {
  console.error(`\n✗ ${hits.length} finding(s). Nothing may be published until each is resolved.\n`);
  for (const hit of hits) {
    console.error(`  ${hit.file}:${hit.line}`);
    console.error(`    rule: ${hit.rule}`);
    console.error(`    line: ${hit.preview}\n`);
  }
  console.error('Resolve each by editing the transcript: remove the value and mark it [REDACTED].');
  console.error('Do NOT rewrite the surrounding output. Redaction is allowed; fabrication is not.\n');
  process.exit(1);
}

console.log(`✓ clean — ${targets.join(', ')} (${SECRETS.length} env value(s) checked literally)`);
