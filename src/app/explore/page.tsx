'use client';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, LoaderCircle, Github, GitBranch, Terminal, FileCode, Presentation } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { handleRepoExplorerAction, type RepoExplorerState, initialState } from './actions';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthWidget } from '@/components/github-agent/AuthWidget';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function RepoUrlForm() {
    const { pending } = useFormStatus();
    return (
        <div className="space-y-4">
             <input type="hidden" name="step" value="listFiles" />
            <div className="space-y-2">
                <Label htmlFor="repoUrl">GitHub Repository URL</Label>
                <Input id="repoUrl" name="repoUrl" placeholder="https://github.com/example/repo" required disabled={pending} />
            </div>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                {pending ? (
                    <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Listing Files...
                    </>
                ) : (
                    <>
                    List Files
                    <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </div>
    );
}

function FileSelectForm({ files, repoUrl }: { files: string[], repoUrl: string }) {
    const { pending } = useFormStatus();
    return (
        <div className="space-y-4">
            <input type="hidden" name="step" value="explainFile" />
            <input type="hidden" name="repoUrl" value={repoUrl} />
            <div className="space-y-2">
                <Label htmlFor="filePath">Select a file to explain</Label>
                <Select name="filePath" required disabled={pending}>
                    <SelectTrigger>
                        <SelectValue placeholder="Click to select a file..." />
                    </SelectTrigger>
                    <SelectContent>
                        {files.map(file => (
                            <SelectItem key={file} value={file}>{file}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
                 {pending ? (
                    <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Explaining...
                    </>
                ) : (
                    <>
                    Explain File
                    <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </div>
    );
}

function FileListDisplay({ files, repoUrl }: { files: string[], repoUrl: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5"/> Files in {new URL(repoUrl).pathname}
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {files.map(file => (
                    <div key={file} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md truncate">
                        <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="truncate" title={file}>{file}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

function ExplanationResult({ data }: { data: RepoExplorerState['explanationResult'] }) {
    if (!data) return null;
    return (
        <div className="space-y-8 mt-8">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Presentation />Explanation for {data.filePath}</CardTitle>
                </CardHeader>
                <CardContent>
                     <div
                        className="prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: data.explanation.replace(/\\n/g, '<br />') }}
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><FileCode />File Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <pre className='text-sm bg-muted p-4 rounded-lg overflow-x-auto'><code>{data.fileContent}</code></pre>
                </CardContent>
            </Card>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </CardContent>
        </Card>
    )
}

export default function ExplorePage() {
  const [state, formAction] = useActionState(handleRepoExplorerAction, initialState);
  const { pending } = useFormStatus();

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
                className="flex items-center gap-1 text-foreground font-semibold"
              >
                <GitBranch className="h-4 w-4" />
                Repo Explorer
              </Link>
          </nav>
        </div>
        <AuthWidget />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-6">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-headline">GitHub Repo Explorer</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
                    Enter a GitHub repository URL to list its files, then select a file to get an AI-powered explanation.
                </p>
            </div>

            <form action={formAction}>
                 {state.step === 'initial' && (
                    <Card className="shadow-lg">
                        <CardContent className="p-6">
                           <RepoUrlForm />
                        </CardContent>
                    </Card>
                )}

                {(state.step === 'files_listed' || state.step === 'explanation_generated') && state.files && state.repoUrl && (
                    <div className="space-y-6">
                        <FileListDisplay files={state.files} repoUrl={state.repoUrl} />
                        <Card className="shadow-lg">
                            <CardContent className="p-6">
                                <FileSelectForm files={state.files} repoUrl={state.repoUrl} />
                            </CardContent>
                        </Card>
                    </div>
                )}
            </form>

            {state.error && (
                <Alert variant="destructive" className="mt-4">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            )}

            {pending && <LoadingSkeleton />}

            {state.step === 'explanation_generated' && (
                <ExplanationResult data={state.explanationResult} />
            )}
        </div>
      </main>
    </div>
  );
}