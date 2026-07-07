import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">ChurchLive</h1>
          <nav className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium hover:underline">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Live Streaming for
            <span className="text-primary"> Your Church</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Stream services with low latency, engage with live chat, and
            connect your congregation.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/auth"
              className="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Get Started
            </Link>
            <Link
              href="/stream/demo"
              className="rounded-lg border px-8 py-3 text-sm font-medium hover:bg-secondary"
            >
              Watch Demo
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
