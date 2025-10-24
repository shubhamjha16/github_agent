'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate Git commands from a user prompt.
 *
 * - generateGitCommandsFromPrompt - A function that generates Git commands based on a user prompt.
 * - GenerateGitCommandsFromPromptInput - The input type for the generateGitCommandsFromPrompt function.
 * - GenerateGitCommandsFromPromptOutput - The return type for the generateGitCommandsFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateGitCommandsFromPromptInputSchema = z.object({
  prompt: z.string().describe('A prompt describing a Git task (e.g., \'commit my changes with message X\').'),
});
export type GenerateGitCommandsFromPromptInput = z.infer<typeof GenerateGitCommandsFromPromptInputSchema>;

const GenerateGitCommandsFromPromptOutputSchema = z.object({
  commands: z.array(z.string()).describe('An array of Git commands corresponding to the prompt.'),
  explanation: z.string().describe('An explanation of the generated Git commands.'),
});
export type GenerateGitCommandsFromPromptOutput = z.infer<typeof GenerateGitCommandsFromPromptOutputSchema>;

export async function generateGitCommandsFromPrompt(input: GenerateGitCommandsFromPromptInput): Promise<GenerateGitCommandsFromPromptOutput> {
  return generateGitCommandsFromPromptFlow(input);
}

const generateGitCommandsPrompt = ai.definePrompt({
  name: 'generateGitCommandsPrompt',
  input: {schema: GenerateGitCommandsFromPromptInputSchema},
  output: {schema: GenerateGitCommandsFromPromptOutputSchema},
  prompt: `You are a Git command expert. Generate the necessary Git commands to fulfill the user's request. Also provide a brief explanation of what the commands do.

Request: {{{prompt}}}

Output in JSON format:
{
  "commands": ["command1", "command2", ...],
  "explanation": "Explanation of the commands."
}
`,
});

const generateGitCommandsFromPromptFlow = ai.defineFlow(
  {
    name: 'generateGitCommandsFromPromptFlow',
    inputSchema: GenerateGitCommandsFromPromptInputSchema,
    outputSchema: GenerateGitCommandsFromPromptOutputSchema,
  },
  async input => {
    const {output} = await generateGitCommandsPrompt(input);
    return output!;
  }
);
