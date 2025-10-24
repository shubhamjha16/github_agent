import type { GenerateGitCommandsFromPromptOutput } from '@/ai/flows/generate-git-commands-from-prompt';
import { CommandItem } from './CommandItem';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';

type CommandListProps = {
  result: GenerateGitCommandsFromPromptOutput | null;
  isLoading: boolean;
};

function LoadingSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div>
                <Skeleton className="h-6 w-1/4 mb-3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
            </div>
            <Separator />
            <div className="space-y-4">
                <Skeleton className="h-6 w-1/3 mb-3" />
                <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg border">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                </div>
            </div>
        </div>
    )
}

export function CommandList({ result, isLoading }: CommandListProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!result) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold font-headline">Explanation</h3>
        <p className="text-muted-foreground">{result.explanation}</p>
      </div>
      <Separator />
      <div>
        <h3 className="text-lg font-semibold font-headline">Generated Commands</h3>
        <p className="text-muted-foreground mb-4">Click the icon to copy a command.</p>
        <div className="space-y-3">
          {result.commands.map((command, index) => (
            <CommandItem key={index} command={command} />
          ))}
        </div>
      </div>
    </div>
  );
}
