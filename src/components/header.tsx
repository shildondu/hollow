import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-4">
          <span className="text-xl font-medium tracking-tight">Hollow</span>
          <span className="hidden sm:inline text-sm text-muted-foreground">人活着不是为了一辈子，而是为了几个瞬间</span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Works
            </Link>
            <Link
              href="/categories"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Collections
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
