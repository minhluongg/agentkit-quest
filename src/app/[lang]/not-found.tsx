import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-4 py-32 text-center">
      <p className="font-mono text-6xl font-bold text-primary">404</p>
      <h1 className="font-mono text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-muted-foreground">
        That page does not exist. Try the search (press ⌘K) or start from the guides.
      </p>
      <Link href="/guides" className={buttonVariants({ variant: 'primary', size: 'md' })}>
        Browse guides
      </Link>
    </div>
  );
}
