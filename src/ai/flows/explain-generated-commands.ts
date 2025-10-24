'use server';

/**
 * @fileOverview Explains the meaning of generated Git commands.
 *
 * - explainGeneratedCommands - A function that takes a Git command and returns an explanation.
 * - ExplainGeneratedCommandsInput - The input type for the explainGeneratedCommands function.
 * - ExplainGeneratedCommandsOutput - The return type for the explainGeneratedCommands function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainGeneratedCommandsInputSchema = z.object({
  gitCommand: z.string().describe('The Git command to explain.'),
});

export type ExplainGeneratedCommandsInput = z.infer<
  typeof ExplainGeneratedCommandsInputSchema
>;

const ExplainGeneratedCommandsOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the Git command.'),
});

export type ExplainGeneratedCommandsOutput = z.infer<
  typeof ExplainGeneratedCommandsOutputSchema
>;

export async function explainGeneratedCommands(
  input: ExplainGeneratedCommandsInput
): Promise<ExplainGeneratedCommandsOutput> {
  return explainGeneratedCommandsFlow(input);
}

const explainGeneratedCommandsPrompt = ai.definePrompt({
  name: 'explainGeneratedCommandsPrompt',
  input: {schema: ExplainGeneratedCommandsInputSchema},
  output: {schema: ExplainGeneratedCommandsOutputSchema},
  prompt: `You are an expert in Git, skilled at explaining commands in plain language.
  Explain the following Git command:
  {{gitCommand}}`,
});

const explainGeneratedCommandsFlow = ai.defineFlow(
  {
    name: 'explainGeneratedCommandsFlow',
    inputSchema: ExplainGeneratedCommandsInputSchema,
    outputSchema: ExplainGeneratedCommandsOutputSchema,
  },
  async input => {
    const {output} = await explainGeneratedCommandsPrompt(input);
    return output!;
  }
);
