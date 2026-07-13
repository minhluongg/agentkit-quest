/**
 * Which kit version a reference page was written against.
 *
 * The version used to live in frontmatter and be read by nobody — every page declared
 * `kitVersion: '2.20.0'`, a number from the superseded ClaudeKit-era kit, and nothing
 * surfaced it, so nothing caught it. **A pin that is never displayed is a pin that silently
 * rots**, and this one rotted all the way onto the site's top commercial page as prose.
 *
 * It first shipped rendering only on skill pages, while the 13 agent overrides carried the
 * same field, unread — the exact failure it was written to fix, left alive on 13 URLs. So it
 * lives here now, and both page types import it.
 *
 * "Documented against", not "examples run against": nine skill pages now carry a captured
 * transcript and the rest do not, and agent pages carry none at all. Where an example exists,
 * the transcript is its own evidence — this line dates the page, it does not vouch for a run
 * that may not have happened.
 *
 * Renders nothing when the version is absent. A wrong pin is worse than no pin.
 */
export function Provenance({ kitVersion, updated }: { kitVersion?: string; updated?: string }) {
  if (!kitVersion) return null;

  const date =
    updated &&
    // The schema enforces ISO, so this parses — but anchoring to UTC keeps the rendered date
    // stable regardless of the build machine's timezone.
    new Date(`${updated}T00:00:00Z`).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

  return (
    <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
      Documented against AgentKit Engineer{' '}
      <span className="font-mono text-foreground">{kitVersion}</span>
      {date && <> · updated {date}</>}
    </p>
  );
}
