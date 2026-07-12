import type { ReactNode } from 'react';

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 pb-10">
      <h1 className="font-mono text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">{description}</p>
      {children}
    </header>
  );
}
