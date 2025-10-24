import { AuthWidget } from '@/components/github-agent/AuthWidget';
import { CommandGenerator } from '@/components/github-agent/CommandGenerator';
import { Github, BookCopy, Terminal, GitBranch, Bot } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-4">
          <h1 className="flex items-center gap-2 text-xl font-semibold">
            <Github className="h-6 w-6" />
            <span className="font-headline">GitHub Agent</span>
          </h1>
          <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link
              href="/"
              className="flex items-center gap-1 text-foreground font-semibold"
            >
              <Terminal className="h-4 w-4" />
              Command Generator
            </Link>
            <Link
                href="/explore"
                className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <GitBranch className="h-4 w-4" />
                Repo Explorer
              </Link>
            <Link
                href="/agentic-explorer"
                className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Bot className="h-4 w-4" />
                Agentic Explorer
              </Link>
          </nav>
        </div>
        <AuthWidget />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-4xl gap-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Git commands, simplified.</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Describe what you want to do with your repository, and let our AI generate the exact Git commands for you.
            </p>
          </div>
          <CommandGenerator />
        </div>
      </main>
      <footer className="flex items-center justify-center p-4 border-t">
        <p className="text-sm text-muted-foreground">built by Shubham Jha, Vansh Pawar, Prashant Mahawar, and Yash Sriwastava</p>
      </footer>
    </div>
  );
}
