'use client';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, LoaderCircle, Github, GitBranch, Terminal, Bot, FileCode, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleAgenticExplorerAction, type AgenticExplorerState } from './actions';
import { AuthWidget } from '@/components/github-agent/AuthWidget';

const initialState: AgenticExplorerState = {
  result: null,
  error: null,
  isSubmitting: false,
};

function AgentForm({ isSubmitting }: { isSubmitting: boolean }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="repoUrl">GitHub Repository URL</Label>
          <Input
            id="repoUrl"
            name="repoUrl"
            placeholder="https://github.com/example/repo"
            required
            disabled={isSubmitting}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="question">Your Question</Label>
          <Input
            id="question"
            name="question"
            placeholder="e.g., What is the purpose of this app?"
            required
            disabled={isSubmitting}
          />
        </div>
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Thinking...
          </>
        ) : (
          <>
            Ask Agent
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  );
}

function ResultDisplay({ result }: { result: AgenticExplorerState['result'] }) {
  if (!result) return null;

  const formattedAnswer = result.answer.replace(
    /```([\s\S]*?)```/g,
    '<pre class="text-sm bg-muted p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>'
  );

  return (
    <div className="space-y-8 mt-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Agent&apos;s Answer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: formattedAnswer.replace(/\\n/g, '<br />').replace(/(\r\n|\n|\r)/gm, '<br />'),
            }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode />
            Files Inspected
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {result.filesInspected.map((file) => (
                <div key={file} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md truncate">
                    <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate" title={file}>{file}</span>
                </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="flex items-center gap-4">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary"/>
                    <div className="space-y-1">
                        <p className="font-medium text-lg">
                           AI agent is analyzing the repository...
                        </p>
                        <p className="text-muted-foreground text-sm">
                            This may take a few moments as it inspects files.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default function AgenticExplorerPage() {
  const [state, formAction] = useActionState(handleAgenticExplorerAction, initialState);
  const isSubmitting = state.isSubmitting;

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
              className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
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
              className="flex items-center gap-1 text-foreground font-semibold"
            >
              <Bot className="h-4 w-4" />
              Agentic Explorer
            </Link>
          </nav>
        </div>
        <AuthWidget />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Agentic Repo Explorer</h2>
            <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
              Ask a high-level question about a GitHub repository, and let the AI agent explore the code to find the answer for you.
            </p>
          </div>

          <form action={formAction}>
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <AgentForm isSubmitting={isSubmitting} />
              </CardContent>
            </Card>
          </form>

          {state.error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {isSubmitting && <LoadingSkeleton />}
          
          {state.result && !isSubmitting && <ResultDisplay result={state.result} />}
        </div>
      </main>
    </div>
  );
}
