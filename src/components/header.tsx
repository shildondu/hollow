"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Header() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(searchParams.get("q") || "");
  const [slogan, setSlogan] = useState("人活着不是为了一辈子，而是为了几个瞬间");

  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/slogans")
      .then((res) => res.json())
      .then((data) => setSlogan(data.text))
      .catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchValue.trim()) {
      params.set("q", searchValue.trim());
    } else {
      params.delete("q");
    }
    router.push(`/?${params.toString()}`);
  }

  function clearSearch() {
    setSearchValue("");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-4 shrink-0">
          <span className="text-xl font-medium tracking-tight">Hollow</span>
          <span className="hidden lg:inline text-sm text-muted-foreground">{slogan}</span>
        </Link>

        <form onSubmit={handleSubmit} className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search photos..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchValue && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>

        <nav className="hidden md:flex items-center gap-8 shrink-0">
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
    </header>
  );
}
