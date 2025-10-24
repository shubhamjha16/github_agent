'use client';
import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, LoaderCircle, Github, BookCopy, Terminal, FileCode, Presentation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useUser } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleExplainSubmission, type ExplainFormState } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthWidget } from '@/components/github-agent/AuthWidget';
import { Separator } from '@/components/ui/separator';

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
            Analyzing...
            </>
        ) : (
            <>
            Explain Page
            <ArrowRight className="ml-2 h-4 w-4" />
            </>
        )}
        </Button>
    );
}

function ResultDisplay({ data, isLoading }: { data: ExplainFormState['data'], isLoading: boolean }) {
    if (isLoading) {
        return (
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Presentation /> Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><FileCode /> Code Explanation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-full" />
                         <Skeleton className="h-4 w-3/4" />
                         <Skeleton className="h-4 w-full mt-4" />
                         <Skeleton className="h-4 w-full" />
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!data) return null;

    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Presentation /> Summary</CardTitle>
                    <p className='text-sm text-muted-foreground'>{data.url}</p>
                </CardHeader>
                <CardContent>
                    <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: data.summary.replace(/\n/g, '<br />') }}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileCode /> Code Explanation</CardTitle>
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

  const isFormDisabled = pending || isUserLoading;

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
                Web Explainer
              </Link>
          </nav>
        </div>
        <AuthWidget />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">Web Page Explainer</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Enter any URL to get a high-level summary and a detailed code explanation.
                </p>
            </div>

            <Card className="shadow-lg">
                <CardContent className="p-6">
                    <form action={formAction} ref={formRef} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">Web Page URL</Label>
                            <Input id="url" name="url" placeholder="https://example.com" required disabled={isFormDisabled} />
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
