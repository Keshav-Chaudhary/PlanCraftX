import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-12 text-center">
      <h1 className="text-foreground text-2xl font-bold">Page Not Found</h1>
      <p className="text-muted text-sm">The requested planning resource or route does not exist.</p>
      <div>
        <Link
          href="/"
          className="bg-primary text-primary-fg inline-flex rounded-md px-4 py-2 text-sm font-semibold hover:opacity-90"
        >
          Return to Planning Assistant
        </Link>
      </div>
    </div>
  );
}
