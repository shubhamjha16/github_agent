'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Terminal } from 'lucide-react';

type CommandItemProps = {
  command: string;
};

export function CommandItem({ command }: CommandItemProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setHasCopied(true);
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-3 pl-4 pr-2 shadow-sm transition-colors hover:bg-muted/50">
      <Terminal className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
      <code className="font-code text-sm flex-1 truncate" title={command}>
        {command}
      </code>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCopy}
        aria-label="Copy command"
        className="flex-shrink-0"
      >
        {hasCopied ? (
          <Check className="h-4 w-4 text-accent" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
