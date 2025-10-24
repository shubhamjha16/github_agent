'use client';
import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, LoaderCircle, Github, BookCopy, Terminal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleExplainSubmission, type ExplainFormState } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthWidget } from '@/components/github-agent/AuthWidget';

const initialState: ExplainFormState = {
    data: null,
    error: null,
    success: false,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? (
            <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            Explaining...
            </>
        ) : (
            <>
            Explain Code
            <ArrowRight className="ml-2 h-4 w-4" />
            </>
        )}
        </Button>
    );
}

function ResultDisplay({ data, isLoading }: { data: ExplainFormState['data'], isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Code</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Explanation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Skeleton className="h-8 w-1/3" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-3/4" />
                         <Skeleton className="h-8 w-1/4 mt-4" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!data) return null;

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Code</CardTitle>
                    <p className='text-sm text-muted-foreground'>{data.filePath}</p>
                </CardHeader>
                <CardContent>
                    <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto"><code>{data.content}</code></pre>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Explanation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: data.explanation.replace(/\n/g, '<br />') }}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default function ExplainPage() {
  const [state, formAction] = useActionState(handleExplainSubmission, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();
  const { user, isUserLoading } = useUser();

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
                href="/explain"
                className="flex items-center gap-1 text-foreground font-semibold"
              >
                <BookCopy className="h-4 w-4" />
                Code Explainer
              </Link>
          </nav>
        </div>
        <AuthWidget />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Code Explainer</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Enter a GitHub repository URL and a file path to get a detailed explanation of the code.
                </p>
            </div>

            <Card className="shadow-lg">
                <CardContent className="p-6">
                    {!user && !isUserLoading && (
                        <Alert>
                            <AlertTitle>Please Log In</AlertTitle>
                            <AlertDescription>You need to be logged in to use the Code Explainer.</AlertDescription>
                        </Alert>
                    )}
                    <form action={formAction} ref={formRef} className="space-y-4 mt-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="repoUrl">Repository URL</Label>
                                <Input id="repoUrl" name="repoUrl" placeholder="https://github.com/example/repo" required disabled={!user || pending} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="filePath">File Path</Label>
                                <Input id="filePath" name="filePath" placeholder="src/components/button.tsx" required disabled={!user || pending} />
                            </div>
                        </div>
                        <SubmitButton />
                    </form>
                </CardContent>
            </Card>

            {state.error && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}

            {(pending || (state.success && state.data)) && (
               <ResultDisplay data={state.data} isLoading={pending} />
            )}
        </div>
      </main>
    </div>
  );
}
