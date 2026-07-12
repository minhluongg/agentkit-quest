import { ArrowDown, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Diagrams for the guides.
 *
 * Built from HTML and design tokens rather than SVG or exported images, on
 * purpose. An SVG would need its own colour values (and would therefore break in
 * one of the two themes), would not reflow at 360px, and would be invisible to a
 * screen reader and to Google. These are real text in real boxes: they inherit
 * the theme for free, wrap on a phone, and are indexable.
 *
 * No animation. A diagram that moves is a diagram nobody reads twice.
 */

function Figure({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="my-8 flex flex-col gap-3">
      <div className="overflow-x-auto rounded-[var(--radius-lg)] border border-border bg-surface p-5 sm:p-6">
        {children}
      </div>
      <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

function Node({
  title,
  body,
  accent = false,
}: {
  title: string;
  body?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-1 rounded-[var(--radius)] border p-3',
        accent ? 'border-primary bg-accent' : 'border-border bg-card',
      )}
    >
      <span
        className={cn(
          'font-mono text-sm font-semibold',
          accent ? 'text-accent-foreground' : 'text-card-foreground',
        )}
      >
        {title}
      </span>
      {body && <span className="text-xs leading-relaxed text-muted-foreground">{body}</span>}
    </div>
  );
}

/** The artifact each step hands to the next — the handoff *is* the product. */
export function LoopDiagram() {
  const steps = [
    { cmd: '/ak:plan', hands: 'a phased plan on disk' },
    { cmd: '/ak:cook', hands: 'a diff, tested' },
    { cmd: '/ak:code-review', hands: 'findings on the diff' },
    { cmd: '/ak:git', hands: 'a commit and a PR' },
  ];

  return (
    <Figure caption="The loop. What matters is the arrow: each step hands the next a real artifact, which is the thing you are paying for — the parts are free, the wiring is not.">
      <ol className="flex list-none flex-col gap-2 p-0">
        {steps.map((step, i) => (
          <li key={step.cmd} className="flex list-none flex-col gap-2">
            <div className="flex items-center gap-3">
              <code className="rounded border border-border bg-muted px-2 py-1 font-mono text-sm font-semibold whitespace-nowrap text-foreground">
                {step.cmd}
              </code>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm text-muted-foreground">hands over {step.hands}</span>
            </div>
            {i < steps.length - 1 && (
              <ArrowDown className="ml-3 size-4 text-border" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </Figure>
  );
}

/** What the rename moved, and what it did not. */
export function RenameDiagram() {
  const rows = [
    { label: 'Product', before: 'ClaudeKit', after: 'AgentKit', changed: true },
    { label: 'CLI binary', before: 'ck', after: 'ak', changed: true },
    { label: 'Slash prefix', before: '/ck:plan', after: '/ak:plan', changed: true },
    // The affiliate-link rule fires on this literal. It is a domain *label* rendered
    // as text in the diagram, not an href — there is nothing here to attach a ref
    // param to. Disabled on this line only; the rule still guards the rest of the file.
    // eslint-disable-next-line no-restricted-syntax
    { label: 'Site', before: 'claudekit.cc', after: 'agentkit.best', changed: true },
    { label: 'Skills', before: 'unchanged', after: 'unchanged', changed: false },
    { label: 'Agents', before: 'unchanged', after: 'unchanged', changed: false },
    { label: 'Hooks', before: 'unchanged', after: 'unchanged', changed: false },
  ];

  return (
    <Figure caption="The rename moved the names, not the kit. Four things changed; everything you actually use did not. The one that bites is the prefix — and the kit's own files still say ck: in places.">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-b border-border pb-2">
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Before
          </span>
          <span aria-hidden="true" />
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Now
          </span>
        </div>

        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex min-w-0 flex-col">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span
                className={cn(
                  'truncate font-mono text-sm',
                  row.changed ? 'text-muted-foreground line-through' : 'text-foreground',
                )}
              >
                {row.before}
              </span>
            </div>
            <ArrowRight
              className={cn('size-4 shrink-0', row.changed ? 'text-primary' : 'text-border')}
              aria-hidden="true"
            />
            <span
              className={cn(
                'truncate font-mono text-sm',
                row.changed ? 'font-semibold text-foreground' : 'text-muted-foreground',
              )}
            >
              {row.after}
            </span>
          </div>
        ))}
      </div>
    </Figure>
  );
}

/** Who invokes whom. Readers conflate all three of these constantly. */
export function PrimitivesDiagram() {
  return (
    <Figure caption="Who invokes whom. You type a command. The command runs a skill. The skill delegates to agents, each in its own context window — which is why heavy work does not flood your main conversation.">
      <div className="flex flex-col gap-3">
        <Node title="You type  /ak:plan" body="A slash command. This is the only part you touch." accent />
        <ArrowDown className="ml-3 size-4 text-muted-foreground" aria-hidden="true" />

        <Node
          title="Skill:  plan"
          body="A prompt with a procedure — instructions, references, scripts. It decides what happens and what gets delegated."
        />
        <ArrowDown className="ml-3 size-4 text-muted-foreground" aria-hidden="true" />

        <div className="flex flex-col gap-2 sm:flex-row">
          <Node title="Agent: planner" body="Own context window" />
          <Node title="Agent: researcher" body="Own context window" />
          <Node title="Agent: kongming" body="Escalation, strongest model, advice only" />
        </div>
      </div>
    </Figure>
  );
}
