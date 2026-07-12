import Link from 'next/link';
import { AffiliateLink } from '@/components/affiliate/affiliate-link';
import { AffiliateDisclosure } from '@/components/affiliate/affiliate-disclosure';
import { siteConfig } from '@/lib/site';

const columns = [
  {
    title: 'Learn',
    links: [
      { title: 'Guides', href: '/guides' },
      { title: 'Skills', href: '/skills' },
      { title: 'Agents', href: '/agents' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="cursor-pointer font-mono text-sm font-semibold text-foreground transition-colors duration-200 hover:text-primary"
            >
              <span className="text-primary">/</span> agentkit.quest
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <h2 className="text-xs font-semibold tracking-wider text-foreground uppercase">
                {column.title}
              </h2>
              {column.links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="cursor-pointer text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                >
                  {link.title}
                </Link>
              ))}
            </nav>
          ))}

          <div className="flex flex-col gap-3">
            <h2 className="text-xs font-semibold tracking-wider text-foreground uppercase">
              AgentKit
            </h2>
            <AffiliateLink
              campaign="footer"
              className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Official site
            </AffiliateLink>
            <a
              href={siteConfig.upstream.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              GitHub
            </a>
          </div>
        </div>

        <AffiliateDisclosure />

        <div className="flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. An independent resource — not
            affiliated with {siteConfig.upstream.name}.
          </p>
          <p>
            Reference data derived from{' '}
            <a
              href={siteConfig.upstream.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer underline underline-offset-2 transition-colors duration-200 hover:text-foreground"
            >
              claudekit-engineer
            </a>{' '}
            (MIT).
          </p>
        </div>
      </div>
    </footer>
  );
}
