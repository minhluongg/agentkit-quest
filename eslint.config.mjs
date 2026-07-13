import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  {
    ignores: [
      '.next/**',
      '.source/**',
      'node_modules/**',
      // Not app code: the vendored kit, the local AgentKit tooling, plan docs, and
      // the standalone hooks repo (its own project, CommonJS by design).
      'claudekit-engineer/**',
      'agentkit-engineer/**',
      'claude-code-hooks/**',
      '.claude/**',
      'plans/**',
      // Git worktrees for isolated skill runs. They are full checkouts of this repo,
      // so without this every file gets linted twice and every finding is reported
      // against a path nobody is editing.
      'worktrees/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
  {
    files: ['src/**/*.{ts,tsx}'],
    // affiliate.ts owns the base URL; site.ts records it as reference metadata.
    ignores: ['src/lib/affiliate.ts', 'src/lib/site.ts'],
    rules: {
      // A hand-written agentkit.best href silently drops the ?ref= param, and a
      // dropped ref is commission that is never paid and never noticed.
      // Everything must route through buildAffiliateUrl() / <AffiliateLink>.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/agentkit\\.best/]',
          message:
            'Do not link to agentkit.best directly. Use <AffiliateLink> or buildAffiliateUrl() so the ref and UTM params are always attached.',
        },
      ],
    },
  },
];

export default config;
