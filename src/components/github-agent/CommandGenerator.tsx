'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { handlePromptSubmission, type FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { CommandList } from './CommandList';
import { Card, CardContent } from '../ui/card';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

const initialState: FormState = {
  data: null,
  error: null,
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          Generate
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}

export function CommandGenerator() {
  const [state, formAction] = useActionState(handlePromptSubmission, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const { pending } = useFormStatus();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state.error, toast]);
  
  useEffect(() => {
    if(state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);


  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <form action={formAction} ref={formRef} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Input
                name="prompt"
                placeholder="e.g., stage all changes and commit with message 'feat: new feature'"
                className="flex-grow"
                required
                disabled={pending}
              />
              <SubmitButton />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="execute" name="execute" disabled={pending} />
              <Label htmlFor="execute" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Execute commands after generating
              </Label>
            </div>
          </form>
        </CardContent>
      </Card>
      
      { (pending || (state.success && state.data)) && (
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <CommandList result={state.data} isLoading={pending} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
